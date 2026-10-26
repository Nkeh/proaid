"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Send, Star, FileText, Wallet as WalletIcon, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { LifecycleTracker } from "@/components/booking/lifecycle-tracker";
import { MomoModal } from "@/components/payment/momo-modal";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDateTime, interpolate } from "@/lib/format";
import { calculateFee } from "@/lib/fees";
import { canTransition, toBookingLike } from "@/lib/booking";
import { useProviderById } from "@/lib/data/providers";
import { useEmployer, useRole } from "@/lib/data/session";
import {
  useBookingById,
  acceptBooking,
  declineBooking,
  fundBooking,
  confirmService,
  cancelBooking,
  submitReview,
  sendMessage,
} from "@/lib/data/bookings";
import { useWallet } from "@/lib/data/wallet";
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
  const wallet = useWallet();

  const booking = useBookingById(id);
  const provider = useProviderById(booking?.providerId);

  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
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

  const bookingLike = toBookingLike(booking);
  const isEmployerView = role === "EMPLOYER";
  const isProviderView = role === "PROVIDER";
  const senderName = isEmployerView ? employer.name : isProviderView ? provider.name : "ProAid Admin";

  const { providerAmount } = calculateFee({
    contractType: booking.contractType,
    amount: booking.amount,
    monthNumber: booking.currentMonth,
  });

  function handleAccept() {
    acceptBooking(booking!.id);
    toast.success(t.bookingDetail.acceptButton);
  }
  function handleDecline() {
    declineBooking(booking!.id);
    toast.success(t.bookingDetail.declineButton);
  }
  function handleFundClick() {
    if (wallet.balance < booking!.amount) {
      toast.error(t.wallet.insufficientFunds);
      router.push("/wallet");
      return;
    }
    setFundModalOpen(true);
  }
  function handleFundConfirmed(method: "MTN" | "ORANGE", phone: string) {
    fundBooking(booking!.id, method, phone);
  }
  function handleConfirmServiceConfirmed() {
    confirmService(booking!.id);
  }
  function handleCancel() {
    cancelBooking(booking!.id);
    setCancelDialogOpen(false);
    toast.success(t.bookingDetail.cancelButton);
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

  const monthLabel =
    booking.contractType === "MONTHLY"
      ? interpolate(t.bookingDetail.monthOf, { current: booking.currentMonth, total: booking.durationMonths })
      : null;

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
              <p className="text-lg font-bold text-primary">{formatMoney(booking.amount, locale)}</p>
              {monthLabel && <p className="text-xs text-muted-foreground">{monthLabel}</p>}
            </div>
          </div>

          <LifecycleTracker status={booking.status} />

          {booking.status === "DECLINED" && (
            <p className="text-sm text-destructive">{t.bookingDetail.declinedNotice}</p>
          )}
          {booking.status === "CANCELLED" && (
            <p className="text-sm text-destructive">{t.bookingDetail.cancelledNotice}</p>
          )}
          {booking.status === "COMPLETED" && !monthLabel && (
            <p className="text-sm text-primary">{t.bookingDetail.completedNotice}</p>
          )}

          {(isEmployerView || isProviderView) && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <p className="mr-auto text-sm font-semibold">{t.bookingDetail.actionsTitle}</p>

              {isProviderView && canTransition(bookingLike, "ACCEPT") && (
                <>
                  <Button onClick={handleAccept}>{t.bookingDetail.acceptButton}</Button>
                  <Button variant="outline" onClick={handleDecline}>
                    {t.bookingDetail.declineButton}
                  </Button>
                </>
              )}

              {canTransition(bookingLike, "SIGN") && (
                <Button variant="outline" nativeButton={false} render={<Link href={`/booking/${booking.id}/contract`} />}>
                  {t.bookingDetail.goToContractButton}
                </Button>
              )}

              {isEmployerView && canTransition(bookingLike, "FUND") && (
                <Button onClick={handleFundClick} className="gap-2">
                  <WalletIcon className="h-4 w-4" />
                  {t.bookingDetail.fundButton}
                </Button>
              )}

              {isEmployerView && canTransition(bookingLike, "CONFIRM_SERVICE") && (
                <Button onClick={() => setConfirmModalOpen(true)} className="gap-2">
                  {t.bookingDetail.confirmServiceButton}
                </Button>
              )}

              {isEmployerView && canTransition(bookingLike, "CANCEL") && (
                <Button variant="ghost" className="text-destructive" onClick={() => setCancelDialogOpen(true)}>
                  {t.bookingDetail.cancelButton}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button variant="outline" className="w-full" nativeButton={false} render={<Link href={`/booking/${booking.id}/contract`} />}>
                {t.contract.title}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.wallet.transactionHistory}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wallet.transactions.filter((tx) => tx.bookingId === booking.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
              ) : (
                wallet.transactions
                  .filter((tx) => tx.bookingId === booking.id)
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p>{locale === "fr" ? tx.descriptionFr : tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(tx.timestamp, locale)}</p>
                      </div>
                      <span
                        className={cn(
                          "font-semibold",
                          tx.type === "PAYOUT" || tx.type === "FEE" ? "text-muted-foreground" : "text-primary"
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
                    placeholder={t.bookingForm.notesPlaceholder}
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
        mode="FUND"
        amount={booking.amount}
        onConfirmed={handleFundConfirmed}
      />
      <MomoModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        mode="PAYOUT"
        amount={providerAmount}
        onConfirmed={handleConfirmServiceConfirmed}
        recipientNote={provider.momoNumber}
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
    </div>
  );
}
