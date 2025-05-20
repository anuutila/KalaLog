import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import PushSubscriptionModel from '@/lib/mongo/models/pushSubscription';
import { handleError } from '@/lib/utils/handleError';
import { initializeWebPush, webpush as configuredWebpush } from '@/lib/webpush/webpush';
import { requireRole } from '@/lib/utils/authorization';
import { allRoles } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { BaseResponse, ErrorResponse } from '@/lib/types/responses';

initializeWebPush();

export async function POST(req: NextRequest): Promise<NextResponse<BaseResponse | ErrorResponse>> {
  try {
    const { id: userId } = (await requireRole(allRoles)).data;
    await dbConnect();

    const userSubscriptions = await PushSubscriptionModel.find({ userId: userId });

    if (!userSubscriptions || userSubscriptions.length === 0) {
      throw new CustomError(`No subscriptions found for user ${userId}`, 404);
    }

    const notificationPayload = JSON.stringify({
      title: 'Test Notification',
      body: 'The notifications are working!',
      icon: '/kalalog_icon_maskable_gradient-512.png',
      data: { url: '/' }
    });

    let allSentSuccessfully = true;
    const sendResults = [];

    for (const subDoc of userSubscriptions) {
      const sub = subDoc.subscriptionObject as import('web-push').PushSubscription;
      try {
        await configuredWebpush.sendNotification(sub, notificationPayload);
        sendResults.push({ endpoint: sub.endpoint, success: true });
        console.log(`Sent test notification to endpoint: ${sub.endpoint}`);
      } catch (error: any) {
        allSentSuccessfully = false;
        sendResults.push({ endpoint: sub.endpoint, success: false, error: error.message });
        console.error(`Failed to send test notification to ${sub.endpoint}:`, error.body || error.message || error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Subscription ${sub.endpoint} is invalid. Removing.`);
          await PushSubscriptionModel.deleteOne({ 'subscriptionObject.endpoint': sub.endpoint }).exec();
        }
      }
    }

    if (allSentSuccessfully) {
      return NextResponse.json<BaseResponse>({ message: 'Test notification(s) sent successfully.' }, { status: 200 });
    } else {
      return NextResponse.json<BaseResponse>(
        {
          message: 'Some test notifications could not be sent.'
        },
        { status: 207 } // Multi-Status
      );
    }

  } catch (error) {
    return handleError(error, 'Failed to send test notification(s)');
  }
}