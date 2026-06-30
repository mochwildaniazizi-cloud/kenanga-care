export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
}

export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/Logo.png",
      badge: "/Logo.png",
      ...options,
    });
  } else if (Notification.permission !== "denied") {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        new Notification(title, {
          icon: "/Logo.png",
          badge: "/Logo.png",
          ...options,
        });
      }
    });
  }
}
