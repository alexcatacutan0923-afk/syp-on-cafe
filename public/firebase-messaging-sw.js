importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

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

  self.registration.showNotification(
    notification.title || "SYP ON CAFÉ",
    {
      body:
        notification.body ||
        "You have a new notification.",
      icon: "/brand/syp-logo-clean-v2.webp",
      badge: "/brand/syp-logo-clean-v2.webp",
      data: {
        url: data.url || "/",
      },
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(event.notification.data.url);
          return client.focus();
        }
      }

      return clients.openWindow(event.notification.data.url);
    })
  );
});