"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME, useRole } from "@/lib/data/session";
import type { Role } from "@/lib/data/types";

/**
 * Redirects to /login if no role is set, or to that role's own home if it doesn't
 * match `required`. Redirecting to the current role's home (rather than always to
 * /login) matters because the Demo panel's role switch updates the store and
 * navigates in the same tick - whichever page is still mounted when the role
 * changes must land somewhere consistent with that navigation, not force a
 * re-login.
 */
export function useRequireRole(required: Role): Role | null {
  const role = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role === null) {
      router.replace("/login");
    } else if (role !== required) {
      router.replace(ROLE_HOME[role]);
    }
  }, [role, required, router]);

  return role === required ? role : null;
}

/** Redirects to /login if no role is set at all (used on pages shared across roles). */
export function useRequireAnyRole(): Role | null {
  const role = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!role) {
      router.replace("/login");
    }
  }, [role, router]);

  return role;
}
