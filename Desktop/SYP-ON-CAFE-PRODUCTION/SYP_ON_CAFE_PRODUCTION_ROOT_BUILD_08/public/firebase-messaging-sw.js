importScripts("https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAioypkouwU9yPdsFn6MnUB6tXzHI8uDSQ",
  authDomain: "syp-on-cafe.firebaseapp.com",
  projectId: "syp-on-cafe",
  storageBucket: "syp-on-cafe.firebasestorage.app",
  messagingSenderId: "780485777526",
  appId: "1:780485777526:web:26496a54c7c5617c582757",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  self.registration.showNotification(notification.title || "SYP ON CAFÉ", {
    body: notification.body || "You have a new SYP ON CAFÉ notification.",
    icon: "/brand/syp-logo-clean-v2.webp",
    badge: "/brand/syp-logo-clean-v2.webp",
    tag: data.tag || data.order_number || "syp-admin-alert",
    requireInteraction: data.priority === "high",
    data: { url: data.url || "/admin" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || "/admin";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(destination);
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(destination) : undefined;
    }),
  );
});
