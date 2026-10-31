# DECISIONS

Write in English. Short bullet points are fine. Reviewers read this file alongside your code.

## What I assumed

<!-- Anything the brief did not say that you had to decide. -->

Client-side filtering as source of truth (Rule 1): The /v1/requests endpoint filters query parameters (created_from, created_to) on UTC boundaries. Because business rules mandate filtering by the site's local calendar date, I fetched the window and re-validated created_at against each site's IANA timezone (toSiteLocalDateStr).

Filtering invalid requests: Tickets with status === 'canceled', non-null deleted_at, or non-null merged_into_id are completely excluded from the board.

Canonical staff names (Rule 3): Inline names in tickets (assignee.name) and audit logs (actor_name) can be stale. /v1/staff is the single source of truth; all personnel lookups are performed by id through a cached staffMap. If actor_id === null, it is attributed to "System".

Time presentation (Rule 4): All displayed timestamps (created_at, updated_at, audit at, due_on) are normalized to the site's local timezone and displayed with the corresponding short timezone abbreviation (e.g., SGT, AEST, WIB).

Change feed polling cadence (Milestone 3): Polling /v1/changes every 30 seconds satisfies the sub-60-second freshness SLA without excessive network overhead.

## What I found in the API or data

<!-- Anything that did not match the docs, or surprised you, and how you handled it. -->

ApiError constructor signature mismatch: The starter kit defines ApiError(message: string, status: number, retryAfterSeconds?: number | null), but typical HTTP wrappers pass status first. Passing status first triggered TypeScript compile errors (TS2345). I corrected the parameter order when throwing the error in api.ts.

String splitting on compound keys: Splitting the sort selector value "created_at_desc" using naive split('_') resulted in ['created', 'at', 'desc'], assigning sort = "created" and dir = "at" and breaking the sort functionality. I resolved this by using a distinct delimiter (:) in the option values (created_at:desc).

Sorting nullable dates (due_on): Using (a.due_on ?? "").localeCompare(...) produced inconsistent sorting orders for requests without due dates. I added an explicit null check to ensure tickets with due_on === null are consistently sorted to the bottom.

URL synchronization vs. React state: Updating window.location.search with window.history.replaceState does not automatically trigger component re-renders. To support instantaneous client updates and browser Back/Forward navigation, I backed useUrlState with local React state and synchronized it with a popstate event listener.

Reverted audit log events (Rule 5): Audit logs contain events that revert previous actions via reverts_id. Both the reverting event and the reverted event are hidden from the primary audit trail by default, with an optional toggle to inspect them.

Rate limiting (HTTP 429): The API sends a Retry-After header during rate limit spikes. I parsed this header to display an active countdown timer that automatically re-triggers synchronization once expired.

## How I used AI

<!-- Which tools, what you asked, what came back wrong, what you changed. "I didn't use AI" is fine too. -->

What I asked:

Outlining step-by-step milestone guides.

Creating a high-contrast, minimalist, low-color CSS theme to replace standard pastel badges for clearer readability.

Diagnosing TypeScript compile errors in api.ts regarding ApiError parameter ordering.

Debugging why the FilterBar dropdown failed to trigger table re-sorting.

What came back wrong & what I fixed:

Initial code generated for FilterBar used created_at_desc with split('_'), which failed to parse correctly. I identified the issue and changed the delimiter to :.

The initial useUrlState relied solely on window.location.search inside useMemo, which failed to re-render the board upon filter updates. I refactored it to use an internal state synchronized with popstate.

The initial due_on sorting logic converted null to "", causing unstable sorting behavior. I updated the comparator to handle null values explicitly.

## Trade-offs and what I would do next

<!-- What you left out to stay within 3 hours, and what you would do with more time. -->

Native Intl API vs. external libraries:

Trade-off: Relied exclusively on native Intl.DateTimeFormat instead of adding date-fns or dayjs. This avoided bundle overhead and fulfilled all timezone requirements cleanly.

In-memory filtering:

Trade-off: Fetched broad date ranges into memory and handled site, status, and sort mutations client-side. This provides instantaneous filter and sort interactions without waiting on network latency.

Polling vs. WebSockets:

Trade-off: Used a 30-second polling cycle on /v1/changes instead of WebSockets to strictly comply with the rule against introducing custom backend proxies.

What I would do with more time:

Implement full focus trapping and keyboard navigation within the Detail modal.

Add virtualization (e.g., @tanstack/react-virtual) for the request table if ticket counts exceed several thousand.

Add automated integration tests covering the change feed polling loop and cursor expiration (HTTP 410).
