"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Send, Star, FileText, Wallet as WalletIcon, MessageCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { LifecycleTracker } from "@/components/booking/lifecycle-tracker";
import { MomoModal } from "@/components/payment/momo-modal";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDateTime, interpolate } from "@/lib/format";
import { canTransition as canTransitionContract } from "@/lib/booking";
import { useProviderById, useProviders } from "@/lib/data/providers";
import { useEmployer, useRole } from "@/lib/data/session";
import {
  useBookingById,
  acceptOffer,
  declineOffer,
  withdrawOffer,
  counterOffer,
  fundPeriod,
  fundShortJob,
  confirmShortJobCompletion,
  giveNotice,
  terminateContract,
  cancelOffer,
  requestReplacement,
  raiseDispute,
  submitReview,
  sendMessage,
} from "@/lib/data/bookings";
import { useWalletSummary } from "@/lib/data/wallet";
import { findCurrentPeriod } from "@/store/useAppStore";
import type { DisputeCategory } from "@/lib/data/types";
import { useRequireAnyRole } from "@/lib/hooks/use-require-role";
import { cn } from "@/lib/utils";

export default function BookingDetailPage() {
  useRequireAnyRole();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const role = useRole();
  const employer = useEmployer();

  const booking = useBookingById(id);
  const provider = useProviderById(booking?.providerId);
  const wallet = useWalletSummary(booking?.employerId ?? employer.id);
  const sameCategoryProviders = useProviders(booking ? { category: booking.category } : {});

  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterWage, setCounterWage] = useState(0);
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>("SERVICE_QUALITY");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [replacementProviderId, setReplacementProviderId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (!booking || !provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.bookingDetail.notFound}</p>
      </div>
    );
  }

  const isEmployerView = role === "EMPLOYER";
  const isProviderView = role === "PROVIDER";
  const senderName = isEmployerView ? employer.name : isProviderView ? provider.name : "ProAid Admin";
  const isLongContract = booking.contractKind === "LONG_CONTRACT";
  const currentPeriod = findCurrentPeriod(booking);

  function handleAccept() {
    acceptOffer(booking!.id);
    toast.success(t.bookingDetail.acceptButton);
  }
  function handleDecline() {
    declineOffer(booking!.id);
    toast.success(t.bookingDetail.declineButton);
  }
  function handleWithdraw() {
    withdrawOffer(booking!.id);
    toast.success(t.bookingDetail.withdrawButton);
  }
  function handleCounterSubmit(e: React.FormEvent) {
    e.preventDefault();
    counterOffer(booking!.id, counterWage);
    setCounterOpen(false);
    toast.success(t.bookingDetail.counterButton);
  }
  function handleFundConfirmed() {
    if (isLongContract && currentPeriod) {
      fundPeriod(booking!.id, currentPeriod.id, "MTN", "6xxxxxxxx");
    } else {
      fundShortJob(booking!.id, "MTN", "6xxxxxxxx");
    }
  }
  function handleConfirmJobDone() {
    confirmShortJobCompletion(booking!.id);
  }
  function handleGiveNotice() {
    giveNotice(booking!.id);
    toast.success(t.bookingDetail.giveNoticeButton);
  }
  function handleTerminate() {
    terminateContract(booking!.id, "Ended early by employer");
    setTerminateDialogOpen(false);
    toast.success(t.bookingDetail.terminateButton);
  }
  function handleCancel() {
    cancelOffer(booking!.id);
    setCancelDialogOpen(false);
    toast.success(t.bookingDetail.cancelButton);
  }
  function handleRaiseDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    raiseDispute(booking!.id, currentPeriod?.id, role, disputeCategory, disputeDescription);
    setDisputeDialogOpen(false);
    setDisputeDescription("");
    toast.success(t.bookingDetail.raiseDisputeButton);
  }
  function handleRequestReplacement(e: React.FormEvent) {
    e.preventDefault();
    if (!replacementProviderId) return;
    const newId = requestReplacement(booking!.id, replacementProviderId);
    setReplaceDialogOpen(false);
    router.push(`/demo/booking/${newId}`);
  }
  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !role) return;
    sendMessage(booking!.id, role, senderName, messageText.trim());
    setMessageText("");
  }
  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    submitReview(booking!.id, reviewRating, reviewComment);
    toast.success(t.bookingDetail.reviewSubmitted);
  }

  const headerAmount = isLongContract ? currentPeriod?.employerPaysTotal ?? booking.wage : booking.wage;
  const periodLabel =
    isLongContract && currentPeriod
      ? interpolate(t.bookingDetail.periodOf, { current: currentPeriod.periodNumber, total: booking.periods.length })
      : null;

  const fundAmount = isLongContract ? currentPeriod?.employerPaysTotal ?? 0 : headerAmount;
  const canFund = isEmployerView && (isLongContract ? Boolean(currentPeriod) : canTransitionContract(booking.status, "FUND"));
  const canFundNow = canFund && (isLongContract ? ["AWAITING_FUNDING", "OVERDUE"].includes(currentPeriod?.status ?? "") : true);

  const bookingTransactions = wallet.transactions.filter((tx) => tx.bookingId === booking.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <InitialsAvatar initials={provider.initials} color={provider.avatarColor} />
              <div>
                <p className="font-semibold">{provider.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.categories[provider.category]} &middot; {employer.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{formatMoney(headerAmount, locale)}</p>
              {periodLabel && <p className="text-xs text-muted-foreground">{periodLabel}</p>}
            </div>
          </div>

          <LifecycleTracker status={booking.status} isLongContract={isLongContract} />

          {booking.status === "CLOSED" && <p className="text-sm text-destructive">{t.bookingDetail.closedNotice}</p>}
          {booking.status === "CANCELLED" && <p className="text-sm text-destructive">{t.bookingDetail.cancelledNotice}</p>}
          {booking.status === "TERMINATED" && <p className="text-sm text-destructive">{t.bookingDetail.terminatedNotice}</p>}
          {booking.status === "COMPLETED" && <p className="text-sm text-primary">{t.bookingDetail.completedNotice}</p>}
          {currentPeriod?.status === "OVERDUE" && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> {t.bookingDetail.overdueNotice}
            </p>
          )}
          {currentPeriod?.status === "ON_HOLD" && <p className="text-sm text-amber-foreground">{t.bookingDetail.onHoldNotice}</p>}

          {(isEmployerView || isProviderView) && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <p className="mr-auto text-sm font-semibold">{t.bookingDetail.actionsTitle}</p>

              {isProviderView && canTransitionContract(booking.status, "ACCEPT") && (
                <>
                  <Button onClick={handleAccept}>{t.bookingDetail.acceptButton}</Button>
                  <Button variant="outline" onClick={handleDecline}>
                    {t.bookingDetail.declineButton}
                  </Button>
                  <Button variant="ghost" onClick={() => setCounterOpen(true)}>
                    {t.bookingDetail.counterButton}
                  </Button>
                </>
              )}

              {isEmployerView && booking.status === "COUNTERED" && (
                <>
                  <Button onClick={handleAccept}>{t.bookingDetail.acceptButton}</Button>
                  <Button variant="outline" onClick={handleDecline}>
                    {t.bookingDetail.declineButton}
                  </Button>
                </>
              )}

              {isEmployerView && canTransitionContract(booking.status, "WITHDRAW") && (
                <Button variant="ghost" onClick={handleWithdraw}>
                  {t.bookingDetail.withdrawButton}
                </Button>
              )}

              {booking.status === "PENDING_SIGNATURES" && (
                <Button variant="outline" nativeButton={false} render={<Link href={`/demo/booking/${booking.id}/contract`} />}>
                  {t.bookingDetail.goToContractButton}
                </Button>
              )}

              {canFundNow && (
                <Button onClick={() => setFundModalOpen(true)} className="gap-2">
                  <WalletIcon className="h-4 w-4" />
                  {t.bookingDetail.fundButton}
                </Button>
              )}

              {isEmployerView && !isLongContract && canTransitionContract(booking.status, "CONFIRM") && (
                <Button onClick={handleConfirmJobDone}>{t.bookingDetail.confirmJobDoneButton}</Button>
              )}

              {isEmployerView && booking.status === "ACTIVE" && (
                <Button variant="outline" onClick={handleGiveNotice}>
                  {t.bookingDetail.giveNoticeButton}
                </Button>
              )}

              {isEmployerView && (booking.status === "ACTIVE" || booking.status === "ENDING") && (
                <Button variant="ghost" className="text-destructive" onClick={() => setTerminateDialogOpen(true)}>
                  {t.bookingDetail.terminateButton}
                </Button>
              )}

              {(currentPeriod?.status === "FUNDED" || booking.status === "FUNDED") && (
                <Button variant="ghost" onClick={() => setDisputeDialogOpen(true)}>
                  {t.bookingDetail.raiseDisputeButton}
                </Button>
              )}

              {isEmployerView && booking.status === "TERMINATED" && (
                <Button onClick={() => setReplaceDialogOpen(true)}>{t.bookingDetail.requestReplacementButton}</Button>
              )}

              {isEmployerView && canTransitionContract(booking.status, "CANCEL") && (
                <Button variant="ghost" className="text-destructive" onClick={() => setCancelDialogOpen(true)}>
                  {t.bookingDetail.cancelButton}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {counterOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.bookingDetail.counterButton}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCounterSubmit} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="counterWage">{t.bookingDetail.counterLabel}</Label>
                <Input
                  id="counterWage"
                  type="number"
                  min={0}
                  value={counterWage || booking.wage}
                  onChange={(e) => setCounterWage(Number(e.target.value) || 0)}
                />
              </div>
              <Button type="submit">{t.common.submit}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="contract">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contract" className="gap-2">
            <FileText className="h-4 w-4" /> {t.bookingDetail.contractTab}
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <WalletIcon className="h-4 w-4" /> {t.bookingDetail.paymentTab}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageCircle className="h-4 w-4" /> {t.bookingDetail.messagesTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contract" className="space-y-3">
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.contract.employerLabel}</span>
                <span className="font-medium">
                  {employer.name} {booking.employerSignature.signed ? "✓" : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.contract.providerLabel}</span>
                <span className="font-medium">
                  {provider.name} {booking.providerSignature.signed ? "✓" : "—"}
                </span>
              </div>
              <Button variant="outline" className="w-full" nativeButton={false} render={<Link href={`/demo/booking/${booking.id}/contract`} />}>
                {t.contract.title}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-3">
          {isLongContract && booking.periods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.offerForm.summaryTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.periods.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{interpolate(t.bookingDetail.periodOf, { current: p.periodNumber, total: booking.periods.length })}</span>
                    <span className="text-muted-foreground">{t.periodStatusLabels[p.status]}</span>
                    <span className="font-semibold">{formatMoney(p.employerPaysTotal, locale)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.wallet.transactionHistory}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bookingTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
              ) : (
                bookingTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p>{locale === "fr" ? tx.descriptionFr : tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(tx.timestamp, locale)}</p>
                    </div>
                    <span
                      className={cn(
                        "font-semibold",
                        tx.type === "PAYOUT" || tx.type === "COMMISSION" ? "text-muted-foreground" : "text-primary"
                      )}
                    >
                      {formatMoney(tx.amount, locale)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {booking.status === "COMPLETED" && !booking.review && isEmployerView && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.bookingDetail.reviewTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)}>
                        <Star
                          className={cn(
                            "h-7 w-7",
                            star <= reviewRating ? "fill-amber text-amber" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t.offerForm.notesPlaceholder}
                  />
                  <Button type="submit">{t.bookingDetail.submitReview}</Button>
                </form>
              </CardContent>
            </Card>
          )}
          {booking.review && (
            <Card>
              <CardContent className="flex items-center gap-2 pt-6 text-sm">
                <Star className="h-4 w-4 fill-amber text-amber" />
                <span className="font-semibold">{booking.review.rating}/5</span>
                <span className="text-muted-foreground">&mdash; {booking.review.comment}</span>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {booking.messages.map((m) => {
                  const mine = m.senderRole === role;
                  const text = locale === "fr" && m.textFr ? m.textFr : m.text;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                          mine ? "bg-primary text-primary-foreground" : "bg-secondary"
                        )}
                      >
                        <p className="mb-0.5 text-xs opacity-70">{m.senderName}</p>
                        <p>{text}</p>
                      </div>
                    </div>
                  );
                })}
                {booking.messages.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t.common.noResults}</p>
                )}
              </div>
              {role && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={t.bookingDetail.messagePlaceholder}
                    className="h-11"
                  />
                  <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MomoModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        amount={fundAmount}
        onConfirmed={handleFundConfirmed}
      />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.bookingDetail.confirmCancelTitle}</DialogTitle>
            <DialogDescription>{t.bookingDetail.confirmCancelBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              {t.bookingDetail.cancelButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.bookingDetail.confirmTerminateTitle}</DialogTitle>
            <DialogDescription>{t.bookingDetail.confirmTerminateBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleTerminate}>
              {t.bookingDetail.terminateButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.bookingDetail.raiseDisputeButton}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRaiseDispute} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(["SERVICE_QUALITY", "NON_PAYMENT", "UNSAFE_CONDITIONS", "BREACH_OF_CONTRACT", "OTHER"] as DisputeCategory[]).map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setDisputeCategory(category)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-2 text-left text-xs font-medium",
                      disputeCategory === category ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    {t.disputeCategoryLabels[category]}
                  </button>
                )
              )}
            </div>
            <Textarea
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              placeholder={t.offerForm.notesPlaceholder}
              required
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDisputeDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit">{t.common.submit}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.bookingDetail.requestReplacementButton}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestReplacement} className="space-y-3">
            <div className="space-y-2">
              {sameCategoryProviders
                .filter((p) => p.id !== booking.providerId)
                .slice(0, 5)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setReplacementProviderId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm",
                      replacementProviderId === p.id ? "border-primary bg-primary/10" : "border-border"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setReplaceDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={!replacementProviderId}>
                {t.common.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
