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
import { registerAction, type AuthResult } from "@/lib/auth/actions";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => {
      return await registerAction(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{nl.auth.registerTitle}</CardTitle>
        <CardDescription>
          Maak een gratis account aan en scan je eerste website.
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
            <Label htmlFor="fullName">{nl.auth.fullName}</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Senna Oudshoorn"
              disabled={isPending}
            />
          </div>

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
            <Label htmlFor="password">{nl.auth.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Minimaal 8 tekens"
              disabled={isPending}
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
              nl.auth.registerButton
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {nl.auth.hasAccount}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {nl.auth.loginButton}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
