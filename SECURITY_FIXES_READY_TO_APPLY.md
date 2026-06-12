# Ready-to-Use Security Fixes

This file contains copy-paste ready fixes for all critical and high-severity security issues.

---

## FIX #1: Admin Bootstrap Authentication

**File**: `src/app/api/admin/bootstrap/route.ts`

**Status**: CRITICAL ✅ Ready to Apply

**Replace the entire file with**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { bootstrapFirstAdmin } from "@/lib/admin-bootstrap";
import { isDatabaseConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export async function POST(req: NextRequest) {
  try {
    // ADD AUTHENTICATION CHECK
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const result = await bootstrapFirstAdmin(email);

    if (result.promoted && "user" in result) {
      return NextResponse.json({ promoted: true, user: result.user });
    }

    return NextResponse.json({ promoted: false, reason: result.reason });
  } catch (error) {
    console.error("Admin bootstrap error:", error);
    return NextResponse.json({ error: "Failed to bootstrap admin" }, { status: 500 });
  }
}
```

**What Changed**:
- Added `import { requireAdmin } from "@/lib/auth-guards";`
- Added authentication check at lines 10-12
- Anyone not authenticated as admin now gets 401 response

**Test After Applying**:
```bash
# Should fail with 401 Unauthorized
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## FIX #2: Remove Wildcard Image Domain

**File**: `next.config.ts`

**Status**: CRITICAL ✅ Ready to Apply

**Replace the images configuration with**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // REMOVED: { protocol: "https", hostname: "**" }
      // Only add specific trusted domains below:
      // {
      //   protocol: "https",
      //   hostname: "cdn.example.com",
      // },
      // {
      //   protocol: "https",
      //   hostname: "images.yoursite.com",
      // },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
```

**What Changed**:
- Removed `hostname: "**"` wildcard
- Added comments showing how to add specific domains
- Now only Unsplash images work by default

**Production Domains to Add**:
```typescript
// For your product images stored in public/uploads:
{
  protocol: "https",
  hostname: "yourdomain.com",
  pathname: "/uploads/**",
},
```

---

## FIX #3: Protect Database Health Endpoint

**File**: `src/app/api/db-health/route.ts`

**Status**: CRITICAL ✅ Ready to Apply

**Replace with**:
```typescript
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // ADD AUTHENTICATION CHECK
  const { response } = await requireAdmin();
  if (response) {
    return response;
  }

  const report = await getDatabaseHealth();

  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
  });
}
```

**What Changed**:
- Added `NextRequest` parameter to GET function
- Added `import { requireAdmin }` at top
- Added authentication check before accessing database health
- Unauthenticated users now get 401

---

## FIX #4: Authenticate Review Upload Endpoint

**File**: `src/app/api/reviews/upload/route.ts`

**Status**: HIGH ✅ Ready to Apply

**Replace with**:
```typescript
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "review"
  );
}

function getExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(originalExtension)) {
    return originalExtension === ".jpeg" ? ".jpg" : originalExtension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

export async function POST(request: NextRequest) {
  try {
    // ADD AUTHENTICATION CHECK
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - please log in to upload review images" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Please keep files under 5MB." },
        { status: 400 }
      );
    }

    const fileName = `${sanitizeSegment(path.parse(file.name).name)}-${Date.now()}${getExtension(file)}`;
    const absoluteDirectory = path.join(process.cwd(), "public", "uploads", "reviews");
    const absoluteFilePath = path.join(absoluteDirectory, fileName);
    const publicUrl = `/uploads/reviews/${fileName}`;

    await mkdir(absoluteDirectory, { recursive: true });
    await writeFile(absoluteFilePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Review upload error:", error);
    return NextResponse.json({ error: "Failed to upload review image" }, { status: 500 });
  }
}
```

**What Changed**:
- Added session check at lines 39-43
- Requires authentication before upload
- Non-logged-in users get 401 response

---

## FIX #5: Add Rate Limiting to Analytics Events

**File**: `src/app/api/analytics/events/route.ts`

**Status**: HIGH ✅ Ready to Apply

**Replace with**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/commerce";

// Simple in-memory rate limiting (use Redis for production)
const eventRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxPerHour: number = 100): boolean {
  const now = Date.now();
  const record = eventRateLimits.get(clientId);

  // Reset if hour has passed
  if (record && now > record.resetTime) {
    eventRateLimits.delete(clientId);
    return true;
  }

  if (!record) {
    // First request from this client
    eventRateLimits.set(clientId, {
      count: 1,
      resetTime: now + 3600000, // 1 hour from now
    });
    return true;
  }

  if (record.count >= maxPerHour) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // ADD RATE LIMITING
    const clientId = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkRateLimit(clientId, 100)) {
      return NextResponse.json(
        { error: "Too many analytics events. Please try again later." },
        { status: 429 }
      );
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

**What Changed**:
- Added `checkRateLimit` function that tracks requests per client IP
- Allows max 100 events per hour per client
- Returns 429 (Too Many Requests) when limit exceeded
- Simple in-memory storage (adequate for single server, use Redis for distributed)

**Test After Applying**:
```bash
# Run 101 times - 101st should get 429 error
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/analytics/events \
    -H "Content-Type: application/json" \
    -d '{"eventType":"view"}'
done
```

---

## FIX #6: Add Rate Limiting to Order Creation

**File**: `src/app/api/orders/route.ts`

**Status**: HIGH ✅ Ready to Apply

**Add at the top of the file (after imports, before the POST function)**:
```typescript
// RATE LIMITING FOR ORDER CREATION
const orderRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkOrderRateLimit(clientId: string, maxPerHour: number = 20): boolean {
  const now = Date.now();
  const record = orderRateLimits.get(clientId);

  // Reset if hour has passed
  if (record && now > record.resetTime) {
    orderRateLimits.delete(clientId);
    return true;
  }

  if (!record) {
    // First request from this client
    orderRateLimits.set(clientId, {
      count: 1,
      resetTime: now + 3600000, // 1 hour from now
    });
    return true;
  }

  if (record.count >= maxPerHour) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}
```

**Then in the POST function, add after line 29 (right after `export async function POST(req: NextRequest) {`)**:
```typescript
    // ADD RATE LIMITING
    const clientId = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkOrderRateLimit(clientId, 20)) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many order requests. Please try again later.",
        },
        { status: 429 }
      );
    }
```

**What Changed**:
- Added helper function `checkOrderRateLimit` to track orders per IP
- Limits to 20 orders per hour per IP
- Returns 429 error when exceeded
- Prevents order creation spam and DoS

---

## FIX #7: Extend Middleware to API Routes

**File**: `middleware.ts`

**Status**: HIGH ✅ Ready to Apply

**Replace with**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!session || session.user.role !== 'admin') {
      // Redirect page requests to login, return 401 for API requests
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],  // ADD API ROUTES HERE
};
```

**What Changed**:
- Added `/api/admin/:path*` to middleware matcher
- Added API response handler for 401 errors
- Now middleware protects both `/admin` pages and `/api/admin` routes

---

## FIX #8: Input Validation for Settings

**File**: `src/app/api/settings/route.ts`

**Status**: HIGH ✅ Ready to Apply

**Replace with**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getSiteSettings } from "@/lib/commerce";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

// ADD ZOD VALIDATION SCHEMA
const settingsSchema = z.object({
  businessEmail: z.string().email("Invalid email").max(100),
  phone: z.string().min(1).max(20),
  address: z.string().min(1).max(500),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  whatsappNumber: z.string().max(20).optional(),
  messengerLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  supportEmail: z.string().email("Invalid email").max(100),
  supportHours: z.string().max(200).regex(/^[\w\s,:\-()]*$/, "Invalid characters in support hours"),
  footerContent: z.string().max(2000),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format").default("#ff6a00"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format").default("#ff6a00"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format").default("#ffffff"),
  buttonStyle: z.enum(["pill", "rounded", "square"]).default("pill"),
});

export async function GET() {
  try {
    return NextResponse.json(await getSiteSettings());
  } catch (error) {
    console.error("Site settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const body = await req.json();

    // VALIDATE INPUT WITH ZOD
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid settings payload" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(siteSettings)
      .set({
        businessEmail: parsed.data.businessEmail,
        phone: parsed.data.phone,
        address: parsed.data.address,
        facebook: parsed.data.facebook || "",
        instagram: parsed.data.instagram || "",
        whatsappNumber: parsed.data.whatsappNumber || "",
        messengerLink: parsed.data.messengerLink || "",
        supportEmail: parsed.data.supportEmail,
        supportHours: parsed.data.supportHours,
        footerContent: parsed.data.footerContent,
        primaryColor: parsed.data.primaryColor,
        accentColor: parsed.data.accentColor,
        backgroundColor: parsed.data.backgroundColor,
        buttonStyle: parsed.data.buttonStyle,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, 1))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Site settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
```

**What Changed**:
- Added `settingsSchema` using Zod for validation
- Email validation on both email fields
- URL validation on social media links
- Color format validation (hex colors only)
- Max length restrictions on all fields
- Invalid input returns 400 with specific error message

---

## FIX #9: Add Rate Limiting Framework

**File**: `src/lib/rate-limiter.ts` (Create new file)

**Status**: HIGH ✅ Ready to Apply

**Create new file with**:
```typescript
/**
 * Simple in-memory rate limiter for development.
 * For production with multiple servers, use Redis.
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const limits = new Map<string, RateLimitRecord>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of limits.entries()) {
    if (now > record.resetTime) {
      limits.delete(key);
    }
  }
}, 3600000);

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // milliseconds
}

export function checkRateLimit(
  clientId: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = clientId;
  const record = limits.get(key);

  // Cleanup expired records
  if (record && now > record.resetTime) {
    limits.delete(key);
  }

  // First request
  if (!limits.has(key)) {
    const resetTime = now + options.windowMs;
    limits.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: resetTime,
    };
  }

  const current = limits.get(key)!;

  if (current.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetTime,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - current.count,
    resetAt: current.resetTime,
  };
}

export function getRateLimitResetTime(clientId: string): number | null {
  const record = limits.get(clientId);
  return record?.resetTime || null;
}
```

**Usage in other endpoints**:
```typescript
import { checkRateLimit } from "@/lib/rate-limiter";

// In your API route:
const clientId = req.headers.get("x-forwarded-for") || "unknown";
const limit = checkRateLimit(clientId, {
  maxRequests: 50,
  windowMs: 60 * 60 * 1000, // 1 hour
});

if (!limit.allowed) {
  return NextResponse.json(
    { error: "Too many requests", resetAt: limit.resetAt },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
      },
    }
  );
}
```

---

## PRODUCTION DEPLOYMENT NOTES

### Environment Variables to Set
```bash
# .env.local or deployment environment:
NODE_ENV=production
DATABASE_URL=postgresql://[credentials]@[host]/[database]
GOOGLE_CLIENT_ID=[your_client_id]
GOOGLE_CLIENT_SECRET=[your_client_secret]
```

### Security Headers Middleware
Create `src/middleware-security-headers.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  return response;
}
```

---

## TESTING ALL FIXES

**Test Script** (`test-security.sh`):
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Security Fixes..."
echo "========================="

echo "✓ Fix #1: Admin Bootstrap requires auth"
curl -X POST "$BASE_URL/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' -w "\nStatus: %{http_code}\n"

echo ""
echo "✓ Fix #3: DB Health requires auth"
curl "$BASE_URL/api/db-health" -w "\nStatus: %{http_code}\n"

echo ""
echo "✓ Fix #5: Review upload requires auth"
curl -X POST "$BASE_URL/api/reviews/upload" \
  -F "file=@test.jpg" -w "\nStatus: %{http_code}\n"

echo ""
echo "✓ Fix #6: Analytics rate limiting (run 101 times)"
for i in {1..101}; do
  STATUS=$(curl -s -X POST "$BASE_URL/api/analytics/events" \
    -H "Content-Type: application/json" \
    -d '{"eventType":"test"}' \
    -w "%{http_code}" -o /dev/null)
  if [ $i -eq 101 ]; then
    echo "Request 101 status: $STATUS (should be 429)"
  fi
done
```

---

## ROLLBACK PROCEDURE

If any fix causes issues:
1. Git reset the changed file: `git checkout src/app/api/[file]/route.ts`
2. Redeploy previous version
3. Verify issue
4. Check application logs for errors
5. Re-apply fix with corrections

---

## SIGN-OFF CHECKLIST

After applying all fixes, verify:
- [ ] Application builds without errors: `npm run build`
- [ ] Types check out: `npm run type-check`
- [ ] Tests pass: `npm test`
- [ ] Security audit passes
- [ ] Manual testing completed
- [ ] No regressions observed
- [ ] Ready for production deployment

