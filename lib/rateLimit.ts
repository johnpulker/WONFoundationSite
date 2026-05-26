import { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, consider using Redis-based rate limiting
 * 
 * SECURITY: Rate limits by IP + route, plus global counter
 * This prevents bypass via VPN/mobile networks while still providing IP-based protection
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get rate limit key for IP + route combination
 */
function getRateLimitKey(ip: string, route: string): string {
  return `${route}:ip:${ip}`
}

/**
 * Get global rate limit key (across all IPs)
 */
function getGlobalRateLimitKey(route: string): string {
  return `${route}:global`
}

/**
 * Rate limit check with IP + global counter
 * Checks both IP-specific and global limits
 * @param ip - Client IP address
 * @param route - Route identifier (e.g., 'admin-login')
 * @param maxRequests - Maximum number of requests allowed per IP
 * @param globalMaxRequests - Maximum number of requests allowed globally (optional)
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimitWithIP(
  ip: string,
  route: string,
  maxRequests: number,
  windowMs: number,
  globalMaxRequests?: number
): { allowed: boolean; remaining: number; resetTime: number; reason?: string } {
  // Check IP-specific limit
  const ipKey = getRateLimitKey(ip, route)
  const ipLimit = checkRateLimit(ipKey, maxRequests, windowMs)
  
  if (!ipLimit.allowed) {
    return {
      ...ipLimit,
      reason: 'IP rate limit exceeded'
    }
  }

  // Check global limit (if specified)
  if (globalMaxRequests !== undefined) {
    const globalKey = getGlobalRateLimitKey(route)
    const globalLimit = checkRateLimit(globalKey, globalMaxRequests, windowMs)
    
    if (!globalLimit.allowed) {
      return {
        ...globalLimit,
        reason: 'Global rate limit exceeded'
      }
    }
  }

  return ipLimit
}

/**
 * Rate limit check (can be used directly for simple rate limiting by key)
 * @param key - Unique identifier (e.g., IP address, email)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically (every 1000 checks)
  if (Math.random() < 0.001) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from NextRequest
 * Handles proxies/CDN correctly (x-forwarded-for, x-real-ip)
 */
export function getClientIP(request: NextRequest): string {
  // Try x-forwarded-for first (most common behind proxies/CDN like Cloudflare, Render)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // The first IP is the original client IP
    const ips = forwarded.split(',').map(ip => ip.trim()).filter(ip => ip);
    return ips[0] || 'unknown';
  }
  
  // Try x-real-ip (some proxies use this)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Try CF-Connecting-IP (Cloudflare specific)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }
  
  // Fallback - if we're behind a proxy and none of the headers are set,
  // we can't reliably determine the IP, so return 'unknown'
  // In production behind a proxy/CDN, one of the above headers should always be present
  return 'unknown';
}
