import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Listen for push events
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || "New Notification";
    const options: NotificationOptions = {
      body: data.body || "Someone caught a fish!",
      icon: data.icon || "/kalalog_icon_maskable_gradient-192.png",
      badge: data.badge || "/kalalog_icon_maskable_gradient-192.png",
      data: data.data,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } else {
    console.log("Push event but no data");
  }
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/catches';

  event.waitUntil(self.clients.openWindow(urlToOpen));
});