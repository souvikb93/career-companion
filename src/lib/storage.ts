export function loadFromStorage<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

const TRACKA_KEYS = [
  "jobs_v7",
  "tracka_letter_draft",
  "tracka_letter_msgs_v2",
  "tracka_cv_draft",
  "letter_layout",
  "cv_layout",
  // legacy keys from old localStorage-only implementation
  "saved_cvs_v1",
  "saved_cvs_v2",
  "saved_letters_v1",
  "saved_letters_v2",
  "tracka_letter_jd",
  "tracka_cv_jd",
  "jobs_added_count",
  "tracka_email_notif",
  // NOTE: tracka_theme intentionally excluded — theme is a device preference, not user data.
  // It must survive logout and account deletion so the UI never unexpectedly switches modes.
];

/** Wipe all Tracka user-data keys from localStorage. Called on account deletion. */
export function clearTrackaStorage() {
  TRACKA_KEYS.forEach((k) => {
    try { localStorage.removeItem(k); } catch { /* noop */ }
  });
}
