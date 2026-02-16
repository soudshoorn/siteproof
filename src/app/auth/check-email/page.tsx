import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Controleer je e-mail</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Als er een account met dit e-mailadres bestaat, hebben we een link gestuurd
          waarmee je je wachtwoord kunt resetten.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Geen e-mail ontvangen? Controleer je spammap.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/auth/login">Terug naar inloggen</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
