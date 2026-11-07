export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export interface DeadlineStatus {
  status: 'urgent-red' | 'warning-yellow' | 'normal';
  label: string;
  diffDays: number | null;
}

/**
 * Calculates deadline proximity:
 * - diffDays <= 2 days (or overdue): urgent-red (close to 1-2 days)
 * - diffDays <= 5 days: warning-yellow (getting closer in 5 days)
 * - otherwise: normal
 */
export function getDeadlineStatus(dueDateStr?: string | null, isCompleted?: boolean): DeadlineStatus {
  if (!dueDateStr || isCompleted) {
    return { status: 'normal', label: '', diffDays: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'urgent-red', label: `${Math.abs(diffDays)}d Overdue`, diffDays };
  }
  if (diffDays === 0) {
    return { status: 'urgent-red', label: 'Due Today', diffDays };
  }
  if (diffDays <= 2) {
    return { status: 'urgent-red', label: `Due in ${diffDays}d`, diffDays };
  }
  if (diffDays <= 5) {
    return { status: 'warning-yellow', label: `Due in ${diffDays}d`, diffDays };
  }

  return { status: 'normal', label: '', diffDays };
}

/**
 * Triggers native system browser notification if supported and permission is granted.
 */
export function triggerSystemNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}
