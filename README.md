# loo_look

Beli for Bathrooms — find a good bathroom near you when you need one; rate it in
under 30 seconds when you're done. Product definition lives in [SCOPE.md](SCOPE.md).

## Stack

Expo (SDK 54) · expo-router · TypeScript · react-native-maps (Apple Maps) ·
in-memory mock data seeded around UIUC (no backend yet).

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
