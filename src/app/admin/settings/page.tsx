"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { nl } from "@/lib/i18n/nl";
import { toast } from "sonner";
import {
  Settings,
  Mail,
  CreditCard,
  Shield,
  Loader2,
  Send,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  async function handleSendTestEmail() {
    if (!testEmail.trim()) {
      toast.error("Vul een e-mailadres in.");
      return;
    }

    setSendingTest(true);
    try {
      // This would call an API route to send a test email
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      });

      if (!res.ok) {
        toast.error("Test e-mail verzenden mislukt.");
        return;
      }

      toast.success(`Test e-mail verzonden naar ${testEmail}`);
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{nl.admin.settings}</h1>
        <p className="text-sm text-muted-foreground">
          Platform instellingen en configuratie.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="size-4" />
              Algemeen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bedrijfsnaam</Label>
              <Input defaultValue="Webser / SiteProof" disabled />
            </div>
            <div className="space-y-2">
              <Label>Contact e-mail</Label>
              <Input defaultValue="senna@webser.nl" disabled />
            </div>
            <div className="space-y-2">
              <Label>KvK-nummer</Label>
              <Input defaultValue="[KVK_NUMMER]" disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Pas deze waarden aan in je .env bestand.
            </p>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="size-4" />
              E-mail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Resend</p>
                <p className="text-xs text-muted-foreground">E-mail provider</p>
              </div>
              <Badge variant={process.env.NEXT_PUBLIC_APP_URL ? "default" : "secondary"}>
                Geconfigureerd
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testEmail">Test e-mail versturen</Label>
              <div className="flex gap-2">
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                <Button
                  size="sm"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                >
                  {sendingTest ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mollie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Mollie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">API connectie</p>
                <p className="text-xs text-muted-foreground">Betalingen en subscriptions</p>
              </div>
              <Badge variant="default">Actief</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Mollie API key is geconfigureerd via environment variables.
              Beheer betalingsmethoden en subscriptions in het Mollie dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Feature flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="size-4" />
              Feature flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Onderhoudsmodus</p>
                <p className="text-xs text-muted-foreground">
                  Toon een onderhoudspagina aan bezoekers
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Registratie open</p>
                <p className="text-xs text-muted-foreground">
                  Sta nieuwe registraties toe
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Gratis scan actief</p>
                <p className="text-xs text-muted-foreground">
                  Sta anonieme gratis scans toe
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            <p className="text-xs text-muted-foreground">
              Feature flags worden in de toekomst gekoppeld aan de database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
