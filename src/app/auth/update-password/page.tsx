"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nl } from "@/lib/i18n/nl";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 8) {
      setError(nl.auth.passwordTooShort);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(nl.auth.passwordMismatch);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("Wachtwoord bijwerken mislukt. Probeer het opnieuw.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Nieuw wachtwoord instellen</CardTitle>
        <CardDescription>
          Kies een nieuw wachtwoord voor je account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-8 text-score-good" />
            <p className="text-sm font-medium">
              Wachtwoord succesvol gewijzigd! Je wordt doorgestuurd...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{nl.auth.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Minimaal 8 tekens"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{nl.auth.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Herhaal je wachtwoord"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {nl.common.loading}
                </>
              ) : (
                "Wachtwoord opslaan"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
