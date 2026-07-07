# loo_look — Scope

**One-liner:** Beli for bathrooms. Find a good bathroom near you when you need one; rate it in under 30 seconds when you're done.

## Positioning

Beli's primary surface is a social feed. Ours is not. The primary use case is urgency —
"I need to go, now, and I have standards" — so the home screen is a map/list of nearby
bathrooms ranked by distance and rating, with one-tap amenity filters. The social layer
(friends, tagging, feed) is a later layer on top of a utility that works solo.

## Core loops

Each loop has a speed budget. If a design change blows the budget, it's wrong.

### Find (read path — under 10 seconds)
1. Open app → map/list of nearby bathrooms, sorted by distance × rating.
2. Optional: tap filter chips (bidet, accessible, gender-neutral, free, etc.).
3. Tap a bathroom → profile: score, amenities, photos, access info ("code is 2413",
   "ask barista for key"), recent reviews.
4. Tap directions.

### Rate (write path — under 30 seconds)
1. Tap "+" → location snaps to nearest known bathroom (or create a new one).
2. Score it.
3. Tap amenity/condition chips — no typing required.
4. Optional: photo, caption, tag friends (v1).
5. Post.

## Tag taxonomy — two kinds, modeled separately

**Persistent amenities** — properties of the bathroom. Aggregated across ratings onto
the bathroom profile (majority of raters tag "bidet" → the bathroom has a bidet).
Used for *filtering*.

- Jet spray / bidet
- Toilet paper ply (1/2/3/4-ply)
- Changing table
- Accessible stall
- Gender-neutral
- Free vs. customers-only vs. code required
- Single-occupancy / lockable
- Hand dryer vs. paper towels

**Visit conditions** — properties of one visit. Belong to the individual rating and
average into the score over time. Used for *quality*.

- Cleanliness
- Stocked (TP, soap, towels)
- Line / wait
- Smell
- Working lock / stall privacy

## Release cut

### v0 — utility, usable by two people
- Map + nearby list with distance/rating sort
- Amenity filter chips
- Bathroom profile page (aggregate score, amenities, photos, access info, reviews)
- Add a bathroom (drop pin / snap to venue)
- Quick-rate flow: score + chips + optional photo/caption
- Lightweight local profile (name only — no auth wall in front of the core loop)
- Seeded map data (see below)

### v1 — social
- Real accounts + auth
- Friends
- Tag friends on a rating
- Feed of friends' ratings

### Later
- Leaderboards / badges ("Porcelain Throne" tiers)
- Saved lists ("airport bathrooms I trust")
- Crowd-sourced door codes with freshness voting
- Beli-style comparative ranking instead of absolute scores
- Android / web

## Decisions made

| Decision | Choice | Why |
|---|---|---|
| Platform | React Native + Expo | One codebase, runs on both founders' iPhones via Expo Go today, fast iteration, App Store path later. |
| MVP scope | Utility first | Prove find + rate solo before building the social layer. |
| Seed data | Import + user-generated | Seed from Refuge Restrooms API and OpenStreetMap `amenity=toilets` so the map isn't empty on day one; users add and correct entries. |

## Proposals (not yet locked)

- **Rating scale:** 10-point (0.0–10.0, one decimal) — Beli-familiar, more resolution
  than stars, still one tap on a slider.
- **Backend:** Supabase — Postgres + PostGIS for "bathrooms within X meters" queries,
  built-in auth for v1, storage for photos, generous free tier.
- **Maps:** Apple Maps via `react-native-maps` default provider on iOS — free, native feel.

## Data model sketch

- **Bathroom** — id, name, venue/host name, lat/lng, access type (public / customers /
  code), floor/directions note, aggregate score, aggregated amenities, created_by.
- **Rating** — id, bathroom_id, user_id, score, amenity tags, condition tags, photos,
  caption, tagged_user_ids (v1), created_at.
- **User** — id, display name, avatar; auth + friends in v1.

## Design direction (deferred)

iOS-native dark mode conventions. No custom color system or brand theming until the
functionality above is built and the flows are proven. Revisit after v0.
