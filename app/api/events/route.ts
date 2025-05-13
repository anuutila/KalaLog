import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Event from '@/lib/mongo/models/event';
import '@/lib/mongo/models/user';
import { IEvent, IEventSchema, PopulatedUserDetails, PopulatedEvent, CreateEventInputSchema, CreateEventData } from '@/lib/types/event';
import { ErrorResponse, EventCreatedResponse, EventsResponse } from '@/lib/types/responses';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { Types } from 'mongoose';
import { editorRoles, UserRole } from '@/lib/types/user';
import { cookies } from 'next/headers';
import { ApiEndpoints } from '@/lib/constants/constants';
import { AuthStatus, getAuthStatus, userIsAllowedToViewImage } from '@/lib/utils/apiUtils/authUtils';
import { generateSignedImageUrl } from '@/lib/utils/apiUtils/apiUtils';
import { generateEventFolderName, generateEventPublicId } from '@/lib/utils/cloudinaryUtils';

export async function GET(): Promise<NextResponse<EventsResponse | ErrorResponse>> {
  try {
    // await requireRole(allRoles); // Public access for now

    // Check the auth status of the requester
    const auth: AuthStatus = await getAuthStatus();

    await dbConnect();

    console.log('Fetching all events with population...');
    const eventsFromDb = await Event.find({})
      .sort({ startDate: -1 })
      // Select specific fields for population
      .populate<{ createdBy: PopulatedUserDetails }>('createdBy', 'id username firstName lastName')
      .populate<{ participants: PopulatedUserDetails[] }>('participants', 'id username firstName lastName')
      .lean();

    console.log(`Found ${eventsFromDb.length} events`);

    // Validate and transform the data
    const validatedEvents: IEvent[] = (eventsFromDb as PopulatedEvent[]).map(event => {
      // Prepare data for Zod parsing, directly passing populated objects
      const eventData = {
        id: event._id?.toString(),
        name: event.name ?? '',
        startDate: event.startDate ?? '',
        endDate: event.endDate ?? '',
        createdBy: event.createdBy ? {
          id: event.createdBy._id?.toString(),
          username: event.createdBy.username ?? '',
          firstName: event.createdBy.firstName ?? '',
          lastName: event.createdBy.lastName ?? '',
        } : {
          id: 'unknown',
          username: 'unknown',
          firstName: 'unknown',
          lastName: 'unknown',
        },
        participants: (event.participants ?? []).map(p => p ? {
          id: p._id?.toString(),
          username: p.username ?? '',
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
        } : null),
        unregisteredParticipants: event.unregisteredParticipants ?? [],
        bodiesOfWater: event.bodiesOfWater,
        images: event.images?.map(image => ({
          publicId: image.publicId,
          description: image.description ?? null,
          coverImage: image.coverImage ?? false,
          publicAccess: image.publicAccess ?? false,
        })),
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };

      const processedImages = eventData?.images?.map(img => {
        let signedUrl: string | undefined = undefined;
        if (img.publicAccess) { // Image is marked public
          signedUrl = generateSignedImageUrl(img.publicId);
        } else if (userIsAllowedToViewImage(auth, eventData.createdBy.id)) {
          signedUrl = generateSignedImageUrl(img.publicId);
        }
        console.log('Image:', img.publicId, 'Signed URL:', signedUrl);
        return { ...img, signedUrl };
      });

      if (processedImages) {
        console.log('Processed images:', processedImages);
        eventData.images = processedImages;
      }

      // Parse using IEventSchema which expects populated user objects
      return IEventSchema.parse(eventData);
    });


    return NextResponse.json<EventsResponse>(
      { message: 'Events retrieved successfully.', data: validatedEvents },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'Failed to retrieve events.');
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<EventCreatedResponse | ErrorResponse>> {
  const uploadedImages: { publicId: string; coverImage: boolean; publicAccess: boolean; description?: string | null }[] = [];

  const cookieStore = await cookies();
  const token = cookieStore.get('KALALOG_TOKEN')?.value;

  try {
    const { id: userId } = (await requireRole([UserRole.TRUSTED_CREATOR, ...editorRoles])).data;
    await dbConnect();

    const eventAndImageData = await req.formData();

    const imageFiles: File[] = [];
    const eventData: Record<string, any> = {};
    const imageMetadataMap: Map<number, { coverImage: boolean; publicAccess: boolean }> = new Map();

    for (const [key, value] of eventAndImageData.entries()) {
      if (key === 'addedImages' && value instanceof File) {
        imageFiles.push(value);
      } else if (key.startsWith('imageMetadata_') && typeof value === 'string') {
        const index = parseInt(key.split('_')[1], 10);
        if (!isNaN(index)) {
          try {
            imageMetadataMap.set(index, JSON.parse(value));
          } catch (e) {
            console.error(`Failed to parse metadata for image index ${index}:`, value);
            imageMetadataMap.set(index, { coverImage: false, publicAccess: false }); // Default on parse error
          }
        }
      } else if (key === 'participants' && typeof value === 'string') {
        eventData.participants = JSON.parse(value);
      } else if (key === 'unregisteredParticipants' && typeof value === 'string') {
        eventData.unregisteredParticipants = JSON.parse(value);
      } else if (key === 'bodiesOfWater' && typeof value === 'string') {
        eventData.bodiesOfWater = JSON.parse(value);
      } else {
        eventData[key] = value;
      }
    }

    const validatedInput = CreateEventInputSchema.parse(eventData);

    const eventNameAndId = validatedInput.name + '_' + validatedInput._id;

    // Handle image uploads
    const failedImageUploads = [];
    for (const [index, image] of imageFiles.entries()) {
      try {
        // Generate folder and public_id based on catchNumber and index
        const folderName = generateEventFolderName(eventNameAndId);
        const publicId = generateEventPublicId(eventNameAndId, index + 1);

        const formData = new FormData();
        formData.append('file', image);
        formData.append('folder', folderName);
        formData.append('publicId', publicId);

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBase}${ApiEndpoints.UploadEventImage}`, {
          method: 'POST',
          headers: {
            Cookie: `KALALOG_TOKEN=${token}`, // Include the JWT token
          },
          body: formData,
        });

        if (response.ok) {
          const metadata = imageMetadataMap.get(index) || { coverImage: false, publicAccess: false };
          uploadedImages.push({
            publicId: `${folderName}/${publicId}`,
            coverImage: metadata.coverImage,
            publicAccess: metadata.publicAccess,
          });
        } else {
          throw new Error();
        }
      } catch (error) {
        console.error(`Failed to upload image: ${generateEventPublicId(eventNameAndId, index)}`, error);
        failedImageUploads.push(image);
      }
    }

    const eventDataWithImageIds: CreateEventData = {
      ...validatedInput,
      images: uploadedImages
    };

    // Validate again with Zod
    const validatedEventData = CreateEventInputSchema.parse(eventDataWithImageIds);

    // console.log('Validated Data:', validatedEventData);
    console.log('Image Files:', imageFiles);

    // Prepare data for saving (convert IDs to ObjectIds)
    const eventToSave = {
      ...validatedEventData,
      _id: new Types.ObjectId(validatedEventData._id),
      participants: validatedEventData.participants.map(id => new Types.ObjectId(id)),
      unregisteredParticipants: validatedEventData.unregisteredParticipants ?? [],
      createdBy: new Types.ObjectId(userId), // Use authenticated user ID
    };

    console.log('Event to save:', eventToSave);

    // Create the event in the database
    const newEvent = await Event.create(eventToSave);
    if (!newEvent) {
      throw new Error('Failed to save event to database.');
    }

    // Fetch the newly created event WITH population for the response
    const responseEvent = await Event.findById(newEvent._id)
      .populate<{ createdBy: PopulatedUserDetails }>('createdBy', 'id username firstName lastName')
      .populate<{ participants: PopulatedUserDetails[] }>('participants', 'id username firstName lastName')
      .lean();
    if (!responseEvent) throw new Error('Failed to retrieve created event after save.');

    const populatedEvent = responseEvent as PopulatedEvent;

    // Prepare the response object matching the IEventSchema
    const responseEventData = {
      id: populatedEvent._id?.toString(),
      name: populatedEvent.name ?? '',
      startDate: populatedEvent.startDate ?? '',
      endDate: populatedEvent.endDate ?? '',
      createdBy: populatedEvent.createdBy ? {
        id: populatedEvent.createdBy._id?.toString(),
        username: populatedEvent.createdBy.username ?? '',
        firstName: populatedEvent.createdBy.firstName ?? '',
        lastName: populatedEvent.createdBy.lastName ?? '',
      } : {
        id: 'unknown',
        username: 'unknown',
        firstName: 'unknown',
        lastName: 'unknown',
      },
      participants: (populatedEvent.participants ?? []).map(p => p ? {
        id: p._id?.toString(),
        username: p.username ?? '',
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
      } : null),
      unregisteredParticipants: validatedInput.unregisteredParticipants ?? [],
      bodiesOfWater: populatedEvent.bodiesOfWater,
      images: populatedEvent.images?.map(image => ({
        publicId: image.publicId,
        description: image.description ?? null,
        coverImage: image.coverImage ?? false,
        publicAccess: image.publicAccess ?? false,
      })),
      createdAt: populatedEvent.createdAt,
      updatedAt: populatedEvent.updatedAt,
    };

    // Parse the final response object with the main IEventSchema
    const validatedResponse: IEvent = IEventSchema.parse(responseEventData);

    if (failedImageUploads.length > 0) {
      return NextResponse.json<EventCreatedResponse>(
        {
          message: `Event created successfully, but ${failedImageUploads.length} image(s) failed to upload.`,
          data: {
            event: validatedResponse,
            failedImageUploads: true,
          },
        },
        { status: 207 }
      );
    }

    return NextResponse.json<EventCreatedResponse>(
      {
        message: 'Event created successfully.',
        data: { event: validatedResponse, failedImageUploads: false }
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error during event creation:', error);

    // Rollback image uploads
    const publicIds = uploadedImages.map((img) => img.publicId);
    const deleteFolder = true;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBase}${ApiEndpoints.DeleteImages}`, {
      method: 'POST',
      headers: {
        Cookie: `KALALOG_TOKEN=${token}`, // Include the JWT token
      },
      body: JSON.stringify({ publicIds, deleteFolder }),
    });
    console.log('Rollback response:', response);

    return handleError(error, 'Failed to create event. Please try again later.');
  }
}
