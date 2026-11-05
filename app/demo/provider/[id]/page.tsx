"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Phone, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDate } from "@/lib/format";
import { useProviderById } from "@/lib/data/providers";
import { useRole } from "@/lib/data/session";

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const role = useRole();
  const provider = useProviderById(id);

  if (!provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.providerProfile.notFound}</p>
      </div>
    );
  }

  const verificationItems: { key: keyof typeof provider.verification; label: string }[] = [
    { key: "idVerified", label: t.verification.idVerified },
    { key: "referencesConfirmed", label: t.verification.referencesConfirmed },
    { key: "medicalCertificate", label: t.verification.medicalCertificate },
    { key: "skillsCheck", label: t.verification.skillsCheck },
  ];

  const bio = locale === "fr" ? provider.bioFr : provider.bio;
  const skills = locale === "fr" ? provider.skillsFr : provider.skills;

  function handleBook() {
    if (!role) {
      router.push("/demo/login");
      return;
    }
    router.push(`/demo/book/${provider!.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start">
          <InitialsAvatar initials={provider.initials} color={provider.avatarColor} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.status === "APPROVED" && (
                <Badge className="gap-1 border-primary/20 bg-primary/10 text-primary">
                  {t.providerCard.verifiedBadge}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {t.categories[provider.category]} &middot; {t.neighbourhoods[provider.neighbourhood]}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber text-amber" />
              <span className="font-semibold">{provider.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({provider.reviews.length} {t.common.reviews})
              </span>
            </div>
            <p className="mt-3 text-sm">
              {provider.yearsExperience} {t.providerProfile.experienceYears} &middot;{" "}
              {t.workType[provider.workType]}
            </p>
            <p className="mt-1 text-sm">
              {t.providerProfile.languagesLabel}:{" "}
              {provider.languages.map((l) => t.spokenLanguage[l]).join(", ")}
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-56">
            <Card className="bg-secondary/50">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground">{t.providerProfile.rateLabel}</p>
                <p className="text-2xl font-bold text-primary">{formatMoney(provider.monthlyRate, locale)}</p>
                <p className="text-xs text-muted-foreground">
                  {provider.isPerJobRate ? t.common.perJob : t.common.perMonth}
                </p>
                <Button className="mt-4 h-11 w-full" onClick={handleBook}>
                  {t.providerProfile.bookNow}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {t.providerProfile.phoneHiddenNote}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.providerProfile.about}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{bio}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.providerProfile.skillsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.providerProfile.verificationTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {verificationItems.map((item) => {
              const checked = provider.verification[item.key];
              return (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  {checked ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t.providerProfile.reviewsTitle} ({provider.reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.providerProfile.noReviews}</p>
          ) : (
            provider.reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{review.authorName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                    <span className="text-sm font-semibold">{review.rating}</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === "fr" ? review.commentFr : review.comment}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(review.date, locale)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Link href="/demo/search" className="inline-block text-sm font-medium text-primary hover:underline">
        &larr; {t.search.title}
      </Link>
    </div>
  );
}
