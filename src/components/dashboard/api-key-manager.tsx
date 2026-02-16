"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { nl } from "@/lib/i18n/nl";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Kon API keys niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setNewlyCreatedKey(data.data.key);
        setNewKeyName("");
        setShowCreateForm(false);
        fetchKeys();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Kon API key niet aanmaken.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    setRevokingId(keyId);
    try {
      const res = await fetch(`/api/api-keys/${keyId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        fetchKeys();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Kon API key niet intrekken.");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleCopyKey() {
    if (!newlyCreatedKey) return;
    try {
      await navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <Card className="border-score-good/30 bg-score-good/5">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-start gap-2">
              <Key className="mt-0.5 size-5 text-score-good" />
              <div>
                <p className="font-semibold text-score-good">API key aangemaakt</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kopieer deze key nu. Je kunt hem niet meer bekijken na het sluiten van dit bericht.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {showKey ? newlyCreatedKey : newlyCreatedKey.slice(0, 16) + "•".repeat(40)}
              </code>
              <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyKey}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Gekopieerd" : "Kopieer"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewlyCreatedKey(null);
                setShowKey(false);
              }}
            >
              Sluiten
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create new key */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">API Keys</CardTitle>
          {!showCreateForm && (
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="size-4" />
              Nieuwe key
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 flex gap-2 rounded-lg border border-border/50 bg-muted/30 p-4">
              <Input
                placeholder="Naam voor de API key (bijv. CI/CD Pipeline)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : "Aanmaken"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName("");
                }}
              >
                Annuleren
              </Button>
            </div>
          )}

          {/* Active keys */}
          {activeKeys.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nog geen API keys. Maak er een aan om de API te gebruiken.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {activeKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="size-4 text-muted-foreground" />
                      <span className="font-medium">{key.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                        {key.keyPrefix}...
                      </code>
                      <span>Aangemaakt {formatDate(new Date(key.createdAt))}</span>
                      {key.lastUsedAt && (
                        <span>
                          Laatst gebruikt {formatRelativeTime(new Date(key.lastUsedAt))}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRevoke(key.id)}
                    disabled={revokingId === key.id}
                    aria-label={`API key "${key.name}" intrekken`}
                  >
                    {revokingId === key.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Revoked keys */}
          {revokedKeys.length > 0 && (
            <div className="mt-6 border-t border-border/40 pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ingetrokken keys
              </p>
              <div className="space-y-2">
                {revokedKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Key className="size-3.5 opacity-50" />
                    <span className="line-through">{key.name}</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs opacity-50">
                      {key.keyPrefix}...
                    </code>
                    <Badge variant="outline" className="text-xs opacity-50">
                      Ingetrokken
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gebruik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Gebruik je API key in de <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Authorization</code> header:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
{`curl -H "Authorization: Bearer sp_live_..." \\
  https://siteproof.nl/api/v1/websites`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Rate limit: 100 requests per minuut per API key.{" "}
            <a href="/api-docs" className="text-primary hover:underline">
              Bekijk de volledige documentatie
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
