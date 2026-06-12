# CRITICAL SECURITY FIXES REQUIRED

**Last Updated**: 2026-06-03  
**Status**: 4 CRITICAL issues requiring immediate attention

---

## ISSUE #1: CRITICAL - Unauthenticated Admin Bootstrap
**File**: `src/app/api/admin/bootstrap/route.ts`  
**Risk**: Anyone can create an admin account

### Current Code (Lines 5-10):
```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    // NO AUTHENTICATION CHECK HERE!
```

### Fix:
```typescript
export async function POST(req: NextRequest) {
  // ADD THIS - Require admin authentication
  const { response } = await requireAdmin();
  if (response) return response;
  
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
```

---

## ISSUE #2: CRITICAL - Wildcard Image Domain (SSRF Risk)
**File**: `next.config.ts`  
**Risk**: Allows image loading from ANY external domain

### Current Code (Lines 5-13):
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "**",  // DANGEROUS - ANY DOMAIN
    },
  ],
},
```

### Fix:
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "cdn.example.com", // Only trusted domain
    },
    // Add other specific domains as needed, NO WILDCARD
  ],
},
```

---

## ISSUE #3: CRITICAL - Unauthenticated Database Health Endpoint
**File**: `src/app/api/db-health/route.ts`  
**Risk**: Exposes detailed database configuration to anyone

### Current Code (Lines 1-9):
```typescript
export const dynamic = "force-dynamic";

export async function GET() {  // NO AUTHENTICATION!
  const report = await getDatabaseHealth();
  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
  });
}
```

### Fix:
```typescript
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // ADD THIS
  const { response } = await requireAdmin();
  if (response) return response;
  
  const report = await getDatabaseHealth();
  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
  });
}
```

Don't forget to import:
```typescript
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
```

---

## ISSUE #4: CRITICAL - Missing Rate Limiting + Auth on Public Endpoints

### A. Review Upload - `src/app/api/reviews/upload/route.ts` (Line 28)
**Current**: No authentication on image uploads
**Fix**: Add session check
```typescript
export async function POST(request: NextRequest) {
  try {
    // ADD THIS - Require user to be logged in
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    // ... rest of code
```

### B. Analytics Events - `src/app/api/analytics/events/route.ts` (Line 5)
**Current**: No rate limiting on analytics spam
**Fix**: Add rate limiting
```typescript
import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/commerce";

// Simple rate limiting (use Redis for production)
const eventRateLimit = new Map<string, number[]>();

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  const times = eventRateLimit.get(clientId) || [];
  const recentEvents = times.filter(t => t > oneHourAgo);
  
  if (recentEvents.length >= 100) { // Max 100 events per hour
    return true;
  }
  
  recentEvents.push(now);
  eventRateLimit.set(clientId, recentEvents);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientId = req.headers.get("x-forwarded-for") || "unknown";
    
    if (isRateLimited(clientId)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    await recordAnalyticsEvent(String(body.eventType ?? "unknown"), body.productId ? Number(body.productId) : undefined);
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("Analytics event record error:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
```

### C. Orders - `src/app/api/orders/route.ts` (Line 29)
**Current**: No rate limiting on order creation
**Fix**: Add rate limiting
```typescript
// At top of file, after imports:
const orderRateLimit = new Map<string, number[]>();

function checkOrderRateLimit(clientId: string, maxPerHour: number = 20): boolean {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  const times = orderRateLimit.get(clientId) || [];
  const recentOrders = times.filter(t => t > oneHourAgo);
  
  if (recentOrders.length >= maxPerHour) {
    return false; // Rate limited
  }
  
  recentOrders.push(now);
  orderRateLimit.set(clientId, recentOrders);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // ADD THIS - Rate limit by IP
    const clientId = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkOrderRateLimit(clientId, 20)) {
      return NextResponse.json(
        { success: false, code: "RATE_LIMITED", message: "Too many orders. Please try again later." },
        { status: 429 }
      );
    }

    if (!isDatabaseConfigured()) {
      // ... rest of existing code
```

---

## TESTING THE FIXES

### Test Fix #1: Admin Bootstrap
```bash
# BEFORE FIX - Should succeed (VULNERABLE):
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@test.com"}'
# Response: { "promoted": true, ... }

# AFTER FIX - Should fail with 401:
# Response: { "error": "Unauthorized" }
```

### Test Fix #2: Image Domains
```bash
# BEFORE FIX - Any domain works:
<Image src="https://any-malicious-site.com/image.jpg" />

# AFTER FIX - Only whitelisted domains:
# Only images.unsplash.com and cdn.example.com work
```

### Test Fix #3: DB Health
```bash
# BEFORE FIX - Public info exposed:
curl http://localhost:3000/api/db-health
# Response: { "config": { "host": "prod-db.neon.tech", ... } }

# AFTER FIX - Returns 401 Unauthorized
```

### Test Fix #4: Rate Limiting
```bash
# BEFORE FIX - 100 events succeeds:
for i in {1..100}; do curl -X POST /api/analytics/events -d '{}'; done

# AFTER FIX - After 100 requests, returns 429:
# { "error": "Too many requests" }
```

---

## DEPLOYMENT CHECKLIST

- [ ] Apply Fix #1 - Add requireAdmin() to bootstrap endpoint
- [ ] Apply Fix #2 - Remove wildcard from next.config.ts
- [ ] Apply Fix #3 - Add requireAdmin() to db-health endpoint
- [ ] Apply Fix #4A - Add auth to reviews/upload endpoint
- [ ] Apply Fix #4B - Add rate limiting to analytics/events
- [ ] Apply Fix #4C - Add rate limiting to orders endpoint
- [ ] Test all fixes locally
- [ ] Run security scan: `npm audit`
- [ ] Run type check: `npm run build`
- [ ] Review and deploy to staging
- [ ] Conduct manual security testing on staging
- [ ] Deploy to production
- [ ] Monitor error logs for any issues
- [ ] Schedule follow-up security review for remaining MEDIUM/HIGH issues

---

## PRODUCTION DEPLOYMENT NOTES

**Before going live**, also address:
1. Enable HTTPS everywhere
2. Set `NODE_ENV=production`
3. Add security headers (see main audit report)
4. Enable database encryption at rest (Neon feature)
5. Set up monitoring/alerting for error spikes
6. Implement proper rate limiting (use Redis instead of Map for distributed systems)
7. Enable audit logging for admin actions
8. Set up database backups and disaster recovery

---

## REFERENCE
For detailed findings, see: `/memories/session/security_audit_report.md`
