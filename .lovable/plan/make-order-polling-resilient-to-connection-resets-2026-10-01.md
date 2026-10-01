# Make order polling resilient to connection resets

## Goal
Keep the warehouse board visible and polling every two seconds when Leapmile briefly resets a connection, while still recovering automatically when the service responds again.

## Changes
1. **Harden the hosted order request**
   - Keep the existing filter allowlist and credential handling.
   - Add a bounded request timeout.
   - Retry transient network failures and retryable upstream responses with a short backoff.
   - Continue converting Leapmile’s “no records found” response into a successful empty feed.
   - Return a clear unavailable response only after all retry attempts fail, with no credentials or sensitive response details exposed.

2. **Preserve the last successful dashboard data**
   - Stop converting hosted-function failures into empty arrays.
   - Let the polling query retain its previous successful data during a temporary refresh failure, preventing the board from flashing blank or showing “NO LIST AVAILABLE.”
   - Continue the existing two-second polling schedule so the next successful request refreshes the board automatically.

3. **Verify failure and recovery behavior**
   - Add focused tests for successful data, empty 404 responses, transient connection failure followed by success, and exhausted retries.
   - Test the hosted function and check the latest build/runtime signals.
   - Verify that a failed refresh leaves the existing cards visible and a later successful refresh updates them.

## Technical details
- Retry only transient failures; do not retry invalid requests or ordinary permanent client errors.
- Use a small fixed retry budget so three concurrently polled feeds cannot pile up indefinitely.
- Keep external Leapmile traffic behind the existing `leapmile-orders` hosted function.
