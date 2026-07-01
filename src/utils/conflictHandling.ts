export interface WriteLock {
  lockedBy: string;
  lockedAt: string;
  expiresAt: string;
  reason: string;
}

export function isLockActive(lock: WriteLock | null, now = new Date()) {
  if (!lock) return false;
  return new Date(lock.expiresAt).getTime() > now.getTime();
}

export function createWriteLock(lockedBy: string, timeoutMinutes: number, reason: string): WriteLock {
  const lockedAt = new Date();
  const expiresAt = new Date(lockedAt.getTime() + timeoutMinutes * 60 * 1000);
  return {
    lockedBy,
    lockedAt: lockedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    reason,
  };
}
