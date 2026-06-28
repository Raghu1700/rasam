// Live-status options the user can pick from. `emoji` is used in the UI and
// the Android widget; `key` is what we store in Firestore.
export const STATUS_OPTIONS = [
  { key: 'free', label: 'Free', emoji: '💚' },
  { key: 'working', label: 'Working', emoji: '💻' },
  { key: 'sleeping', label: 'Sleeping', emoji: '😴' },
  { key: 'eating', label: 'Eating', emoji: '🍜' },
  { key: 'commuting', label: 'Commuting', emoji: '🚌' },
  { key: 'studying', label: 'Studying', emoji: '📚' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮' },
  { key: 'busy', label: 'Busy', emoji: '⛔' },
  { key: 'offline', label: 'Offline', emoji: '🌙' },
];

export function statusMeta(key) {
  return (
    STATUS_OPTIONS.find((s) => s.key === key) || {
      key: 'unknown',
      label: 'Unknown',
      emoji: '❓',
    }
  );
}

// Notification category that carries the quick-reply action buttons for the
// "come online" alert. Referenced by id when sending the push.
export const ALERT_CATEGORY = 'come_online_alert';
export const ALERT_ACTIONS = {
  COMING: 'COMING',
  FIVE_MIN: 'FIVE_MIN',
};

// Signal/event types written to the couple's `signals` subcollection.
export const SIGNAL_TYPES = {
  ALERT: 'alert',
  ALERT_REPLY: 'alert_reply',
  HEARTBEAT: 'heartbeat',
};
