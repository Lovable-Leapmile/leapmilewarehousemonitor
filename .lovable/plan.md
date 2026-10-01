# Remove duplicate pigeon-hole data

## Changes
- Normalize badge letters and List IDs before displaying pigeon-hole data.
- Show each List ID only once across the full pigeon-hole row, even if repeated API records return it.
- Keep the hosted API relay because it protects the Leapmile credential and enables polling; no database records are used for this display.

## Verification
- Check repeated API records collapse to one visible List ID.
- Confirm the board still refreshes every two seconds and remains visible.
