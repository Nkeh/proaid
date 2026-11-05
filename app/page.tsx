"use client";

import Link from "next/link";
import {
  Search,
  CalendarCheck,
  ShieldCheck,
  Handshake,
  Baby,
  Sparkles,
  UtensilsCrossed,
  HeartPulse,
  HomeIcon,
  ClipboardCheck,
  Lock,
  FileText,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { CATEGORY_OPTIONS } from "@/lib/data/options";
import type { Category } from "@/lib/data/types";

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  NANNY: Baby,
  HOUSE_HELP: Sparkles,
  COOK: UtensilsCrossed,
  ELDERLY_CAREGIVER: HeartPulse,
  HOUSEMATE_SUPPORT: HomeIcon,
};

const TESTIMONIALS = [
  {
    initials: "MT",
    color: "#0F5E5A",
    en: {
      quote: "ProAid made it so easy to find a nanny we trust. The escrow payment gave us real peace of mind.",
      name: "Mireille T.",
      role: "Employer, Bonapriso",
    },
    fr: {
      quote: "ProAid nous a facilité la recherche d'une nounou de confiance. Le paiement en escrow nous a vraiment rassurés.",
      name: "Mireille T.",
      role: "Employeuse, Bonapriso",
    },
  },
  {
    initials: "GM",
    color: "#E8A33D",
    en: {
      quote: "Being verified on ProAid helped me get consistent, well-paying work with families I can trust.",
      name: "Grace M.",
      role: "Nanny, Bonamoussadi",
    },
    fr: {
      quote: "Être vérifiée sur ProAid m'a permis d'avoir un travail régulier et bien payé avec des familles de confiance.",
      name: "Grace M.",
      role: "Nounou, Bonamoussadi",
    },
  },
  {
    initials: "JN",
    color: "#4F9B96",
    en: {
      quote: "The contract and clear fee terms made everything transparent from day one.",
      name: "Jacqueline N.",
      role: "Cook, Bonanjo",
    },
    fr: {
      quote: "Le contrat et les conditions de frais claires ont rendu tout transparent dès le premier jour.",
      name: "Jacqueline N.",
      role: "Cuisinière, Bonanjo",
    },
  },
];

export default function LandingPage() {
  const t = useT();
  const locale = useLocale();

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t.landing.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.landing.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-12 px-6 text-base"
                nativeButton={false}
                render={<Link href="/demo/search" />}
              >
                <Search className="h-4 w-4" />
                {t.landing.ctaFindProvider}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
                nativeButton={false}
                render={<Link href="/demo/login" />}
              >
                {t.landing.ctaBecomeProvider}
              </Button>
            </div>
          </div>
          <div className="relative mx-auto grid max-w-sm grid-cols-2 gap-4">
            <Card className="col-span-2 flex items-center gap-3 p-4">
              <InitialsAvatar initials="GM" color="#0F5E5A" size="lg" />
              <div>
                <p className="font-semibold">Grace Mbah</p>
                <p className="text-sm text-muted-foreground">{t.categories.NANNY} &middot; Bonamoussadi</p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber text-amber" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-1 p-4 text-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="text-xs font-semibold">{t.common.verified}</p>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-1 p-4 text-center">
              <Lock className="h-6 w-6 text-primary" />
              <p className="text-xs font-semibold">{t.landing.trustEscrowTitle}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold">{t.landing.categoriesTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Link key={cat} href={`/demo/search?category=${cat}`}>
                <Card className="flex h-full flex-col items-center gap-3 p-6 text-center transition-shadow hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="font-semibold">{t.categories[cat]}</p>
                  <p className="text-xs text-muted-foreground">{t.categoriesDescription[cat]}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold">{t.landing.howItWorksTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: t.landing.step1Title, body: t.landing.step1Body },
              { icon: CalendarCheck, title: t.landing.step2Title, body: t.landing.step2Body },
              { icon: Lock, title: t.landing.step3Title, body: t.landing.step3Body },
              { icon: ClipboardCheck, title: t.landing.step4Title, body: t.landing.step4Body },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </span>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">{t.landing.trustTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardCheck, title: t.landing.trustVettingTitle, body: t.landing.trustVettingBody },
            { icon: Lock, title: t.landing.trustEscrowTitle, body: t.landing.trustEscrowBody },
            { icon: FileText, title: t.landing.trustContractsTitle, body: t.landing.trustContractsBody },
            { icon: Star, title: t.landing.trustReviewsTitle, body: t.landing.trustReviewsBody },
          ].map((card, i) => (
            <Card key={i} className="flex flex-col gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <p className="font-semibold">{card.title}</p>
              <p className="text-sm text-muted-foreground">{card.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-3 text-center text-2xl font-bold">{t.landing.feeTitle}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-primary-foreground/90">{t.landing.feeIntro}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-sm">{t.landing.feeShortTerm}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-sm">{t.landing.feeMonthlyEarly}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-sm">{t.landing.feeMonthlyLate}</p>
            </div>
          </div>
          <Card className="mt-8 border-0 bg-white p-6 text-foreground">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber" />
              <p className="font-semibold">{t.landing.feeExampleTitle}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.landing.feeExampleBody}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="font-semibold">{formatMoney(150000, locale)}</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Fee (month 1-5)</p>
                <p className="font-semibold">{formatMoney(19500, locale)}</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Fee (month 6+)</p>
                <p className="font-semibold">{formatMoney(15000, locale)}</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Provider gets (6+)</p>
                <p className="font-semibold text-primary">{formatMoney(135000, locale)}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">{t.landing.testimonialsTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((item, i) => {
            const content = locale === "fr" ? item.fr : item.en;
            return (
              <Card key={i} className="flex flex-col gap-4 p-6">
                <p className="text-sm italic text-foreground">&ldquo;{content.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <InitialsAvatar initials={item.initials} color={item.color} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{content.name}</p>
                    <p className="text-xs text-muted-foreground">{content.role}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
