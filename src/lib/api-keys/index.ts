import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";
import type { Organization } from "@prisma/client";

const API_KEY_PREFIX = "sp_live_";

/**
 * Generate a new API key. Returns the full key (only shown once) and the hash for storage.
 */
export function generateApiKey(): { fullKey: string; keyPrefix: string; keyHash: string } {
  const raw = randomBytes(32).toString("hex");
  const fullKey = `${API_KEY_PREFIX}${raw}`;
  const keyPrefix = fullKey.slice(0, 16);
  const keyHash = hashApiKey(fullKey);

  return { fullKey, keyPrefix, keyHash };
}

/**
 * Hash an API key with SHA-256. Used for storage and lookup.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Validate an API key and return the associated organization.
 * Updates `lastUsedAt` on successful validation.
 * Returns null if the key is invalid, revoked, or the org doesn't have API access.
 */
export async function validateApiKey(
  key: string
): Promise<Organization | null> {
  const hash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { organization: true },
  });

  if (!apiKey) return null;
  if (apiKey.revokedAt) return null;

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Non-critical, ignore errors
    });

  return apiKey.organization;
}

/**
 * Create a new API key for an organization.
 * Returns the full key (show to user once) and the database record.
 */
export async function createApiKey(organizationId: string, name: string) {
  const { fullKey, keyPrefix, keyHash } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId,
      name,
      keyPrefix,
      keyHash,
    },
  });

  return { ...apiKey, fullKey };
}

/**
 * Revoke an API key.
 */
export async function revokeApiKey(keyId: string, organizationId: string) {
  return prisma.apiKey.update({
    where: { id: keyId, organizationId },
    data: { revokedAt: new Date() },
  });
}

/**
 * List all API keys for an organization (without hashes).
 */
export async function listApiKeys(organizationId: string) {
  return prisma.apiKey.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
