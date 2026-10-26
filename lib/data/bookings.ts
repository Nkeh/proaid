import { useMemo } from "react";
import { useAppStore, type CreateBookingInput, type PaymentMethod } from "@/store/useAppStore";
import type { Booking, Role } from "./types";

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

export function createBooking(input: CreateBookingInput): string {
  return useAppStore.getState().createBooking(input);
}

export function acceptBooking(id: string): void {
  useAppStore.getState().acceptBooking(id);
}

export function declineBooking(id: string): void {
  useAppStore.getState().declineBooking(id);
}

export function signContract(id: string, role: Role, fullName: string): void {
  useAppStore.getState().signContract(id, role, fullName);
}

export function fundBooking(id: string, method: PaymentMethod, phoneNumber: string): boolean {
  return useAppStore.getState().fundBooking(id, method, phoneNumber);
}

export function confirmService(id: string): void {
  useAppStore.getState().confirmService(id);
}

export function cancelBooking(id: string): void {
  useAppStore.getState().cancelBooking(id);
}

export function submitReview(id: string, rating: number, comment: string): void {
  useAppStore.getState().submitReview(id, rating, comment);
}

export function sendMessage(bookingId: string, role: Role, senderName: string, text: string): void {
  useAppStore.getState().sendMessage(bookingId, role, senderName, text);
}

export function fastForwardToMonth6(bookingId: string): void {
  useAppStore.getState().fastForwardToMonth6(bookingId);
}
