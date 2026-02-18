"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lock, ArrowRight } from "lucide-react";

export function TrendPlaceholder() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4" />
          Score trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Fake blurred chart */}
        <div className="relative">
          <svg
            viewBox="0 0 400 120"
            className="h-32 w-full opacity-30 blur-[3px]"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              points="0,80 50,75 100,60 150,65 200,45 250,50 300,35 350,30 400,25"
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="text-muted-foreground"
              points="0,60 50,60 100,60 150,60 200,60 250,60 300,60 350,60 400,60"
            />
          </svg>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
            <Lock className="size-6 text-primary" />
            <p className="mt-2 text-sm font-medium">
              Volg je score over tijd
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Beschikbaar vanaf Starter
            </p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href="/pricing">
                Upgrade
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
