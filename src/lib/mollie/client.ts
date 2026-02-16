import createMollieClient, { type MollieClient } from "@mollie/api-client";

let _client: MollieClient | null = null;

/**
 * Get the Mollie API client.
 * Throws if MOLLIE_API_KEY is not configured.
 */
export function getMollieClient(): MollieClient {
  if (!process.env.MOLLIE_API_KEY) {
    throw new Error(
      "MOLLIE_API_KEY is niet geconfigureerd. Stel deze in via de environment variabelen."
    );
  }

  if (!_client) {
    _client = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY,
    });
  }

  return _client;
}

/**
 * Check if Mollie is configured and available.
 */
export function isMollieConfigured(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}
