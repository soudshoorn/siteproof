"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
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
import { loginAction, type AuthResult } from "@/lib/auth/actions";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => {
      return await loginAction(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{nl.auth.loginTitle}</CardTitle>
        <CardDescription>
          Vul je gegevens in om verder te gaan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />

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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{nl.auth.password}</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                {nl.auth.forgotPassword}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Minimaal 8 tekens"
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
              nl.auth.loginButton
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {nl.auth.noAccount}{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            {nl.auth.registerButton}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
