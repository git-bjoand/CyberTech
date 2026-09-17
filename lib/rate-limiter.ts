import { NextRequest } from 'next/server';

interface AttemptRecord {
  failedCount: number;
  lastFailedTime: number;
  lockedUntil: number;
}

// In-memory tracking maps
const ipAttempts = new Map<string, AttemptRecord>();
const userAttempts = new Map<string, AttemptRecord>();
const ipFloodTracker = new Map<string, number[]>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const FLOOD_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15; // Max 15 rapid requests/min

/**
 * Extract client IP address safely from standard proxy headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks whether an IP or username is currently locked out from login
 */
export function checkLoginLockout(ip: string, username?: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // 1. Check IP-level lockout
  const ipRec = ipAttempts.get(ip);
  if (ipRec && ipRec.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((ipRec.lockedUntil - now) / 1000);
    return { locked: true, retryAfterSeconds };
  }

  // 2. Check Username-level lockout
  if (username) {
    const normUser = username.trim().toLowerCase();
    const userRec = userAttempts.get(normUser);
    if (userRec && userRec.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((userRec.lockedUntil - now) / 1000);
      return { locked: true, retryAfterSeconds };
    }
  }

  return { locked: false, retryAfterSeconds: 0 };
}

/**
 * Checks rapid request flood protection (anti-DoS)
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const timestamps = ipFloodTracker.get(ip) || [];

  const validTimestamps = timestamps.filter((time) => now - time < FLOOD_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + FLOOD_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  validTimestamps.push(now);
  ipFloodTracker.set(ip, validTimestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Records the result of a login attempt
 */
export function recordLoginAttempt(ip: string, username: string, success: boolean): void {
  const now = Date.now();
  const normUser = username.trim().toLowerCase();

  if (success) {
    // Reset counters on successful login
    ipAttempts.delete(ip);
    if (normUser) {
      userAttempts.delete(normUser);
    }
    return;
  }

  // Handle failure for IP
  const currentIp = ipAttempts.get(ip) || { failedCount: 0, lastFailedTime: now, lockedUntil: 0 };
  currentIp.failedCount += 1;
  currentIp.lastFailedTime = now;
  if (currentIp.failedCount >= MAX_FAILED_ATTEMPTS) {
    currentIp.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  ipAttempts.set(ip, currentIp);

  // Handle failure for Username
  if (normUser) {
    const currentUser = userAttempts.get(normUser) || { failedCount: 0, lastFailedTime: now, lockedUntil: 0 };
    currentUser.failedCount += 1;
    currentUser.lastFailedTime = now;
    if (currentUser.failedCount >= MAX_FAILED_ATTEMPTS) {
      currentUser.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
    userAttempts.set(normUser, currentUser);
  }
}
