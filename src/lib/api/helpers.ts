import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { PlanLimitError } from "@/lib/plan-enforcement";
import { validateApiKey } from "@/lib/api-keys";
import { PLANS } from "@/lib/mollie/plans";
import type { User, Organization, OrganizationMember } from "@prisma/client";

// ─── Response helpers ────────────────────────────────────

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function jsonValidationError(errors: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, error: "Validatiefout", details: errors },
    { status: 400 }
  );
}

// ─── Auth helpers for API routes ─────────────────────────

type AuthenticatedUser = User & {
  memberships: (OrganizationMember & { organization: Organization })[];
};

/**
 * Get the authenticated user in an API route, or return a 401 response.
 * Returns [user, null] on success, [null, response] on failure.
 */
export async function authenticateRequest(): Promise<
  [AuthenticatedUser, null] | [null, NextResponse]
> {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return [null, jsonError("Niet ingelogd.", 401)];
  }

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  });

  if (!user) {
    return [null, jsonError("Gebruiker niet gevonden.", 404)];
  }

  return [user, null];
}

/**
 * Get the authenticated user + verify they have access to an organization.
 * Returns [user, organization, null] on success, [null, null, response] on failure.
 */
export async function authenticateWithOrg(
  organizationId: string
): Promise<
  [AuthenticatedUser, Organization, null] | [null, null, NextResponse]
> {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return [null, null, errorResponse];

  const membership = user.memberships.find(
    (m) => m.organizationId === organizationId
  );

  if (!membership) {
    return [null, null, jsonError("Geen toegang tot deze organisatie.", 403)];
  }

  return [user, membership.organization, null];
}

/**
 * Require admin access in an API route.
 */
export async function authenticateAdmin(): Promise<
  [AuthenticatedUser, null] | [null, NextResponse]
> {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return [null, errorResponse];

  if (!user.isAdmin) {
    return [null, jsonError("Geen admin toegang.", 403)];
  }

  return [user, null];
}

// ─── Public API key authentication (Bureau tier) ────────

/**
 * Authenticate a request using a Bearer API key.
 * Returns the organization on success, or a 401/403 response on failure.
 * Also checks that the organization has API access (Bureau plan).
 */
export async function authenticateApiKey(
  request: Request
): Promise<[Organization, null] | [null, NextResponse]> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return [
      null,
      jsonError("API key is vereist. Gebruik de Authorization header met een Bearer token.", 401),
    ];
  }

  const key = authHeader.slice(7);
  const organization = await validateApiKey(key);

  if (!organization) {
    return [null, jsonError("Ongeldige of ingetrokken API key.", 401)];
  }

  // Check plan supports API access
  const plan = PLANS[organization.planType];
  if (!plan.features.apiAccess) {
    return [
      null,
      jsonError(
        "API toegang is niet beschikbaar op je huidige plan. Upgrade naar Bureau om de API te gebruiken.",
        403
      ),
    ];
  }

  return [organization, null];
}

// ─── Rate limiting for API routes ────────────────────────

/**
 * Apply rate limiting to an API route. Returns a 429 response if limit exceeded.
 */
export async function applyRateLimit(
  limitKey: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<NextResponse | null> {
  const ip = identifier ?? (await getClientIp());
  const config = RATE_LIMITS[limitKey];
  const result = await rateLimit(`${limitKey}:${ip}`, config);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Te veel verzoeken. Probeer het later opnieuw.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }

  return null;
}

// ─── Error handling wrapper ──────────────────────────────

type ApiHandler = (request: Request) => Promise<NextResponse>;

/**
 * Wrap an API route handler with standardized error handling.
 * Catches PlanLimitError and unknown errors, returns appropriate responses.
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof PlanLimitError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            planType: error.planType,
            limit: error.limit,
          },
          { status: 403 }
        );
      }

      console.error("Unhandled API error:", error);
      return jsonError("Er is een onverwachte fout opgetreden.", 500);
    }
  };
}
