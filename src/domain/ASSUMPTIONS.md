# `src/domain` — assumptions for owner sign-off

Judgment calls made while building the domain engine, where the SRS is silent or ambiguous.
None of these are business-rule changes — they're implementation decisions that need a founder's
confirmation before Release 1 ships. Each links to the module that encodes it.

1. **Half and Half requires an even `durationMonths`.** The SRS defines Half and Half as "half of
   the total wage at the middle of the contract and half at the end" but never states what happens
   for an odd-length contract (e.g. 5 months — there is no clean midpoint). `schedule.ts`'s
   `generateHalfAndHalfPeriods` throws rather than guessing a split. **This throw is a last-resort
   invariant check, not the user-facing validation path** — the offer form (built in Stage D) must
   catch an odd duration before calling this function and show a clear EN/FR message. Needs
   confirmation: should Half and Half simply be unavailable for odd-month contracts, or should an
   uneven split (e.g. 2 months / 3 months) be allowed?

2. **No modeled retry transition out of `PAYOUT_FAILED`.** SRS §7.3 only says a failed payout goes
   to "Finance queue"; it doesn't define how a period leaves that state (manual retry? automatic
   retry with backoff? cancellation and refund instead?). `paymentPeriod.ts` currently treats
   `PAYOUT_FAILED` as terminal. Needs confirmation: what are Finance's actual options here, and do
   they need a new event/transition modeled explicitly?

3. **`CANCEL` is not offered from a short job's `FUNDED` state.** SRS §7.2 states cancellation is
   valid "Any before Active" — read narrowly here to mean any status before a contract starts
   actually running, which for a short job is only `OFFER_SENT`, `COUNTERED`, `PENDING_SIGNATURES`,
   or `SIGNED`. A funded-but-incomplete short job that needs to stop is treated as a dispute
   (BR-DIS), not a plain cancel, since money has already moved into escrow. Needs confirmation:
   is this the intended reading, or should a funded short job still have a direct cancel path
   before the worker starts?

4. **Prorated final-month wage uses the same half-up rounding rule as commission.** BR-FEE-2 only
   defines rounding for commission; `schedule.ts`'s `prorateFinalContractMonth` applies the same
   round-half-up rule to the prorated wage itself (then recomputes commission from that rounded
   wage) for consistency. Needs confirmation: should the wage ever be rounded differently from
   commission (e.g. always rounded down, to favor the worker)?

5. **Loyalty's `PENDING` / `FUNDED` / `REMOVED` reserved-vs-counted design.** BR-FEE-4 (rate frozen
   at signing) and BR-LOY-2 (only funded months count) are individually unambiguous but interact:
   a month's rate must be assigned before it is known whether that month will ever fund.
   `loyalty.ts` resolves this with two distinct counts — `reservedLoyaltyMonths` (not yet removed)
   for pricing a newly-signed contract, `countedLoyaltyMonths` (funded only) for what the employer
   dashboard displays. This is an implementation choice to reconcile the two rules, not a rule
   itself, and is covered by tests but not written anywhere in the SRS text. Needs confirmation
   that this reconciliation matches the founders' intent.
