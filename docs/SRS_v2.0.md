# PROAID CAMEROON

**SOFTWARE REQUIREMENTS SPECIFICATION**

*Online marketplace for domestic and personal care services in Cameroon*

Version 2.0 \| October 2026 \| Based on IEEE Std 830-1998

| **Document Field** | **Details**                                                                                                       |
|--------------------|-------------------------------------------------------------------------------------------------------------------|
| Document Title     | ProAid Cameroon Software Requirements Specification                                                               |
| Version            | 2.0 (supersedes version 1.0 of February 2026)                                                                     |
| Date               | October 2026                                                                                                      |
| Prepared By        | Bonya Ransom Nkeh and Chia Raissa Fien                                                                            |
| Source Documents   | ProAid Comprehensive Business Plan (updated October 2026); ProAid SRS v1.0; findings from the pitch demonstration |
| Document Type      | Software Requirements Specification                                                                               |
| Confidentiality    | Confidential. Internal use only.                                                                                  |

**Revision History**

| **Version** | **Date**      | **Summary of Changes**                                                                                                                                                                                                                                                                                                               |
|-------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0         | February 2026 | Initial release. Web-first scope, Douala only, tiered commission on seeker contract count.                                                                                                                                                                                                                                           |
| 2.0         | October 2026  | Full alignment with the updated business plan: employer-paid Loyalty Fee Plan, escrow per payment period, replacement guarantee, disputes, expanded vetting, Douala and Bamenda offices, release plan (website, mobile app, training, Year 2 streams), payment ledger, staff roles, data protection update, open decisions register. |

# 0. Summary of Changes from Version 1.0

This section lets readers of version 1.0 see quickly what has changed.
Every item below is specified in detail later in the document.

| **Area**                  | **Version 1.0**                                                                 | **Version 2.0**                                                                                                                                                                                                             |
|---------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Terminology               | Seeker and Provider                                                             | Employer and Service Provider (also called Worker in some screens), matching the business plan                                                                                                                              |
| Who pays the fee          | Commission deducted from the payment                                            | Commission paid by the employer on top of the wage. Workers always receive 100% of the agreed pay                                                                                                                           |
| Fee model                 | 10% for contracts 0 to 4, 0% on contract 5, then reducing 1% per contract to 5% | ProAid Loyalty Fee Plan: short jobs 14% once; longer contracts 12% in the employer's first 12 months of contract time, 6% in months 13 to 24, 4% from month 25                                                              |
| Payment flow              | Single payment after admin validation of the contract                           | Escrow per payment period. Employer funds within the first 10 days of each period; worker paid on the agreed payment date unless a dispute is raised. Short jobs paid at booking and released within 48 hours of completion |
| Payment schedule          | Not defined                                                                     | Monthly, or half at the middle and half at the end of the contract                                                                                                                                                          |
| Payment methods           | MTN MoMo, Orange Money and card                                                 | MTN MoMo and Orange Money through a licensed payment aggregator. Card removed from Release 1                                                                                                                                |
| Contract validation       | Mandatory admin validation of every contract                                    | No mandatory validation. Automatic risk flags send unusual contracts to Operations for review                                                                                                                               |
| Vetting                   | National ID and two references                                                  | ID, criminal record extract, medical certificate, two referees, in-person interview, skills confirmation, qualifications, annual renewal                                                                                    |
| Locations                 | Douala                                                                          | Offices and vetting in Douala and Bamenda; platform open to users across Cameroon                                                                                                                                           |
| New features              | Not present                                                                     | Free replacement guarantee, dispute process, job requests, counter-offers, messaging before booking, referral programme, assisted registration at offices, double-entry ledger and reconciliation, staff roles              |
| Scope and releases        | Web only; mobile out of scope                                                   | Release 1 website (Month 3), Release 2 mobile app (Month 5), Release 3 training (Month 6), Release 4 corporate packages, advertising and home services (Year 2)                                                             |
| Premium seeker ranking    | Premium seekers see premium providers first                                     | Removed. Premium features may be considered later and are not in scope                                                                                                                                                      |
| Dual-role accounts        | Must have                                                                       | Deferred to Release 2 as Could have (see open decision OD-10)                                                                                                                                                               |
| Data protection reference | Law No. 2010/012                                                                | Law No. 2024/017 of 23 December 2024 on personal data protection                                                                                                                                                            |

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional
and non-functional requirements of the ProAid Cameroon platform. It is
the reference for the development team, the founders, quality assurance,
and anyone building or testing the system. Where this document and the
business plan disagree, the business plan sets the business intent and
this document must be corrected.

## 1.2 Product Overview

ProAid Cameroon is an online two-sided marketplace that connects
employers (families, working professionals, expatriates, elderly people
and, later, companies) with vetted domestic and personal care service
providers: nannies, cleaners, caregivers for elderly or special needs
persons, personal cooks and housemate support. ProAid is not an agency
and does not employ the workers. It verifies providers, hosts search,
messaging, offers, contracts and payments, and earns a commission that
the employer pays on top of the agreed wage.

Payments run through an escrow arrangement with a licensed mobile money
payment aggregator. The employer funds each payment period in advance,
ProAid's commission is collected at funding, and the worker's pay is
released on the agreed date unless the employer raises a dispute. A free
replacement is always offered if a worker leaves, and employers pay a
lower commission the longer they use ProAid.

## 1.3 Scope and Releases

The system is delivered in four releases that follow the launch timeline
in the business plan. Months are counted from receipt of funding.

| **Release**        | **Target**              | **Content**                                                                                                                                                                                                                                                                |
|--------------------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1: Website        | Month 3 (public launch) | Responsive bilingual website and PWA for employers and providers; registration, vetting workflow, search, messaging, offers, contracts, escrow payments, loyalty fees, replacements, disputes, reviews, notifications, referral programme, staff back office and analytics |
| R2: Mobile app     | Month 5                 | Android app (iOS following) using the same API; push notifications; real-time messaging; low-data mode; optional dual-role accounts                                                                                                                                        |
| R3: Training       | Month 6                 | Paid training courses (10,000 XAF each), quizzes, verifiable certificates and profile badges                                                                                                                                                                               |
| R4: Year 2 streams | Year 2                  | Corporate packages (50,000 XAF per month per company), partner advertising, and home services (janitorial and deep cleaning, housekeeping, plumbing, electrical work, repairs)                                                                                             |

Out of scope for all releases in this document: card payments, bank
transfers, AI-based vetting, premium employer subscriptions, operations
outside Cameroon, and payroll or tax filing on behalf of employers.

## 1.4 Definitions and Abbreviations

| **Term**                            | **Definition**                                                                                                                                          |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Employer                            | A registered user who hires a service provider through the platform. Called Seeker in version 1.0                                                       |
| Service Provider (Provider, Worker) | A registered user who offers domestic or personal care services after passing vetting                                                                   |
| Staff                               | ProAid personnel using the back office: Super Admin, Operations and Vetting Officer, Support Agent, Finance Officer, Content Manager                    |
| Office                              | A physical ProAid office where in-person onboarding, interviews and support take place: Douala and Bamenda in Release 1                                 |
| Short job                           | A one-time job or a contract lasting 1 month or less. Charged 14% once; does not count towards loyalty                                                  |
| Long contract                       | A contract lasting more than 1 month                                                                                                                    |
| Payment period                      | The part of a long contract covered by one payment: one calendar contract month (monthly schedule) or one half of the contract (half and half schedule) |
| Funding window                      | The first 10 days of a payment period, during which the employer must fund the escrow                                                                   |
| Payment date                        | The date in a payment period on which the worker's pay is released. Default: last day of the period                                                     |
| Escrow                              | Funds paid by the employer and held with the payment aggregator until release to the worker or refund                                                   |
| Commission                          | ProAid's fee, paid by the employer on top of the wage                                                                                                   |
| Loyalty month                       | A month counted towards an employer's loyalty level, according to rule BR-LOY                                                                           |
| Loyalty level                       | Level 1 (12%), Level 2 (6%) or Level 3 (4%), set by the employer's loyalty months                                                                       |
| Replacement                         | A new contract offered free of charge when a worker leaves a long contract, continuing the employer's loyalty count                                     |
| Dispute                             | A formal issue raised by either party that holds the release of the affected funds until resolved                                                       |
| Aggregator                          | A licensed payment company that collects and disburses MTN MoMo and Orange Money payments on ProAid's behalf                                            |
| Ledger                              | ProAid's internal double-entry record of every money movement                                                                                           |
| XAF                                 | Central African CFA franc. All amounts are whole XAF                                                                                                    |
| KYC                                 | Know Your Customer: identity and background verification                                                                                                |
| OTP                                 | One-time password sent by SMS                                                                                                                           |
| PWA                                 | Progressive Web App: a website that can be installed on a phone home screen                                                                             |
| MoSCoW                              | Priority scale: Must, Should, Could, Won't (this release)                                                                                               |
| R1 to R4                            | Release 1 to Release 4 (section 1.3)                                                                                                                    |
| OD                                  | Open decision: an item the founders must confirm (section 11)                                                                                           |

## 1.5 References

- IEEE Std 830-1998, Recommended Practice for Software Requirements
  Specifications

- ProAid Cameroon Comprehensive Business Plan, updated October 2026

- ProAid Cameroon SRS version 1.0, February 2026

- Law No. 2024/017 of 23 December 2024 relating to personal data
  protection in Cameroon

- Law No. 2010/021 of 21 December 2010 on electronic commerce in
  Cameroon

- Framework Law No. 2011/012 of 6 May 2011 on consumer protection in
  Cameroon

- Documentation of the selected payment aggregator, MTN MoMo and Orange
  Money

## 1.6 Document Overview

Section 2 describes the product and its environment. Section 3 states
the business rules that govern fees, payments, replacements and
disputes. Section 4 lists the functional requirements by module. Section
5 covers external interfaces, section 6 non-functional requirements,
section 7 state models, and section 8 data requirements. Section 9 sets
acceptance criteria per release, section 10 lists constraints,
assumptions and risks, and section 11 lists open decisions. Appendices
give the traceability matrix and worked fee examples.

# 2. Overall Description

## 2.1 Product Perspective

ProAid is a new, standalone platform that formalises a market served
today by word of mouth, brokers, WhatsApp and Facebook groups, a few
placement agencies (such as Agence Chez Nous and Allonounou) and one new
general services app (QwickServices). ProAid differs by specialising in
care in the home, deeper vetting, contracts built for months of work,
free replacements, loyalty pricing and a commission that never comes out
of the worker's pay. The system depends on the external services below.

| **External System**                            | **Interaction**       | **Purpose**                                                                                                        |
|------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------|
| Payment aggregator (MTN MoMo and Orange Money) | REST API and webhooks | Collect employer payments, hold escrow, disburse worker payouts and refunds, provide statements for reconciliation |
| SMS gateway (for example Africa's Talking)     | REST API              | OTP codes, payment confirmations, funding reminders, offer and dispute alerts                                      |
| Transactional email service                    | REST API              | Receipts, contracts and notifications for users with a verified email                                              |
| Object storage                                 | SDK over HTTPS        | Private storage of ID documents, certificates, contracts and photos                                                |
| Push notification service                      | SDK                   | Mobile app notifications (R2)                                                                                      |
| Error tracking and uptime monitoring           | SDK and HTTPS         | Detect failures, especially in payment jobs                                                                        |

## 2.2 Product Functions

- Registration and login by phone number with SMS OTP, bilingual
  interface, and assisted registration at the offices.

- Provider profiles and a full vetting workflow with in-person
  interviews in Douala and Bamenda.

- Search, shortlists and job requests for employers; job alerts for
  providers.

- Messaging before and during contracts, with contact details masked
  until a contract is active.

- Offers, counter-offers and bilingual contracts signed with SMS OTP.

- Escrow payments per payment period, the Loyalty Fee Plan, automatic
  release and payouts.

- Free replacement requests, disputes, reviews and notifications.

- Training courses and certificates (R3); corporate packages,
  advertising and home services (R4).

- Staff back office: vetting, payments monitoring, disputes,
  configuration, analytics aligned to the financial plan, and an audit
  log.

## 2.3 User Classes

| **User Class**                 | **Digital Literacy** | **Characteristics**                                                                                                                           |
|--------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Visitor                        | Low to medium        | Browses the website, reads how it works and the fee plan, views anonymised provider cards                                                     |
| Employer                       | Medium               | Middle to high income household, professional or expatriate; values safety, clear terms and convenience; usually pays by MoMo or Orange Money |
| Service Provider               | Low to medium        | May need help at an office to register; mostly uses an Android phone; wants fair pay, on-time payment and recognition                         |
| Corporate Client (R4)          | Medium to high       | Company, NGO or embassy managing care or home services for staff                                                                              |
| Operations and Vetting Officer | High                 | Office-based staff who interview and vet providers, handle replacements and disputes                                                          |
| Support Agent                  | High                 | Answers user questions, reviews reports, assists with accounts                                                                                |
| Finance Officer                | High                 | Monitors escrow, payouts, refunds and reconciliation                                                                                          |
| Content Manager                | High                 | Maintains website content, templates, courses and advertising                                                                                 |
| Super Admin                    | High                 | Founders; full configuration rights including fees                                                                                            |

## 2.4 Operating Environment

- Web (R1): current versions of Chrome, Firefox, Safari and Edge, and
  Chrome on Android 8 or later. Fully responsive; designed mobile first
  for screens from 360 pixels wide. Installable as a PWA.

- Mobile app (R2): Android 8.0 or later first; iOS 15 or later to
  follow.

- Network: must remain usable on 3G connections and recover gracefully
  from dropped connections.

- Server: cloud hosting, PostgreSQL database, scheduled job runner,
  private object storage. Hosting location is subject to open decision
  OD-06.

## 2.5 Reference Architecture

The following architecture is recommended because it builds on the pitch
demo and supports the mobile app in Release 2. The development team may
change it if the requirements in this document are still met.

| **Component**   | **Recommendation**                                                                                                                                           |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Web application | Next.js with TypeScript, responsive, bilingual (EN and FR), PWA. The demo's screens and fee display are reused where they fit                                |
| API             | Versioned REST API under /api/v1 returning JSON, documented with OpenAPI. Used by both the website and the mobile app; no business logic only in the browser |
| Domain logic    | Fee engine, loyalty counting, payment period scheduling and state machines in a framework-independent TypeScript module with full unit test coverage         |
| Database        | PostgreSQL with versioned migrations (for example Prisma)                                                                                                    |
| Background jobs | Scheduler running at least every 15 minutes for reminders, overdue checks, releases, payout retries, offer expiry and document expiry. Every job idempotent  |
| Files           | Private object storage; access only through short-lived signed URLs                                                                                          |
| Mobile app (R2) | React Native (Expo) sharing types and API client with the website                                                                                            |

## 2.6 Design and Implementation Constraints

- Payments are limited to MTN MoMo and Orange Money through a licensed
  aggregator. ProAid must not hold customer funds in its own accounts.

- All user-facing text must exist in English and French from Release 1.

- All amounts are stored as whole XAF integers. Floating point
  arithmetic must never be used for money.

- Commission rates and amounts are frozen on each payment period when it
  is scheduled and cannot change afterwards.

- The platform must comply with Law No. 2024/017 on personal data
  protection, including any authorisation or declaration required by the
  data protection authority and the rules on transfer of data outside
  Cameroon.

- Uploaded files are scanned for malware and limited to allowed file
  types.

- Contract templates must be reviewed by a Cameroonian labour law
  professional before Release 1.

## 2.7 Assumptions and Dependencies

- Users have a phone able to receive SMS; most employers and providers
  use mobile money.

- A licensed aggregator offering collections, disbursements, webhooks
  and a sandbox for MTN MoMo and Orange Money in Cameroon is contracted
  before Month 2.

- Providers can obtain a national ID or passport, a criminal record
  extract and a medical certificate.

- The founders staff the vetting process in Year 1 (business plan
  section 8.8).

- Offices in Douala (Month 1) and Bamenda (Month 2 to 3) are available
  for interviews and assisted registration.

# 3. Business Rules

The rules in this section are the single source of truth for money and
contract behaviour. Every functional requirement that touches money must
apply them through the fee engine (FR-FEE-01). Values shown in square
brackets are configurable by a Super Admin with an effective date.

## 3.1 BR-FEE: ProAid Loyalty Fee Plan

| **Service**                                              | **Commission (paid by employer)**  | **Notes**                                                         |
|----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| Short job: one-time job or contract of 1 month or less   | \[14%\] of the agreed amount, once | Does not count towards loyalty                                    |
| Long contract, employer loyalty months 1 to 12 (Level 1) | \[12%\] of the wage for each month | Loyalty Level 1                                                   |
| Long contract, loyalty months 13 to 24 (Level 2)         | \[6%\] of the wage                 | Loyalty Level 2                                                   |
| Long contract, loyalty month 25 onwards (Level 3)        | \[4%\] of the wage                 | Loyalty Level 3                                                   |
| Service providers                                        | None                               | Registration and vetting are free. Workers keep 100% of their pay |

- **BR-FEE-1** The commission is added on top of the wage. The amount
  the employer funds is wage plus commission. The worker always receives
  the full wage.

- **BR-FEE-2** Commission is rounded to the nearest whole XAF, half
  rounding up, per contract month, before summing.

- **BR-FEE-3** Each contract month of a long contract is charged at the
  rate of the loyalty level that applies to that month. A payment period
  covering several months may therefore combine rates.

- **BR-FEE-4** The rate and amount of every payment period are
  calculated when the period is scheduled and stored on the period.
  Later changes to configuration or loyalty never change a scheduled
  period.

- **BR-FEE-5** Discounts (for example referral credits) reduce the
  commission only, never the wage, and never below zero.

- **BR-FEE-6** Home services (R4) are always charged as short jobs.

## 3.2 BR-LOY: Loyalty Counting

- **BR-LOY-1** Loyalty belongs to the employer, not to a contract.
  Months under long contracts add up across all of an employer's long
  contracts, including with different workers.

- **BR-LOY-2** One loyalty month is counted for each funded contract
  month of each long contract. Concurrent long contracts each add their
  own months (OD-01, decided).

- **BR-LOY-3** Breaks do not count. Months without an active long
  contract are not added, but loyalty already earned is kept with no
  expiry.

- **BR-LOY-4** Short jobs never add loyalty months.

- **BR-LOY-5** A replacement contract continues the employer's loyalty
  count. Example: a nanny leaves after 8 months; the replacement
  contract starts at loyalty month 9, so the employer moves to 6% after
  four more months.

- **BR-LOY-6** A loyalty month that is fully refunded after a dispute is
  removed from the count.

- **BR-LOY-7** Level thresholds: months 1 to \[12\] Level 1; months
  \[13\] to \[24\] Level 2; month \[25\] onwards Level 3.

## 3.3 BR-PAY: Payment Schedule and Escrow

- **BR-PAY-1** For a long contract the employer chooses one schedule:
  Monthly, or Half and Half (half of the total wage at the middle of the
  contract and half at the end).

- **BR-PAY-2** Monthly schedule: each contract month is one payment
  period, starting on the contract start date and on the same day of
  each following month.

- **BR-PAY-3** Half and Half schedule: period 1 runs from the start date
  to the midpoint; period 2 from the midpoint to the end date. Each
  period carries half of the total wage. A Half and Half schedule
  requires a fixed end date.

- **BR-PAY-4** Within the first \[10\] days of each payment period (the
  funding window) the employer funds the escrow with the worker's pay
  for that period plus the commission. An employer may fund in advance.

- **BR-PAY-5** The commission is collected (recognised as ProAid income)
  when the period is funded. The wage is held in escrow for the worker.

- **BR-PAY-6** The wage is released to the worker's mobile money number
  on the payment date (default: last day of the period, or the date
  agreed in the contract), unless a dispute on that period is open.

- **BR-PAY-7** Short jobs: the employer pays the full amount plus
  \[14%\] when the contract is signed. The worker is paid within \[48\]
  hours of completing the job unless a problem is reported in that time.

- **BR-PAY-8** All payments are processed by the licensed aggregator.
  ProAid never holds customer funds in its own bank or mobile money
  accounts.

- **BR-PAY-9** If a period is not funded by the end of the funding
  window it becomes Overdue (FR-PAY-04). The worker is told immediately
  so that they are never left working without knowing.

- **BR-PAY-10** Aggregator transaction fees are absorbed by ProAid by
  default (open decision OD-02).

## 3.4 BR-CAN: Cancellation, Termination and Refunds (defaults, see OD-04)

- **BR-CAN-1** Cancelled before the start date: full refund of wage and
  commission.

- **BR-CAN-2** Long contract ended with notice: the final period is
  prorated by days worked. Unused wage is refunded or moved to a
  replacement contract at the employer's choice; the commission on
  unused days is refunded on the same basis.

- **BR-CAN-3** Default notice period: \[14\] days for either party on
  long contracts, unless the contract states otherwise. Immediate
  termination for serious misconduct is decided by Operations through a
  dispute.

- **BR-CAN-4** Dispute outcomes that refund wage also refund the
  matching share of commission.

## 3.5 BR-REP: Replacement Guarantee

- **BR-REP-1** If a worker leaves a long contract, or the contract ends
  early after a dispute decided in the employer's favour, the employer
  may request a replacement at no extra charge.

- **BR-REP-2** The replacement contract is linked to the original,
  continues the employer's loyalty count, and charges commission only on
  wages, as normal.

- **BR-REP-3** There is no limit on the number of replacements by
  default; Operations may decline a request in cases of abuse, with a
  recorded reason (open decision OD-05).

## 3.6 BR-DIS: Disputes

- **BR-DIS-1** An employer may raise a dispute on a long contract period
  up to the payment date, and on a short job within \[48\] hours of
  completion.

- **BR-DIS-2** A provider may raise a dispute at any time for
  non-payment, unsafe conditions or breach of contract.

- **BR-DIS-3** An open dispute holds the release of the affected
  period's wage until Operations decides. No other period is affected.

- **BR-DIS-4** If the employer does not respond to Operations within
  \[3\] days, the period may be released to the worker.

## 3.7 BR-PRIV: Contact Protection

- **BR-PRIV-1** Until a contract is Active (long) or Funded (short),
  neither party sees the other's phone number, full surname or exact
  address, and contact details typed into messages are masked.

- **BR-PRIV-2** A short explanation is shown when masking happens:
  contact details are shared once the contract is active, which keeps
  both parties protected and keeps the replacement guarantee and payment
  protection in place.

# 4. Functional Requirements

Requirements are grouped by module. Priority uses MoSCoW. Release shows
the first release in which the requirement must work. Configurable
values are shown in square brackets.

## 4.1 Accounts and Authentication (AUTH)

| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **Priority** | **Release** |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-AUTH-01 | Registration. A visitor registers as Employer or Service Provider with full name, phone number (+237 format, primary identifier), optional email, password (minimum 8 characters with at least one letter and one digit), preferred language (EN or FR) and city. The phone is verified by a 6-digit SMS OTP valid \[10\] minutes, maximum \[5\] attempts. Acceptance of the Terms and Privacy Policy is recorded with document version and time. Employer accounts become Active; provider accounts become Profile Incomplete. | Must         | R1          |
| FR-AUTH-02 | Login with phone number or email and password. Access token valid \[15\] minutes; rotating refresh token valid \[30\] days, revoked on logout. After \[5\] failed attempts in 15 minutes the account is locked for \[15\] minutes.                                                                                                                                                                                                                                                                                              | Must         | R1          |
| FR-AUTH-03 | Password reset by SMS OTP, or by email link valid \[30\] minutes if an email is verified. All sessions are revoked after a reset.                                                                                                                                                                                                                                                                                                                                                                                               | Must         | R1          |
| FR-AUTH-04 | Profile management. Changing phone or email requires verification of the new value. Changing the payout mobile money number requires an OTP to the account phone and holds payouts for \[24\] hours, with an SMS alert to the old number.                                                                                                                                                                                                                                                                                       | Must         | R1          |
| FR-AUTH-05 | Assisted registration. An Operations Officer at the Douala or Bamenda office can create or complete a provider account on the provider's behalf. The provider confirms with an OTP on their own phone. The staff member and office are recorded on the account.                                                                                                                                                                                                                                                                 | Must         | R1          |
| FR-AUTH-06 | Language. Users switch between English and French at any time; the choice is saved to the account and used for all notifications.                                                                                                                                                                                                                                                                                                                                                                                               | Must         | R1          |
| FR-AUTH-07 | Data rights. A user can download a copy of their data and request account deletion from settings. Deletion is refused while a contract is active, money is in escrow or a dispute is open, and otherwise follows the retention policy (section 8.3).                                                                                                                                                                                                                                                                            | Must         | R1          |
| FR-AUTH-08 | Staff accounts must use two-factor authentication. Optional two-factor for other users.                                                                                                                                                                                                                                                                                                                                                                                                                                         | Must         | R1          |
| FR-AUTH-09 | Dual-role accounts. An employer may activate a provider profile on the same account and switch roles; a user can never make an offer to themselves.                                                                                                                                                                                                                                                                                                                                                                             | Could        | R2          |

## 4.2 Profiles (PROF)

| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **Priority** | **Release** |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-PROF-01 | Provider profile: photo, short bio (EN and/or FR), primary service category and up to \[2\] more, skills tags, years of experience, languages (English, French, Pidgin, other), work types (live-in, live-out, part-time, one-time), city and neighbourhood, willingness to work in other cities, expected monthly wage range and/or per-job rate, availability start date and usual days and hours, payout number (MTN MoMo or Orange Money) with the name registered on it. | Must         | R1          |
| FR-PROF-02 | Profile completeness indicator. All required fields must be complete before the provider can submit for vetting.                                                                                                                                                                                                                                                                                                                                                              | Should       | R1          |
| FR-PROF-03 | Availability status: Available, Engaged or Unavailable. The status changes to Engaged automatically when a full-time long contract becomes active. Engaged providers are hidden from search unless they opt in to part-time or one-time work.                                                                                                                                                                                                                                 | Should       | R1          |
| FR-PROF-04 | Employer profile: name, city, neighbourhood, optional household notes (for example number and ages of children, needs of an elderly person), payment number.                                                                                                                                                                                                                                                                                                                  | Must         | R1          |
| FR-PROF-05 | Provider job alert preferences: categories, cities and channel (SMS or in-app).                                                                                                                                                                                                                                                                                                                                                                                               | Should       | R1          |

## 4.3 Vetting and Verification (KYC)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                              | **Priority** | **Release** |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-KYC-01 | Document submission: national ID card or passport (front and back), criminal record extract issued within the last \[3\] months, medical fitness certificate issued within the last \[3\] months, optional qualifications and certificates, and two referees (name, phone, relationship, years known; referees should not be family members). Files JPG, PNG or PDF up to \[10\] MB each, malware scanned, stored privately. | Must         | R1          |
| FR-KYC-02 | Interview booking. The provider books an in-person interview slot at the Douala or Bamenda office from slots published by staff. SMS reminder \[24\] hours before. Staff can reschedule or mark no-show.                                                                                                                                                                                                                     | Must         | R1          |
| FR-KYC-03 | Vetting checklist. The officer records Pass, Fail or Not applicable with notes for: identity confirmed in person against the document, criminal record clear, referee 1 confirmed, referee 2 confirmed, medical fitness, skills confirmed for each category (category-specific questions or practical check), qualifications verified. Each entry stores officer, office and date.                                           | Must         | R1          |
| FR-KYC-04 | Decision. Approve only when every mandatory check has passed; Reject with a reason category and note; or Request more information. The provider is told by SMS and in-app. An approved profile becomes searchable with a Verified badge and a public list of checks passed (without sensitive details). Target: decision within \[5\] working days after the interview.                                                      | Must         | R1          |
| FR-KYC-05 | Renewal. Criminal record extract and medical certificate expire after \[12\] months. Reminders at 30 and 7 days before expiry. When expired, the profile is hidden from search until renewed; active contracts continue and Operations is alerted.                                                                                                                                                                           | Should       | R1          |
| FR-KYC-06 | Suspension. Staff can suspend a provider after a serious complaint. The profile is hidden and active contracts are flagged for Operations review.                                                                                                                                                                                                                                                                            | Must         | R1          |
| FR-KYC-07 | Access control. Vetting documents can be viewed only by Operations and Vetting Officers and Super Admins. Every view is logged.                                                                                                                                                                                                                                                                                              | Must         | R1          |

## 4.4 Search and Discovery (SRCH)

| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                                                                                                          | **Priority** | **Release** |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-SRCH-01 | Search and filters: category, city, neighbourhood, work type, language, minimum experience, minimum rating, wage range, available from date, certified only (R3). Sort by relevance (default), rating, wage or experience. Relevance considers verification, rating, recent activity and same neighbourhood or city. 20 results per page. Only approved, non-suspended providers appear. | Must         | R1          |
| FR-SRCH-02 | Visitors can browse anonymised provider cards (first name and initial, category, city, rating, wage range). Full profiles, messaging and offers require login.                                                                                                                                                                                                                           | Must         | R1          |
| FR-SRCH-03 | Provider profile page: photo, first name and last initial, categories, bio, skills, experience, languages, work types, wage expectation, availability, checks passed, certificates (R3), average rating with count, reviews (reviewer first name only), and buttons to Message, Shortlist and Make an offer.                                                                             | Must         | R1          |
| FR-SRCH-04 | Shortlist. Employers can save providers and compare them.                                                                                                                                                                                                                                                                                                                                | Should       | R1          |
| FR-SRCH-05 | Job requests. An employer posts a need (category, city, start date, work type, wage offered, description). Matching approved providers receive an alert and can express interest. The employer sees interested providers and can message them or make an offer. Requests expire after \[14\] days.                                                                                       | Should       | R1          |

## 4.5 Messaging (MSG)

| **ID**    | **Requirement**                                                                                                                                                                                                     | **Priority** | **Release** |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-MSG-01 | One conversation per employer and provider pair, available before, during and after a contract so that employers can interview and agree terms. Text up to 1,000 characters; image attachments up to \[5\] MB.      | Must         | R1          |
| FR-MSG-02 | Contact masking according to BR-PRIV: phone numbers, email addresses and external links are masked before the contract is active, with an explanation shown to the sender.                                          | Must         | R1          |
| FR-MSG-03 | Delivery. New messages appear within \[10\] seconds without page reload in R1; real-time delivery and push in R2. Unread counters. An SMS nudge is sent if a message stays unread \[12\] hours, at most once a day. | Must         | R1          |
| FR-MSG-04 | Report and block. Either party can report a message or user, and block further messages. Reports go to the support queue.                                                                                           | Must         | R1          |
| FR-MSG-05 | Privacy. Staff can read a conversation only when it is linked to an open report or dispute. Each access is logged.                                                                                                  | Must         | R1          |

## 4.6 Offers and Booking (OFF)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **Priority** | **Release** |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-OFF-01 | Create offer. The employer chooses the provider, category, start date, end date or duration, work type, duties, working days and hours, days off, wage (monthly wage for long contracts; total amount for short jobs), payment schedule (long: Monthly or Half and Half; short: at booking) and payment day. The system classifies the offer as Short job or Long contract (BR-FEE) and shows: wage to the worker, commission rate, loyalty level and amount, total per period, and the full schedule of funding windows and payment dates. | Must         | R1          |
| FR-OFF-02 | The employer sees a warning if the wage is below the configured legal minimum wage \[value set by Super Admin\] (open decision OD-07).                                                                                                                                                                                                                                                                                                                                                                                                      | Should       | R1          |
| FR-OFF-03 | Provider response within \[48\] hours: Accept, Decline with reason, or Counter-offer (wage, schedule, start date, hours). The employer accepts or declines a counter-offer. Maximum \[3\] rounds. Unanswered offers expire automatically and both parties are notified.                                                                                                                                                                                                                                                                     | Must         | R1          |
| FR-OFF-04 | The employer can withdraw an offer before it is accepted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Must         | R1          |
| FR-OFF-05 | A provider cannot hold two accepted full-time live-in contracts with overlapping dates.                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Should       | R1          |

## 4.7 Contracts (CON)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Priority** | **Release** |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-CON-01 | Generation. On acceptance the system generates the contract from the active template version for the category and contract type, in the language of each party (EN and FR versions). It includes: parties; a clear statement that ProAid is a marketplace and not the employer; duties; hours; days off; wage; payment schedule and dates; commission paid by the employer; notice period; replacement guarantee; dispute process; termination; data protection. The template version is stored with the contract. | Must         | R1          |
| FR-CON-02 | Adaptation. Before signing, either party may propose changes to editable clauses (duties, hours, days off, special conditions). Clauses on the platform role, payments, commission and disputes are locked.                                                                                                                                                                                                                                                                                                        | Should       | R1          |
| FR-CON-03 | Signing. Each party signs by ticking consent, typing their full name and entering an SMS OTP. Time, IP address and device are recorded. When both have signed, a PDF with a signature certificate page is generated, its hash stored, and the contract becomes Signed.                                                                                                                                                                                                                                             | Must         | R1          |
| FR-CON-04 | Activation. A long contract becomes Active when its first period is funded. A short job becomes Funded when the full amount is paid. Contact details are then revealed to both parties (BR-PRIV).                                                                                                                                                                                                                                                                                                                  | Must         | R1          |
| FR-CON-05 | Amendment. Changes to wage, schedule or hours are made by an amendment signed by both parties, effective from the next unfunded period. Commission is recalculated only for unscheduled periods.                                                                                                                                                                                                                                                                                                                   | Must         | R1          |
| FR-CON-06 | Termination. Either party can give notice as set in the contract (BR-CAN). The final period is prorated. When a worker leaves, the employer is offered a free replacement immediately.                                                                                                                                                                                                                                                                                                                             | Must         | R1          |
| FR-CON-07 | Risk flags instead of mandatory validation. A contract is flagged for Operations review when the wage is below minimum wage, weekly hours exceed \[60\], the provider has open complaints, or the employer has unpaid overdue periods. Operations can pause a flagged contract before activation.                                                                                                                                                                                                                  | Should       | R1          |
| FR-CON-08 | Both parties can view and download the signed contract and all amendments at any time.                                                                                                                                                                                                                                                                                                                                                                                                                             | Must         | R1          |

## 4.8 Fees and Loyalty (FEE)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                               | **Priority** | **Release** |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-FEE-01 | Fee engine. One module implements BR-FEE and BR-LOY. It takes the contract type, wage, schedule and employer loyalty history and returns, per contract month, the loyalty month number, level, rate, commission and total. All screens, documents and payments use it. Rates and thresholds are read from configuration with effective dates. | Must         | R1          |
| FR-FEE-02 | Loyalty display. The employer dashboard and every offer show the current loyalty level, months counted, and months remaining to the next level.                                                                                                                                                                                               | Must         | R1          |
| FR-FEE-03 | Transparency. Employer screens always show wage, commission (rate and amount) and total. Provider screens show only the full wage and never suggest that commission is deducted from it.                                                                                                                                                      | Must         | R1          |
| FR-FEE-04 | Fee calculator on the public website, matching the fee engine exactly.                                                                                                                                                                                                                                                                        | Should       | R1          |

## 4.9 Payments and Escrow (PAY)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **Priority** | **Release** |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-PAY-01 | Schedule. When a long contract is signed the system creates its payment periods (BR-PAY-2, BR-PAY-3). Each period stores: start and end dates, funding window end, payment date, wage, commission per contract month, total, and status. Periods are created for the whole contract, or on a rolling \[3\] month basis for open-ended contracts.                                                                                                                         | Must         | R1          |
| FR-PAY-02 | Funding. The employer pays a period total (or a short job total) with MTN MoMo or Orange Money. The aggregator sends a payment prompt to the employer's phone; the payment stays Pending until the aggregator confirms by webhook. Each request carries a unique idempotency key so a payment is never recorded twice. A receipt is sent by SMS and in-app and is downloadable as PDF. Partial payments are not accepted in R1. Employers can fund future periods early. | Must         | R1          |
| FR-PAY-03 | Reminders by SMS and in-app on day 1, day \[5\], day \[8\] and day \[10\] of each funding window, stopping as soon as the period is funded.                                                                                                                                                                                                                                                                                                                              | Must         | R1          |
| FR-PAY-04 | Overdue. A period not funded by the end of the funding window becomes Overdue. The provider is informed, Operations is alerted, and the employer cannot make new offers. After \[5\] further days the contract becomes Suspended pending Operations contact, and the provider may end the contract without notice. Final values are subject to open decision OD-03.                                                                                                      | Must         | R1          |
| FR-PAY-05 | Recognition. On funding, the commission is posted to ProAid's income account and the wage to the escrow account of that contract in the ledger (FR-PAY-10).                                                                                                                                                                                                                                                                                                              | Must         | R1          |
| FR-PAY-06 | Release. \[48\] hours before the payment date the employer is asked to confirm or raise an issue. On the payment date at \[08:00\] Douala time, if no dispute is open on the period, the wage is paid out to the provider's mobile money number through the aggregator, and both parties are notified by SMS.                                                                                                                                                            | Must         | R1          |
| FR-PAY-07 | Short jobs. Payment of wage plus \[14%\] is taken on signing. When the job date passes, the provider marks it complete and the employer confirms; if the employer does nothing it is confirmed automatically after \[24\] hours. The payout is made within \[48\] hours of completion unless an issue is reported.                                                                                                                                                       | Must         | R1          |
| FR-PAY-08 | Payout failure. Failed payouts are retried up to \[3\] times over \[24\] hours, then placed in the Finance queue, and the provider is asked to confirm their number.                                                                                                                                                                                                                                                                                                     | Must         | R1          |
| FR-PAY-09 | Refunds are paid through the aggregator to the number that paid. Refunds above \[100,000\] XAF need Finance Officer approval. Each refund references the contract, period and reason.                                                                                                                                                                                                                                                                                    | Must         | R1          |
| FR-PAY-10 | Ledger. Every money movement is a balanced double-entry transaction in whole XAF with accounts for employer funds, escrow per contract, provider payable, ProAid income, refunds and aggregator fees. Entries are never edited or deleted; corrections are reversing entries. Balances are always derived from entries.                                                                                                                                                  | Must         | R1          |
| FR-PAY-11 | Reconciliation. A daily job compares the ledger with the aggregator's transaction report. Any difference is listed for the Finance Officer with the transactions concerned.                                                                                                                                                                                                                                                                                              | Must         | R1          |
| FR-PAY-12 | Wallet views. Employers see amounts funded, held, released, refunded and upcoming. Providers see upcoming payments with dates, payment history and downloadable statements.                                                                                                                                                                                                                                                                                              | Must         | R1          |
| FR-PAY-13 | Provider abstraction. The aggregator is used through an internal interface so that it can be replaced, with a sandbox implementation for development and automated tests.                                                                                                                                                                                                                                                                                                | Must         | R1          |
| FR-PAY-14 | Payment status page. If the aggregator or a mobile money network is unavailable, users see a clear message, and payments in progress are checked again automatically.                                                                                                                                                                                                                                                                                                    | Should       | R1          |

## 4.10 Replacements (REP)

| **ID**    | **Requirement**                                                                                                                                                                                                                                   | **Priority** | **Release** |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-REP-01 | Request. An employer whose long contract ended early because the worker left, or after a dispute decided in their favour, can request a free replacement, giving the reason and desired start date.                                               | Must         | R1          |
| FR-REP-02 | Matching support. The request enters the Operations queue. Operations proposes up to \[5\] suitable approved providers within \[3\] working days. The employer may also search on their own.                                                      | Must         | R1          |
| FR-REP-03 | New contract. The replacement contract is linked to the original, continues the loyalty count (BR-LOY-5), and carries no extra charge. Unused escrow from the original contract is moved to the replacement or refunded, as the employer chooses. | Must         | R1          |
| FR-REP-04 | Reporting of replacement rates by provider, category and city.                                                                                                                                                                                    | Should       | R1          |

## 4.11 Disputes (DIS)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                  | **Priority** | **Release** |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-DIS-01 | Raise. Either party opens a dispute within the limits of BR-DIS, choosing a category (quality of service, absence, misconduct, non-payment, unsafe conditions, contract breach, other), a description and optional evidence files.                                                                                                                               | Must         | R1          |
| FR-DIS-02 | Hold. An open dispute on a period stops its payout (BR-DIS-3).                                                                                                                                                                                                                                                                                                   | Must         | R1          |
| FR-DIS-03 | Process. Operations acknowledges within \[1\] working day; each party may respond within \[3\] days; Operations mediates by phone or at an office and decides: full release, partial release with partial refund, or full refund, plus any action (warning, suspension, replacement, termination). Target resolution \[7\] working days. Every step is recorded. | Must         | R1          |
| FR-DIS-04 | If the employer does not respond within the response time, Operations may release the period to the worker (BR-DIS-4).                                                                                                                                                                                                                                           | Should       | R1          |
| FR-DIS-05 | Either party may appeal once; the appeal is decided by a Super Admin who was not involved.                                                                                                                                                                                                                                                                       | Could        | R1          |

## 4.12 Reviews (REV)

| **ID**    | **Requirement**                                                                                                                                                                                         | **Priority** | **Release** |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-REV-01 | The employer rates the provider from 1 to 5 stars with an optional comment up to 500 characters: after a short job, every \[3\] months during a long contract, and when it ends. One review per prompt. | Must         | R1          |
| FR-REV-02 | The provider can rate the employer privately; these ratings are visible to staff only and help identify unsafe employers.                                                                               | Should       | R1          |
| FR-REV-03 | Moderation. Reviews can be reported; staff can hide a review with a recorded reason.                                                                                                                    | Must         | R1          |
| FR-REV-04 | The provider rating is the average of published reviews with the count shown. Providers with fewer than \[3\] reviews show a New label.                                                                 | Must         | R1          |

## 4.13 Notifications (NOT)

| **ID**    | **Requirement**                                                                                                                              | **Priority** | **Release** |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-NOT-01 | Channels: in-app notification centre and SMS (R1); email when the user has a verified email (R1); push notifications in the mobile app (R2). | Must         | R1          |
| FR-NOT-02 | SMS is always used for OTPs, payment confirmations, funding reminders, overdue alerts, payouts and dispute updates.                          | Must         | R1          |
| FR-NOT-03 | All notification templates exist in English and French and are managed by a Content Manager.                                                 | Should       | R1          |
| FR-NOT-04 | Users can switch off non-essential notifications; money and security notifications cannot be switched off.                                   | Should       | R1          |
| FR-NOT-05 | A daily cap of \[5\] non-essential SMS per user controls SMS cost.                                                                           | Should       | R1          |

## 4.14 Referral Programme (REF)

| **ID**    | **Requirement**                                                                                                                                                                                                                              | **Priority** | **Release** |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-REF-01 | Each employer has a referral code and link. When a referred new employer funds their first payment period, the referrer receives a commission credit of \[5,000\] XAF applied to their next funding. Providers cannot earn referral credits. | Should       | R1          |
| FR-REF-02 | Fraud controls: no credit when the two accounts share a phone, device or payment number. A total programme budget cap of \[50,000\] XAF can be set.                                                                                          | Should       | R1          |

## 4.15 Public Website (WEB)

| **ID**    | **Requirement**                                                                                                                                                                                                                                           | **Priority** | **Release** |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-WEB-01 | Pages: home, how it works (employers and providers), fee plan with calculator, how vetting works, replacement guarantee, FAQ, about, contact (Douala and Bamenda offices, phone, WhatsApp link), Terms of Use, Privacy Policy. All in English and French. | Must         | R1          |
| FR-WEB-02 | Language-specific URLs (/en and /fr), search engine metadata, and shareable provider links that contain no personal contact data.                                                                                                                         | Should       | R1          |
| FR-WEB-03 | Installable PWA with an install prompt on Android.                                                                                                                                                                                                        | Should       | R1          |

## 4.16 Staff Back Office (ADM)

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Priority** | **Release** |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-ADM-01 | Roles and permissions: Super Admin, Operations and Vetting Officer (limited to their office: Douala or Bamenda), Support Agent, Finance Officer, Content Manager. Each staff member gets the minimum permissions needed.                                                                                                                                                                                                                                                | Must         | R1          |
| FR-ADM-02 | User management: search, view, suspend, reactivate, add internal notes.                                                                                                                                                                                                                                                                                                                                                                                                 | Must         | R1          |
| FR-ADM-03 | Vetting queue with interview calendar per office, timers against the \[5\] working day target, and the checklist of FR-KYC-03.                                                                                                                                                                                                                                                                                                                                          | Must         | R1          |
| FR-ADM-04 | Contracts and payments monitor: flagged contracts, overdue periods, payouts due today, failed payouts, refunds awaiting approval, reconciliation differences.                                                                                                                                                                                                                                                                                                           | Must         | R1          |
| FR-ADM-05 | Dispute, replacement and report queues with assignment to a staff member and status.                                                                                                                                                                                                                                                                                                                                                                                    | Must         | R1          |
| FR-ADM-06 | Configuration: categories and their vetting checks, fee rates and loyalty thresholds, funding window length, reminder days, notice period, minimum wage, SMS caps, referral values, contract templates (versioned). Fee and loyalty changes need approval by a second Super Admin or Finance Officer and an effective date in the future.                                                                                                                               | Must         | R1          |
| FR-ADM-07 | Analytics with date and city filters: new contracts per month (plan: 5 in Month 3 rising to 13 a month); short and long mix; average wage; commission collected per month; income by stream; monthly spending entered by Finance; whether monthly income covers monthly spending; cumulative income against the 4,800,000 XAF budget; provider funnel (registered, interviewed, approved, placed); replacement rate; dispute rate; average vetting time. Export to CSV. | Must         | R1          |
| FR-ADM-08 | Audit log of every staff action and every change to money, contracts, vetting and configuration: who, what, when, before and after values. The log cannot be edited.                                                                                                                                                                                                                                                                                                    | Must         | R1          |
| FR-ADM-09 | Content management for website text, FAQ and legal pages in both languages.                                                                                                                                                                                                                                                                                                                                                                                             | Should       | R1          |

## 4.17 Mobile App (MOB)

| **ID**    | **Requirement**                                                                                                                                                                                                            | **Priority** | **Release** |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-MOB-01 | Android app (iOS to follow) covering the core employer and provider journeys: registration, profile, search, messaging, offers, contracts, payments, wallet, reviews and notifications, using the same API as the website. | Must         | R2          |
| FR-MOB-02 | Push notifications for messages, offers, payments and reminders.                                                                                                                                                           | Must         | R2          |
| FR-MOB-03 | Real-time messaging in both app and website.                                                                                                                                                                               | Must         | R2          |
| FR-MOB-04 | Low-data mode: compressed images and cached lists.                                                                                                                                                                         | Should       | R2          |
| FR-MOB-05 | Minimum supported version check with a prompt to update.                                                                                                                                                                   | Should       | R2          |

## 4.18 Training and Certification (TRN)

| **ID**    | **Requirement**                                                                                                                                                                     | **Priority** | **Release** |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-TRN-01 | Course catalogue: childcare basics, first aid, elderly care and cooking, in English and French, made of short modules (text, images, short videos) that work on slow connections.   | Must         | R3          |
| FR-TRN-02 | Enrolment is paid by the provider at \[10,000\] XAF per course (configurable per course) with MoMo or Orange Money. Payments are recorded in the ledger as training income.         | Must         | R3          |
| FR-TRN-03 | Progress tracking and an end quiz with a pass mark of \[70%\] and up to \[3\] attempts.                                                                                             | Must         | R3          |
| FR-TRN-04 | On passing, a certificate PDF with a unique verification code is issued; a public page confirms any code. A badge appears on the profile and a Certified filter is added to search. | Must         | R3          |
| FR-TRN-05 | Optional in-person practical assessment at an office recorded by staff (for example first aid).                                                                                     | Could        | R3          |
| FR-TRN-06 | Training is voluntary and never required to be listed or hired.                                                                                                                     | Must         | R3          |

## 4.19 Corporate Packages (CORP)

| **ID**     | **Requirement**                                                                                                                                                       | **Priority** | **Release** |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-CORP-01 | Corporate accounts for companies, NGOs and embassies, with company administrators and staff beneficiaries.                                                            | Must         | R4          |
| FR-CORP-02 | Subscription of \[50,000\] XAF per month per company, billed monthly with a PDF invoice and recorded in the ledger.                                                   | Must         | R4          |
| FR-CORP-03 | Beneficiaries create contracts under the company account; the company receives a consolidated monthly statement. Package benefits are subject to open decision OD-08. | Should       | R4          |

## 4.20 Partner Advertising (AD)

| **ID**   | **Requirement**                                                                                                                             | **Priority** | **Release** |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-AD-01 | Content Managers create campaigns for partners (banner or text, EN and FR, placement, dates, target city and user type).                    | Must         | R4          |
| FR-AD-02 | Ads are labelled Sponsored (Sponsorisé), never appear on payment, contract or dispute screens, and are targeted only by city and user type. | Must         | R4          |
| FR-AD-03 | Impressions and clicks report per campaign for partners.                                                                                    | Should       | R4          |

## 4.21 Home Services (HOME)

| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                                                 | **Priority** | **Release** |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-------------|
| FR-HOME-01 | The category model supports home service categories (janitorial and deep cleaning, housekeeping, plumbing, electrical work, other repairs and maintenance), each with its own vetting checks. All are charged as short jobs (BR-FEE-6). The data model must allow this from R1 so that no migration of existing data is needed. | Must         | R4          |
| FR-HOME-02 | Quote flow: the employer describes the job; providers send quotes; accepting a quote creates a short job contract.                                                                                                                                                                                                              | Should       | R4          |
| FR-HOME-03 | Categories can be launched one at a time, starting with cleaning.                                                                                                                                                                                                                                                               | Should       | R4          |

# 5. External Interface Requirements

## 5.1 User Interfaces

| **Screen**                | **Users**         | **Key Elements**                                                                                                                     |
|---------------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Home and public pages     | All               | Hero, five service categories, how it works, vetting, replacement guarantee, fee plan with calculator, FAQ, offices, language switch |
| Registration and login    | All               | Step-by-step form, OTP entry, role choice, consent                                                                                   |
| Employer dashboard        | Employer          | Active contracts, next funding due, loyalty level and progress, messages, shortlist, job requests                                    |
| Provider dashboard        | Provider          | Profile and vetting status, interview booking, offers, active jobs, upcoming payments, job alerts                                    |
| Search results            | Employer, Visitor | Filters (sheet on mobile), provider cards, sort, pagination                                                                          |
| Provider profile          | Employer          | Profile details, checks passed, reviews, Message, Shortlist, Make an offer                                                           |
| Offer form and summary    | Employer          | Contract details, schedule choice, live breakdown of wage, commission and total, funding calendar                                    |
| Contract view and signing | Both              | Readable contract in user's language, proposed edits, consent, typed name, OTP, PDF download                                         |
| Payment screen            | Employer          | Operator choice (MTN or Orange), number, amount, waiting for phone approval, receipt                                                 |
| Wallet                    | Both              | Held, released, upcoming, refunds, statements                                                                                        |
| Messages                  | Both              | Conversation list, masked contacts notice, attachments, report and block                                                             |
| Disputes and replacements | Both              | Forms, evidence upload, status timeline                                                                                              |
| Back office               | Staff             | Queues, interview calendar, vetting checklist, payments monitor, configuration, analytics, audit log                                 |
| Training (R3)             | Provider          | Catalogue, modules, progress, quiz, certificate                                                                                      |

All screens must be usable on a 360 pixel wide phone, keep touch targets
at least 44 by 44 pixels, and use plain language suited to users with
low digital literacy.

## 5.2 Hardware Interfaces

- Camera and files through the browser File API (and device camera in
  the mobile app) for documents and photos.

- No GPS requirement in R1; location is chosen as city and
  neighbourhood.

## 5.3 Software Interfaces

| **Interface**      | **Method**                       | **Notes**                                                                                                                              |
|--------------------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Payment aggregator | REST over HTTPS, signed webhooks | Collections, disbursements, refunds, transaction reports, sandbox. Webhook signatures verified; every callback processed idempotently  |
| SMS gateway        | REST over HTTPS                  | Delivery reports stored; supports MTN and Orange numbers in Cameroon                                                                   |
| Email service      | REST over HTTPS                  | Bilingual templates                                                                                                                    |
| Object storage     | SDK over HTTPS                   | Private buckets; signed URLs valid at most \[15\] minutes for documents                                                                |
| Push service (R2)  | SDK                              | Mobile notifications                                                                                                                   |
| ProAid API         | REST, JSON, /api/v1              | OpenAPI 3 specification generated from code; used by web and mobile; version kept stable for at least \[6\] months after a new version |

## 5.4 Communication Interfaces

- HTTPS with TLS 1.2 or later on every endpoint; HTTP redirected to
  HTTPS.

- JSON in UTF-8; dates in ISO 8601; amounts as integer XAF; time zone
  Africa/Douala for all business dates.

# 6. Non-Functional Requirements

## 6.1 Performance

| **Measure**                    | **Target**                                 | **Condition**                                         |
|--------------------------------|--------------------------------------------|-------------------------------------------------------|
| API response (95th percentile) | Under 500 ms                               | Up to 500 concurrent users                            |
| Search results                 | Under 1 second                             | Up to 100 matching providers                          |
| First page load                | Under 3 s broadband; under 5 s on 3G       | Largest contentful paint                              |
| Page weight                    | Under 500 KB for the home and search pages | Compressed, first load                                |
| Payment initiation             | Prompt sent to phone within 10 s           | Aggregator available                                  |
| Scheduled jobs                 | Every 15 minutes                           | Releases on the payment date before 10:00 Douala time |

## 6.2 Availability and Reliability

- Uptime of at least 99.5% per month, excluding announced maintenance.

- Daily database backups kept 30 days with point-in-time recovery; a
  restore is tested before Release 1 and every quarter.

- Payment, release and payout jobs must be idempotent and safe to run
  again after a failure.

- If the aggregator is unavailable, nothing is recorded as paid or
  released until it confirms.

## 6.3 Security

- Passwords hashed with bcrypt (cost 12 or more) or Argon2; never
  logged.

- Role-based access control checked on the server for every request;
  users can only see their own data.

- Rate limits on login, OTP and payment endpoints; OTPs single-use.

- Server-side validation of all input with schemas.

- Webhook signature verification and replay protection.

- Documents encrypted at rest; access only by signed URLs; every access
  to vetting documents logged.

- Secrets only in environment variables or a secrets manager.

- OWASP Top 10 protections; an independent security review of
  authentication and payments before public launch.

## 6.4 Privacy and Data Protection

- Comply with Law No. 2024/017: obtain any prior authorisation or make
  any declaration required by the data protection authority before
  processing begins, appoint a person responsible for data protection,
  and keep a record of processing activities.

- Explicit, recorded consent at registration, with separate consent for
  processing of criminal record and medical documents.

- Collect only the data needed; criminal record and medical documents
  are kept only as long as the retention policy allows.

- Users can access, correct, export and request deletion of their data.

- Data stored or processed outside Cameroon only after legal
  confirmation that the transfer rules are met (open decision OD-06).

- Personal data breaches handled under a written incident procedure,
  including notification where the law requires it.

## 6.5 Usability and Localisation

- Every screen and notification in English and French; numbers and dates
  formatted for the chosen language.

- An employer can register and send a first offer in under 10 minutes; a
  provider can complete a profile with office help in under 20 minutes.

- Error messages in plain language with a clear next step; no technical
  codes shown to users.

- Accessible colour contrast (WCAG 2.1 AA) and readable font sizes.

## 6.6 Maintainability and Quality

- Fee engine, loyalty counting, payment scheduling and state machines:
  100% branch coverage by unit tests, including all worked examples in
  Appendix B.

- At least 80% coverage of other core business logic.

- Continuous integration runs type checks, linting and tests on every
  pull request; the main branch must always build.

- Separate development, staging (aggregator sandbox) and production
  environments.

- Database changes only through versioned migrations.

## 6.7 Observability

- Error tracking on web, API and jobs, with alerts to the founders for
  any payment, release or payout error.

- Structured logs without personal or payment secrets.

- Health check endpoint and external uptime monitoring.

## 6.8 Scalability

- City, office and category are data, not code: adding Yaoundé, Buea or
  a new service category needs configuration only.

- The design must handle at least 50,000 users and 2,000 active
  contracts without architectural change.

# 7. State Models

## 7.1 Provider Verification

| **From**            | **Event**                               | **To**                                    |
|---------------------|-----------------------------------------|-------------------------------------------|
| Profile Incomplete  | Required fields completed and submitted | Submitted                                 |
| Submitted           | Interview booked                        | Interview Scheduled                       |
| Interview Scheduled | Interview held                          | Under Review                              |
| Under Review        | All mandatory checks passed             | Approved                                  |
| Under Review        | More information requested              | Submitted                                 |
| Under Review        | Rejected                                | Rejected (may resubmit after \[30\] days) |
| Approved            | Document expired                        | Renewal Required (hidden from search)     |
| Renewal Required    | Valid documents accepted                | Approved                                  |
| Approved            | Serious complaint                       | Suspended                                 |
| Suspended           | Staff decision                          | Approved or Banned                        |

## 7.2 Offer and Contract

| **From**                | **Event**                                 | **To**                             |
|-------------------------|-------------------------------------------|------------------------------------|
| Offer Sent              | Provider counter-offers                   | Countered (employer responds)      |
| Offer Sent or Countered | Accepted                                  | Pending Signatures                 |
| Offer Sent or Countered | Declined, withdrawn or \[48\] hours pass  | Closed                             |
| Pending Signatures      | Both parties sign                         | Signed                             |
| Signed (long)           | First period funded                       | Active                             |
| Signed (short)          | Full amount funded                        | Funded                             |
| Funded (short)          | Completion confirmed or auto-confirmed    | Completed (payout within 48 hours) |
| Active                  | Period overdue beyond grace days          | Suspended                          |
| Suspended               | Overdue period funded                     | Active                             |
| Active                  | Notice given                              | Ending                             |
| Ending or Active        | End date reached and last period released | Completed                          |
| Any before Active       | Cancelled                                 | Cancelled (BR-CAN-1)               |
| Active or Ending        | Worker leaves or termination decided      | Terminated (replacement offered)   |

## 7.3 Payment Period

| **From**                      | **Event**                       | **To**                                 |
|-------------------------------|---------------------------------|----------------------------------------|
| Scheduled                     | Funding window opens            | Awaiting Funding                       |
| Awaiting Funding              | Payment confirmed by aggregator | Funded                                 |
| Awaiting Funding              | Day \[10\] ends unpaid          | Overdue                                |
| Overdue                       | Payment confirmed               | Funded                                 |
| Funded                        | Dispute opened                  | On Hold                                |
| On Hold                       | Dispute decided                 | Releasing, Partly Refunded or Refunded |
| Funded                        | Payment date reached            | Releasing                              |
| Releasing                     | Payout confirmed                | Released                               |
| Releasing                     | Payout failed after retries     | Payout Failed (Finance queue)          |
| Scheduled or Awaiting Funding | Contract ends early             | Cancelled                              |

## 7.4 Dispute

| **From**  | **Event**                                | **To**    |
|-----------|------------------------------------------|-----------|
| Open      | Operations acknowledges                  | In Review |
| In Review | Responses gathered or time passes        | Mediation |
| Mediation | Decision recorded and money actions done | Resolved  |
| Resolved  | Appeal lodged                            | Appeal    |
| Appeal    | Super Admin decision                     | Closed    |

# 8. Data Requirements

## 8.1 Main Entities

| **Entity**                                              | **Key Contents**                                                                                                                   |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| User                                                    | Phone, email, password hash, role, language, status, consents, office (if assisted)                                                |
| EmployerProfile                                         | City, neighbourhood, household notes, loyalty summary (derived), referral code                                                     |
| ProviderProfile                                         | Categories, skills, experience, languages, work types, wage expectations, availability, payout number, verification status, rating |
| ServiceCategory                                         | Name EN and FR, group (care or home service), pricing class (long allowed or short only), required vetting checks                  |
| Office                                                  | City, address, staff, interview slots                                                                                              |
| VettingCase, VettingCheck, Document, Referee, Interview | Submissions, checklist results, files with expiry dates, referee outcomes, interview records                                       |
| JobRequest, Interest                                    | Employer needs and provider interest                                                                                               |
| Conversation, Message, Report                           | Messages with masking flags; reports                                                                                               |
| Offer, CounterOffer                                     | Proposed terms and response history                                                                                                |
| Contract, ContractVersion, Amendment, Signature         | Terms, template version, PDF hash, signatures with OTP evidence, replacement_of link                                               |
| PaymentPeriod, PeriodMonth                              | Dates, wage, per-month loyalty month number, rate and commission (frozen), status                                                  |
| PaymentIntent, Payout, Refund                           | Aggregator references, idempotency keys, statuses, retries                                                                         |
| LedgerAccount, LedgerTransaction, LedgerEntry           | Double-entry records in integer XAF                                                                                                |
| LoyaltyMonth                                            | Employer, calendar month, contract, counted flag                                                                                   |
| ReplacementRequest, Dispute, DisputeEvent               | Requests, decisions and timeline                                                                                                   |
| Review, EmployerRating                                  | Public reviews and private ratings                                                                                                 |
| Notification, NotificationTemplate                      | Channel, template, language, delivery status                                                                                       |
| FeeConfig, AppConfig                                    | Configurable values with effective dates and approvals                                                                             |
| Course, Module, Enrolment, Certificate (R3)             | Training content, progress, results, verification codes                                                                            |
| CorporateAccount, Subscription (R4)                     | Company, members, billing                                                                                                          |
| AdCampaign, AdEvent (R4)                                | Creative, placement, targeting, impressions and clicks                                                                             |
| ReferralCredit                                          | Referrer, referee, value, status                                                                                                   |
| StaffRole, AuditLog                                     | Permissions; immutable log of actions                                                                                              |

## 8.2 Data Rules

- All money fields are integers in XAF. All timestamps stored in UTC and
  displayed in Africa/Douala time.

- Frozen values (period rates, commissions, signed contract terms and
  hashes) cannot be updated after creation.

- Every table that holds personal data supports anonymisation without
  breaking financial records.

## 8.3 Data Retention

| **Data**                                         | **Retention**                                                                                    |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Account data                                     | While the account is open, then 5 years, then anonymised                                         |
| Contracts and amendments                         | 10 years after the contract ends (commercial and accounting records)                             |
| Ledger, payments, refunds                        | 10 years                                                                                         |
| Messages                                         | 2 years after the last message, unless linked to a dispute                                       |
| Vetting documents (ID, criminal record, medical) | While the provider account is active, then 1 year, then deleted. Rejected applications: 6 months |
| Audit logs                                       | 5 years                                                                                          |
| Analytics                                        | Raw events 1 year; anonymised aggregates indefinitely                                            |

Retention periods must be confirmed by legal review (open decision
OD-06).

# 9. Release Acceptance Criteria

## 9.1 Release 1: Website (Month 3)

Release 1 is accepted when all Must requirements marked R1 work in
production with the live aggregator, and the following journeys pass end
to end in both English and French on a mid-range Android phone over a 3G
connection:

1.  A provider registers with office help, books an interview, is vetted
    in Douala or Bamenda and becomes searchable.

2.  An employer registers, searches, messages a provider with contact
    details masked, and sends an offer.

3.  The provider counter-offers; the employer accepts; both sign with
    OTP; the contract PDF is available to both.

4.  The employer funds month 1 by MTN MoMo and month 2 by Orange Money;
    the worker is paid on each payment date; the ledger reconciles with
    the aggregator report.

5.  A short job is paid at booking, completed, and paid out within 48
    hours.

6.  An employer reaches loyalty month 13 and is charged 6% automatically
    (tested with the clock moved forward in staging).

7.  The worker leaves after 8 months; the employer receives a free
    replacement that starts at loyalty month 9.

8.  A dispute holds a period, is resolved by a partial refund, and the
    ledger stays balanced.

9.  An overdue period triggers reminders, alerts the provider, and
    suspends the contract after the grace days.

10. Staff see accurate analytics matching the ledger totals.

## 9.2 Release 2: Mobile App (Month 5)

All R2 Must requirements pass; journeys 2 to 5 above pass in the Android
app; push notifications arrive within 1 minute.

## 9.3 Release 3: Training (Month 6)

A provider pays for a course, completes it, passes the quiz, receives a
certificate whose code verifies publicly, and the badge appears in
search.

## 9.4 Release 4: Year 2

A corporate account is billed monthly; an advertising campaign runs and
reports results; the first home service category (cleaning) runs as
short jobs at 14%.

# 10. Constraints, Assumptions and Risks

## 10.1 Constraints

| **Constraint**                               | **Impact**                                                           |
|----------------------------------------------|----------------------------------------------------------------------|
| Escrow must be held by a licensed aggregator | ProAid depends on the aggregator's licence, availability and fees    |
| Founders build and vet in Year 1             | Scope must stay focused on R1 Must requirements to launch in Month 3 |
| Bilingual from day one                       | All content and templates need two languages                         |
| No specific e-signature regime confirmed     | OTP-confirmed consent with evidence is used; legal review required   |
| Data protection law and transfer rules       | Hosting choice and authorisation may affect launch timing            |
| SMS costs                                    | Budget of 100,000 XAF in Year 1; non-essential SMS capped            |

## 10.2 Risk Register

| **Risk**                                                     | **Likelihood** | **Impact** | **Mitigation**                                                                                                           |
|--------------------------------------------------------------|----------------|------------|--------------------------------------------------------------------------------------------------------------------------|
| Employers and workers move off the platform after meeting    | High           | High       | Contact masking until active; replacement guarantee and loyalty discounts reward staying; payment protection for workers |
| Employers fund late                                          | Medium         | High       | Reminders, overdue process, provider alerts, suspension                                                                  |
| Aggregator outage or failed payouts                          | Medium         | High       | Idempotent jobs, retries, Finance queue, status messages, reconciliation                                                 |
| Escrow arrangement not permitted by the aggregator's licence | Low            | Critical   | Confirm the escrow model in writing with the aggregator before integration (OD-09)                                       |
| Data protection non-compliance                               | Medium         | High       | Legal review, authorisation, minimal data, retention limits, access logging                                              |
| Vetting bottleneck in two offices                            | Medium         | Medium     | Interview slots, queue timers, hiring trigger in business plan section 9.1                                               |
| Competition from QwickServices and agencies                  | Medium         | Medium     | Specialise in care in the home: deeper vetting, long contracts, replacement, loyalty pricing, worker keeps 100%          |
| Fee logic errors                                             | Low            | High       | One fee engine with full test coverage and worked examples; frozen values per period                                     |
| Low provider digital literacy                                | High           | Medium     | Assisted registration at offices, simple screens, SMS for key events                                                     |

# 11. Open Decisions

The founders must confirm the items below. The default is what
developers implement until a decision is recorded; every default is
configurable or isolated so it can be changed without rework.

| **ID** | **Question**                                                                                                               | **Default until decided**                                                 |
|--------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| OD-01  | When an employer has two long contracts in the same month, does that month count once or twice towards loyalty?            | DECISION count both months, as long as they are different contracts| 
| OD-02  | Who pays aggregator collection and payout fees?                                                                            | ProAid absorbs them (Year 1 budget line of 300,000 XAF)                   |
| OD-03  | Grace days after an overdue funding window and the consequences                                                            | 5 days, then contract suspended; provider may leave without notice, but notices should be sent every day to the employer and customer service will also call        |
| OD-04  | Refund of commission on cancellation and disputes                                                                          | As in BR-CAN                                                              |
| OD-05  | Any limit on free replacements (time window or number)                                                                     | No limit; Operations may refuse in cases of abuse                         |
| OD-06  | Hosting location, data protection authorisation and retention periods                                                      | Obtain legal advice before production launch                              |
| OD-07  | Legal minimum wage value and contract template legal review                                                                | Warning only; value set by Super Admin after review                       |
| OD-08  | What the corporate package includes                                                                                        | Consolidated billing, dedicated Operations contact, priority replacements |
| OD-09  | Which licensed aggregator to use, confirmed to support escrow, disbursements, webhooks and sandbox for both MTN and Orange | Shortlist and decide before Month 2                                       |
| OD-10  | Keep dual-role accounts?                                                                                                   | Deferred to R2 as Could have                                              |
| OD-11  | Default notice period for long contracts                                                                                   | 14 days                                                                   |
| OD-12  | Referral credit value and budget                                                                                           | 5,000 XAF per successful referral; 50,000 XAF total cap                   |
| OD-13  | Are open-ended long contracts allowed, or must every contract have an end date?                                            | Allowed with Monthly schedule only                                        |

# Appendix A: Traceability Matrix

| **Business Plan Item**                                  | **Section** | **Requirements**                          |
|---------------------------------------------------------|-------------|-------------------------------------------|
| Marketplace, not an agency                              | 1, 3.2, 6   | FR-CON-01, FR-WEB-01                      |
| Comprehensive vetting                                   | 3.2         | FR-KYC-01 to FR-KYC-07                    |
| Offices in Douala and Bamenda; platform across Cameroon | 2.6         | FR-AUTH-05, FR-KYC-02, FR-ADM-01, NFR 6.8 |
| Search by type, location, language, experience, ratings | 3.2, 6.1    | FR-SRCH-01 to FR-SRCH-05                  |
| In-app messaging to interview and agree terms           | 6.1         | FR-MSG-01 to FR-MSG-05                    |
| Standard contract template both parties can adapt       | 3.2, 6.1    | FR-CON-01 to FR-CON-08                    |
| Employer-paid commission; worker keeps 100%             | 8.3         | BR-FEE, FR-FEE-01 to FR-FEE-04            |
| Loyalty levels 12%, 6%, 4%; short jobs 14%              | 8.3         | BR-FEE, BR-LOY, FR-FEE-01, FR-FEE-02      |
| Escrow funded within first 10 days of each period       | 3.2, 8.3    | BR-PAY, FR-PAY-01 to FR-PAY-06            |
| Monthly or half and half payment                        | 6.1, 8.3    | BR-PAY-1 to BR-PAY-3                      |
| Short job payout within 48 hours                        | 6.2, 8.3    | FR-PAY-07                                 |
| Free replacement at all times                           | 8.3         | BR-REP, FR-REP-01 to FR-REP-04            |
| Dispute resolution before release                       | 6.2         | BR-DIS, FR-DIS-01 to FR-DIS-05            |
| Ratings and reviews                                     | 3.2         | FR-REV-01 to FR-REV-04                    |
| Referral programme for employers only                   | 7.1         | FR-REF-01, FR-REF-02                      |
| Website Month 3; mobile app Month 5                     | 8.2         | Section 1.3, FR-MOB-01 to FR-MOB-05       |
| Training 10,000 XAF per course from Month 6             | 8.4         | FR-TRN-01 to FR-TRN-06                    |
| Corporate packages 50,000 XAF per month (Year 2)        | 8.4         | FR-CORP-01 to FR-CORP-03                  |
| Partner advertising (Year 2)                            | 8.4         | FR-AD-01 to FR-AD-03                      |
| Expansion into home services at 14%                     | 9.2         | BR-FEE-6, FR-HOME-01 to FR-HOME-03        |
| New towns in Year 3                                     | 9.3         | NFR 6.8                                   |
| Tracking break-even and self-sufficiency                | 8.9 to 8.11 | FR-ADM-07                                 |
| Payment and data legal compliance                       | 8.1         | NFR 6.4, OD-06, OD-09                     |

# Appendix B: Worked Fee Examples

These examples are mandatory unit test cases for the fee engine (NFR
6.6).

| **Case**                                                                   | **Worker receives**                       | **Commission**                              | **Employer pays**                  |
|----------------------------------------------------------------------------|-------------------------------------------|---------------------------------------------|------------------------------------|
| Nanny, 80,000 XAF a month, loyalty months 1 to 12                          | 80,000 a month                            | 9,600 (12%)                                 | 89,600 a month                     |
| Same nanny, loyalty months 13 to 24                                        | 80,000 a month                            | 4,800 (6%)                                  | 84,800 a month                     |
| Same nanny, loyalty month 25 onwards                                       | 80,000 a month                            | 3,200 (4%)                                  | 83,200 a month                     |
| Short job, 30,000 XAF one-time                                             | 30,000                                    | 4,200 (14%)                                 | 34,200                             |
| One-month contract, 75,000 XAF                                             | 75,000                                    | 10,500 (14%)                                | 85,500                             |
| 4-month contract, 75,000 XAF a month, new employer, Half and Half          | 150,000 at the middle; 150,000 at the end | 18,000 per half (12% on each of 2 months)   | 168,000 per half                   |
| Replacement after 8 months at 80,000 XAF; new contract months 1 to 4       | 80,000 a month                            | 9,600 (loyalty months 9 to 12)              | 89,600 a month                     |
| Same replacement, its month 5                                              | 80,000                                    | 4,800 (loyalty month 13)                    | 84,800                             |
| Employer at loyalty month 11, new 4-month contract at 100,000 XAF, Monthly | 100,000 a month                           | Months 1 to 2: 12,000; months 3 to 4: 6,000 | 112,000, 112,000, 106,000, 106,000 |
| Same contract with Half and Half                                           | 200,000 per half                          | First half: 24,000; second half: 12,000     | 224,000 then 212,000               |

Rounding check: a wage of 83,333 XAF at 12% gives 9,999.96, rounded to
10,000 XAF commission.

*End of Document. ProAid Cameroon Software Requirements Specification
v2.0*
