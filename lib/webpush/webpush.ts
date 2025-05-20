import webpush from 'web-push';

let vapidDetailsSet = false;

export function initializeWebPush() {
  if (vapidDetailsSet) {
    return;
  }

  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:kalalog.contact@gmail.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('WebPush VAPID details configured.');
    vapidDetailsSet = true;
  } else {
    console.warn('VAPID keys not configured. Push notifications will not work.');
  }
}

export { webpush };