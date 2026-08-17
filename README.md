# loo_look

Beli for Bathrooms — find a good bathroom near you when you need one; rate it in
under 30 seconds when you're done. Product definition lives in [SCOPE.md](SCOPE.md).

## Stack

Expo (SDK 54) · expo-router · TypeScript · react-native-maps (Apple Maps, native) /
Leaflet + OpenStreetMap tiles (web) · live worldwide bathroom data from the
OpenStreetMap Overpass API (no backend yet).

## Location & data (worldwide)

The Nearby screen is location-first: it requests the user's location on launch and
loads public bathrooms near them from OpenStreetMap (`amenity=toilets`), anywhere in
the world — not just UIUC. If location is unavailable, it prompts to enable it, with
an option to browse the curated UIUC demo data. Ratings/scores are still in-memory
(they reset on reload) until a real backend lands (Supabase proposed, see SCOPE.md).

## Setup

```sh
npm install
npx expo install --fix   # aligns native package versions with the Expo SDK
npm run typecheck
npx expo start           # scan the QR code with Expo Go on your iPhone
```

Dependency versions in `package.json` were pinned by hand (scaffolded offline), so
run `npx expo install --fix` after the first install — it corrects any version drift
against the SDK.

## Layout

- `app/` — expo-router routes: `(tabs)/index` Nearby map/list, `(tabs)/profile`,
  `bathroom/[id]` profile page, `rate` quick-rate modal
- `store/AppStore.tsx` — in-memory store (bathrooms, ratings, aggregation)
- `constants/tags.ts` — amenity + visit-condition tag taxonomy
- `data/mock.ts` — placeholder bathrooms/ratings around campus
- `theme/colors.ts` — iOS dark palette tokens (design pass deferred, see SCOPE.md)
