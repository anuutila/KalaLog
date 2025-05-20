import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import PushSubscriptionModel from '@/lib/mongo/models/pushSubscription';
import { requireRole }
from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { allRoles } from '@/lib/types/user';
import { BaseResponse, ErrorResponse } from '@/lib/types/responses';

export async function POST(req: NextRequest): Promise<NextResponse<BaseResponse | ErrorResponse>> {
  try {
    const { id: userId } = (await requireRole(allRoles)).data;
    await dbConnect();

    const subscriptionObject = await req.json();

    console.log('Received subscription object:', subscriptionObject);

    // Basic validation for the subscription object
    if (!subscriptionObject || !subscriptionObject.endpoint || !subscriptionObject.keys?.p256dh || !subscriptionObject.keys?.auth) {
      return handleError(null, 'Invalid subscription object provided', 400);
    }

    await PushSubscriptionModel.findOneAndUpdate(
      { 'subscriptionObject.endpoint': subscriptionObject.endpoint }, // Query by endpoint
      {
        userId: userId,
        subscriptionObject: subscriptionObject,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Subscription saved/updated for user ${userId}, endpoint: ${subscriptionObject.endpoint}`);
    return NextResponse.json<BaseResponse>({ message: 'Subscription saved successfully' }, { status: 201 });

  } catch (error) {
    return handleError(error, 'Failed to save push subscription');
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<BaseResponse | ErrorResponse>> {
  try {
    const { id: userId } = (await requireRole(allRoles)).data;
    await dbConnect();

    const { endpoint } = await req.json();

    if (!endpoint) {
      return handleError(null, 'Endpoint missing in request', 400);
    }

    const result = await PushSubscriptionModel.deleteOne({
      'subscriptionObject.endpoint': endpoint,
      userId: userId,
    });

    if (result.deletedCount === 0) {
      console.log(`No subscription found to delete for endpoint: ${endpoint} and user ${userId}`);
      return handleError(null, 'Subscription not found or not authorized to delete', 404);
    }

    console.log(`Subscription deleted for endpoint: ${endpoint}`);
    return NextResponse.json<BaseResponse>({ message: 'Subscription deleted successfully' }, { status: 200 });

  } catch (error) {
    return handleError(error, 'Failed to delete push subscription');
  }
}