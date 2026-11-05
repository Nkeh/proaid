import { useMemo } from "react";
import { useAppStore, type CreateOfferInput, type PaymentMethod } from "@/store/useAppStore";
import type { Booking, DisputeCategory, Role } from "./types";

function byRecent(a: Booking, b: Booking): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export function useBookingById(id: string | undefined): Booking | undefined {
  return useAppStore((s) => (id ? s.bookings.find((b) => b.id === id) : undefined));
}

export function useBookingsForEmployer(employerId: string): Booking[] {
  const bookings = useAppStore((s) => s.bookings);
  return useMemo(
    () => bookings.filter((b) => b.employerId === employerId).sort(byRecent),
    [bookings, employerId]
  );
}

export function useBookingsForProvider(providerId: string): Booking[] {
  const bookings = useAppStore((s) => s.bookings);
  return useMemo(
    () => bookings.filter((b) => b.providerId === providerId).sort(byRecent),
    [bookings, providerId]
  );
}

export function useAllBookings(): Booking[] {
  const bookings = useAppStore((s) => s.bookings);
  return useMemo(() => bookings.slice().sort(byRecent), [bookings]);
}

export function makeOffer(input: CreateOfferInput): string {
  return useAppStore.getState().makeOffer(input);
}

export function counterOffer(id: string, newWage: number): void {
  useAppStore.getState().counterOffer(id, newWage);
}

export function acceptOffer(id: string): void {
  useAppStore.getState().acceptOffer(id);
}

export function declineOffer(id: string): void {
  useAppStore.getState().declineOffer(id);
}

export function withdrawOffer(id: string): void {
  useAppStore.getState().withdrawOffer(id);
}

export function signContract(id: string, role: Role, fullName: string): string {
  return useAppStore.getState().signContract(id, role, fullName);
}

export function fundPeriod(
  bookingId: string,
  periodId: string,
  method: PaymentMethod,
  phoneNumber: string
): boolean {
  return useAppStore.getState().fundPeriod(bookingId, periodId, method, phoneNumber);
}

export function fundShortJob(bookingId: string, method: PaymentMethod, phoneNumber: string): boolean {
  return useAppStore.getState().fundShortJob(bookingId, method, phoneNumber);
}

export function confirmShortJobCompletion(id: string): void {
  useAppStore.getState().confirmShortJobCompletion(id);
}

export function giveNotice(bookingId: string): void {
  useAppStore.getState().giveNotice(bookingId);
}

export function cancelOffer(bookingId: string): void {
  useAppStore.getState().cancelOffer(bookingId);
}

export function terminateContract(bookingId: string, reason: string): void {
  useAppStore.getState().terminateContract(bookingId, reason);
}

export function requestReplacement(bookingId: string, newProviderId: string): string {
  return useAppStore.getState().requestReplacement(bookingId, newProviderId);
}

export function raiseDispute(
  bookingId: string,
  periodId: string | undefined,
  role: Role,
  category: DisputeCategory,
  description: string
): void {
  useAppStore.getState().raiseDispute(bookingId, periodId, role, category, description);
}

export function submitReview(id: string, rating: number, comment: string): void {
  useAppStore.getState().submitReview(id, rating, comment);
}

export function sendMessage(bookingId: string, role: Role, senderName: string, text: string): void {
  useAppStore.getState().sendMessage(bookingId, role, senderName, text);
}
