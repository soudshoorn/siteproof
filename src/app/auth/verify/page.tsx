import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyPage() {
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
          We hebben een verificatielink naar je e-mailadres gestuurd.
          Klik op de link in de e-mail om je account te activeren.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Geen e-mail ontvangen? Controleer je spammap of probeer het opnieuw.
        </p>
      </CardContent>
    </Card>
  );
}
