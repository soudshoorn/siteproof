"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nl } from "@/lib/i18n/nl";
import { forgotPasswordAction, type AuthResult } from "@/lib/auth/actions";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => {
      return await forgotPasswordAction(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{nl.auth.resetPassword}</CardTitle>
        <CardDescription>
          Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{nl.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="naam@bedrijf.nl"
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {nl.common.loading}
              </>
            ) : (
              "Verstuur resetlink"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Weet je je wachtwoord weer?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {nl.auth.loginButton}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
