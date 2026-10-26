import Link from "next/link";
import { Star } from "lucide-react";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Provider } from "@/lib/data/types";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";

export function ProviderCard({ provider }: { provider: Provider }) {
  const t = useT();
  const locale = useLocale();

  return (
    <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <InitialsAvatar initials={provider.initials} color={provider.avatarColor} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold break-words">{provider.name}</h3>
            {provider.status === "APPROVED" && (
              <Badge variant="secondary" className="shrink-0 gap-1 border-primary/20 bg-primary/10 text-primary">
                {t.providerCard.verifiedBadge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t.categories[provider.category]} &middot; {t.neighbourhoods[provider.neighbourhood]}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber text-amber" />
            <span className="font-medium">{provider.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({provider.reviews.length} {t.common.reviews})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">{formatMoney(provider.monthlyRate, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {provider.isPerJobRate ? t.common.perJob : t.common.perMonth}
          </p>
        </div>
        <Link
          href={`/provider/${provider.id}`}
          className="flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t.providerCard.viewProfile}
        </Link>
      </div>
    </Card>
  );
}
