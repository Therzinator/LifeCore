# LifeCore — Architectuur

Persoonlijke welzijns- en levensmanagement-app. React + Vite + Supabase, PWA,
offline-first, deploy op Vercel. Zie de root `CLAUDE.md` voor de volledige
patroon-overdracht (conventies, RLS-vuistregels, testopzet, etc.) — dit
document beschrijft hoe die patronen concreet zijn toegepast in dít project.

## Features

| Map | Domein |
|---|---|
| `components/ochtend/` | Ochtendflow: check-in, brain dump, dagfocus, ademhaling, afronden |
| `components/act/` | ACT: waardenverheldering, dagelijkse waarde, defusie-oefening |
| `components/welzijn/` | Tweewekelijkse burn-out/herstel-check (CBI/REQ, gecombineerd), trendgrafieken + actieve signalering |
| `components/mindfulness/` | Ademmeditatie, grounding, spierontspanning (PMR) |
| `components/training/` | Trainingsschema, sessie, geschiedenis, schijven-weergave |
| `components/auth/` | Inlogscherm |
| `components/layout/`, `components/ui/` | Chrome (header, bottom nav) en generieke bouwstenen (Modal, Toast, ErrorBoundary, TimerRing, Voortgangsbalk) |

`App.jsx` is de enige router: `useState('actieve_pagina')`, geen router-lib.
Elke pagina is een top-level component die z'n eigen hook(s) uit `hooks/`
aanroept.

Elke feature volgt hetzelfde patroon: pure logica in `lib/<feature>/`
(geen React, apart getest), een hook in `hooks/` die die logica aan
component-state koppelt, en een `..Pagina.jsx` die het geheel rendert.
`lib/gedeeld/faseCyclus.js` en `lib/kaders/onderbouwing.js` zijn
domeinoverstijgende hulp-modules die door meerdere features gebruikt worden.

## Data: offline-first + sync

- **Bron van waarheid voor de UI is `localStorage`**, via `lib/storage/lokaal.js`
  (`leesLokaal`/`schrijfLokaal`, prefix `lifecore_`). Elk record krijgt via
  `nieuwRecord()` een `sync_status` en `bijgewerkt_op`-timestamp.
- **Eén generieke Supabase-tabel** (`lifecore_data`: `user_id`, `sleutel`,
  `data jsonb`, `updated_at`) i.p.v. een tabel per module — nieuwe lokale
  sleutels (toekomstige features) hebben zo geen nieuwe migratie nodig. Zie
  `supabase/migrations/0001_lifecore_data.sql`.
- **`lib/supabase/sync.js`** synchroniseert per sleutel: pull remote, vergelijk
  `bijgewerkt_op` (lokaal) met `updated_at` (remote), nieuwste wint
  (last-write-wins). `actieve_pagina` en `training_actief` worden nooit
  gesynchroniseerd (puur lokale UI-state).
- **RLS fail-closed**: alle vier policy's (`select`/`insert`/`update`/`delete`)
  op `lifecore_data` staan alleen de eigenaar toe (`auth.uid() = user_id`).
  Geen gedeelde/publieke toegang.

## Auth

- `lib/supabase/client.js`: enige plek die `createClient()` aanroept, lazy
  achter `sbClient()`. `SUPABASE_ENABLED` is `false` als env-vars ontbreken —
  de rest van de app degradeert dan naar lokaal-alleen (geen crash, geen
  inlogscherm).
- `hooks/useAuth.js`: enige plek die de Supabase-auth-sessie beheert
  (`user`, `laden`, `ingelogd`, `login`/`signup`/`logout`). `App.jsx` toont
  `InlogScherm` alleen als `auth.enabled && !auth.laden && !auth.ingelogd`.
- Er is nog geen rollen/RBAC-laag (`lib/rollen.js`) — elke ingelogde gebruiker
  heeft dezelfde rechten op z'n eigen data. Voeg die pas toe als er een
  onderscheid nodig is (bv. een coach-rol die meerdere profielen ziet).

## Build/deploy

- Vite, `build.sourcemap: true`.
- `vite-plugin-pwa`: `registerType: 'prompt'`, `clientsClaim: true`.
- Vercel (`vercel.json`): SPA-rewrite, cache-headers voor `/assets/*`.
- `legacy/` bevat oudere, losse HTML/JS-prototypes uit een eerdere iteratie —
  niet onderdeel van de Vite-app, niet actief onderhouden.

## Testen

- Vitest, `environment: 'node'` (pure `lib/`-functies, geen DOM nodig).
- Eén testbestand per `lib/`-module in `tests/*.test.js`. Nog geen
  component- of e2e-tests.

## Nog niet ingevuld (t.o.v. het patroon in root-`CLAUDE.md`)

- `contexts/` — nog niet nodig, geen breed-gedeelde state die prop-drilling
  rechtvaardigt.
- `lib/monitoring/` (Sentry-wrapper) — nog geen foutregistratie naar een
  externe dienst.
- `components/instellingen/`, `components/export/` — genoemd als
  voorbeeldfeatures in het patroon-document, nog niet gebouwd.
- `docs/DECISIONS.md`, `docs/CURRENT_STATE.md`, `docs/NEXT_STEPS.md` —
  nog niet aangemaakt.
