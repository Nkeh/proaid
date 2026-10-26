"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, HandHelping, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/brand/logo";
import { useT } from "@/lib/i18n";
import { setRole } from "@/lib/data/session";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("esther.ngwa@example.com");
  const [password, setPassword] = useState("");

  function loginAs(role: "EMPLOYER" | "PROVIDER" | "ADMIN") {
    setRole(role);
    const dest = role === "EMPLOYER" ? "/employer" : role === "PROVIDER" ? "/provider-dashboard" : "/admin";
    router.push(dest);
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    loginAs("EMPLOYER");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo />
        <div>
          <h1 className="text-2xl font-bold">{t.login.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="space-y-3 pt-6">
          <Button
            size="lg"
            className="h-14 w-full justify-start gap-3 text-base"
            onClick={() => loginAs("EMPLOYER")}
          >
            <Users className="h-5 w-5" />
            {t.login.continueAsEmployer}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-14 w-full justify-start gap-3 text-base text-primary"
            onClick={() => loginAs("PROVIDER")}
          >
            <HandHelping className="h-5 w-5" />
            {t.login.continueAsProvider}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full justify-start gap-3 text-base"
            onClick={() => loginAs("ADMIN")}
          >
            <ShieldCheck className="h-5 w-5" />
            {t.login.continueAsAdmin}
          </Button>

          <div className="flex items-center gap-3 py-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">{t.login.orDivider}</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.login.emailLabel}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t.login.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="h-11 w-full">
              {t.login.loginButton}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">{t.login.demoNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}
