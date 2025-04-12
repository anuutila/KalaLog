import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Event from '@/lib/mongo/models/event';
import '@/lib/mongo/models/user';
import { IEvent, IEventSchema, PopulatedUserDetails, PopulatedEvent, CreateEventInputSchema } from '@/lib/types/event';
import { ErrorResponse, EventCreatedResponse, EventsResponse } from '@/lib/types/responses';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { Types } from 'mongoose';
import { editorRoles, UserRole } from '@/lib/types/user';

export async function GET(): Promise<NextResponse<EventsResponse | ErrorResponse>> {
  try {
    // await requireRole(allRoles); // Public access for now
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
        } : null,
        participants: (event.participants ?? []).map(p => p ? {
          id: p._id?.toString(),
          username: p.username ?? '',
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
        } : null),
        unregisteredParticipants: event.unregisteredParticipants ?? [],
        bodiesOfWater: event.bodiesOfWater,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };

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
  try {
    const { id: userId } = (await requireRole([UserRole.TRUSTED_CREATOR, ...editorRoles])).data;
    await dbConnect();
    const body = await req.json();

    const validatedInput = CreateEventInputSchema.parse(body);

    console.log('Creating new event with input:', validatedInput);

    // Prepare data for saving (convert IDs to ObjectIds)
    const eventToSave = {
      ...validatedInput,
      participants: validatedInput.participants.map(id => new Types.ObjectId(id)),
      unregisteredParticipants: validatedInput.unregisteredParticipants ?? [],
      createdBy: new Types.ObjectId(userId), // Use authenticated user ID
    };

    // Create the event in the database
    const newEvent = await Event.create(eventToSave);
    if (!newEvent) throw new Error('Failed to save event to database.');

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
      } : null,
      participants: (populatedEvent.participants ?? []).map(p => p ? {
        id: p._id?.toString(),
        username: p.username ?? '',
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
      } : null),
      unregisteredParticipants: validatedInput.unregisteredParticipants ?? [],
      bodiesOfWater: populatedEvent.bodiesOfWater,
      createdAt: populatedEvent.createdAt,
      updatedAt: populatedEvent.updatedAt,
    };

    // Parse the final response object with the main IEventSchema
    const validatedResponse = IEventSchema.parse(responseEventData);

    return NextResponse.json<EventCreatedResponse>(
      { message: 'Event created successfully.', data: validatedResponse },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleError(error, 'Failed to create event.');
  }
}
