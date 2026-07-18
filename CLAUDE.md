# LifeCore — Project Context

Dit project hergebruikt de architectuurpatronen hieronder,
gedistilleerd uit het Constatum-project. Domeinlogica is
volledig anders (welzijn i.p.v. juridisch bewijs), infrastructuur
en conventies zijn hetzelfde.

# Architectuur-overdracht: React + Supabase patronen voor LifeCore

Dit document beschrijft generieke, herbruikbare architectuurpatronen,
geëxtraheerd uit een bestaand productieproject (React + Vite + Supabase,
PWA, Vercel-deploy). Alles wat specifiek is voor het brondomein is
weggelaten — dit document is op zichzelf leesbaar voor een nieuw project
(LifeCore) zonder kennis van dat brondomein.

---

## 1. Mapstructuur en conventies

```
src/
  App.jsx              # root component: paginarouting (useState, geen router-lib), auth-gate, error boundary
  main.jsx             # ReactDOM.createRoot + monitoring-init (bv. Sentry)
  index.css            # globale resets/layout
  styles/
    theme.css           # CSS custom properties (design tokens) — zie §7
  contexts/              # React Context, spaarzaam gebruikt (zie §4)
  hooks/                 # custom hooks — alle stateful logica die componenten nodig hebben
  components/
    <feature>/           # één map per feature/domein (bv. auth/, instellingen/, export/)
      FooPage.jsx        # top-level pagina-component voor die feature
      FooModal.jsx        # modal-componenten (zie §6)
      Foo.css             # co-located CSS per component (BEM-achtige klassenamen, geen CSS-modules/styled-components)
    ui/                   # generieke, domeinloze UI-bouwstenen (Toast, ErrorBoundary, Collapsible, ...)
    layout/                # AppHeader, BottomNav e.d.
    nav/                    # navigatiecomponenten
  lib/
    <feature>/             # pure logica per feature, GEEN React — testbaar zonder DOM
    supabase/              # één bestand per tabel/domein, dunne client-wrappers (zie §2)
    storage/                 # lokale persistente laag (localStorage/IndexedDB) — offline-first
    monitoring/               # Sentry-wrapper of vergelijkbaar
  utils/                     # kleine, generieke helpers (formatting e.d.), geen domeinkennis
supabase/
  migrations/               # NNNN_korte_naam.sql, oplopend genummerd (zie §2)
  functions/                 # Edge Functions, indien gebruikt
tests/
  e2e/                       # Playwright specs
docs/                        # ARCHITECTURE.md, DECISIONS.md, CURRENT_STATE.md, NEXT_STEPS.md
```

### Naamgevingsconventies
- **Bestandsnamen**: `PascalCase.jsx` voor componenten, `camelCase.js` voor hooks/lib-modules, één component per bestand.
- **CSS**: co-located naast het component (`Foo.jsx` + `Foo.css`), geïmporteerd met een relatief pad in het component zelf. Geen CSS-in-JS, geen CSS-modules.
- **Hooks**: `useX.js`, altijd in `src/hooks/`, retourneren een plat object met state + actiefuncties (geen classes, geen reducers tenzij complexiteit dat rechtvaardigt).
- **Taal van identifiers**: kies één taal (natuurlijke taal van de domeinlogica, bv. Nederlands of Engels) en houd die consistent aan in variabelen/functienamen/comments door de hele codebase — niet mengen per bestand.
- **Geen barrel-exports** (`index.js` die alles re-exporteert) gezien in dit project — imports gaan rechtstreeks naar het bronbestand. Overweeg dat ook voor een nieuw project: minder indirectie, duidelijkere afhankelijkheidsgrafiek.

---

## 2. Supabase-opzet

### Migraties
- Elke schema-wijziging is een los, oplopend genummerd bestand: `supabase/migrations/NNNN_korte_naam.sql`.
- Elk migratiebestand begint met een commentaarblok dat uitlegt **wat** en **waarom**, en vermeldt expliciet welke RLS-policy's het toevoegt/wijzigt/vervangt.
- Policy's worden altijd met `DROP POLICY IF EXISTS "naam" ON tabel;` gevolgd door `CREATE POLICY` opnieuw aangemaakt — nooit `ALTER POLICY`. Dat maakt elke migratie idempotent en het eindresultaat direct leesbaar uit het bestand zelf, zonder de volledige historie te moeten optellen.
- Eén logische wijziging (bv. "admin-RLS-bypass toevoegen aan tabel X") = één migratiebestand, ook als dat meerdere `ALTER TABLE`/`CREATE POLICY`-statements omvat.

### RLS-policy-patronen
Terugkerend patroon: **eigenaar OF rol-uitzondering**, met de rol-check via een subquery op een aparte rollen-tabel:

```sql
CREATE POLICY "tabel_select_eigen_of_rol" ON tabel
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

Vuistregels die hieruit volgen:
- **Fail-closed by default**: een policy die niets expliciet toestaat, verbergt de rij. Uitzonderingen (gedeeld/openbaar zichtbaar) worden expliciet als extra `OR`-voorwaarde toegevoegd, nooit als afwezigheid van een `WHERE`.
- **Rechten worden op database-niveau afgedwongen, niet alleen client-side.** Een client-only-filter (bv. "toon dit niet in de UI") is nooit voldoende voor iets dat als toegangscontrole bedoeld is — als een grens (bv. een straal, een rol, een lidmaatschap) er client-side wél is maar server-side ontbreekt, is dat een lek, geen optimalisatie.
- **UPDATE-policy's zijn een apart besluit van SELECT-policy's** — een rol die mag lezen, mag niet automatisch schrijven; expliciet apart toevoegen.
- Voor fijnmaziger rechten dan een handvol grove rollen: overweeg een `role_permissions`(role, permission) + `permissions`(code) tabellenpaar naast de grove rol, zodat nieuwe, specifieke rechten niet direct een nieuwe rol/kolom vereisen (zie ook §3).

### Client-wrapper-aanpak
- **Eén bestand per tabel/domein** in `lib/supabase/` (bv. `profiel.js`, `entries.js`, `admin.js`), niet één grote "supabase-service".
- **`client.js`** is de enige plek die `createClient()` aanroept, lazy geïnitialiseerd achter een `sbClient()`-functie die `null` teruggeeft als env-vars ontbreken — elke aanroeper checkt expliciet op `null`/`falsy` in plaats van te crashen:
  ```js
  export function sbClient() {
    if (!SUPABASE_ENABLED) return null;
    if (_sb) return _sb;
    try { _sb = createClient(URL, ANON, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); return _sb; }
    catch (e) { console.error(...); return null; }
  }
  ```
- Elke exportfunctie in een wrapper-bestand volgt het patroon: `sb()` ophalen → bij `null` vroeg `return false/null` → poging → error loggen en `false`/`null` teruggeven, nooit ongevangen throwen richting de component.
- **Batch-varianten naast single-varianten** waar zinvol (`syncEen()` naast `syncBatch()`) — een enkel record blijft simpel, een batch-upsert bestaat apart voor de offline-sync-usecase (zie §4).
- Gevoelige velden (bv. e-mailadres) kunnen gehasht opgeslagen worden in een gedeelde/publiek-zichtbare tabel terwijl het plaintext alleen in de auth-tabel van Supabase zelf blijft — een aparte overweging per veld, niet een blanket-regel.

### Env-variabelen
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (+ eventueel `VITE_SENTRY_DSN` voor monitoring) via `.env` (lokaal, nooit gecommit) en `.env.example` (wel gecommit, met placeholder-waarden).
- Een `SUPABASE_ENABLED`-vlag (`Boolean(URL && ANON KEY)`) laat de rest van de app gracieus degraderen naar een lokaal-alleen-modus als Supabase niet geconfigureerd is, in plaats van te crashen.

---

## 3. Auth/RBAC-patroon

### Rollen
- Rollen zijn simpele string-waarden in een `user_roles`-tabel (`user_id`, `role`, eventueel profielvelden zoals een thuislocatie), met een `CHECK`-constraint op toegestane waarden.
- Rolwaarden worden **client-side niet hardcoded verspreid** — één centraal `lib/rollen.js`-bestand met pure, makkelijk te testen functies:
  ```js
  export function isAdmin(rol) { return rol === 'admin'; }
  export function isModeratorOfAdmin(rol) { return rol === 'admin' || rol === 'moderator'; }
  ```
  Deze functies nemen de rol (en evt. user/eigenaarschap-velden) als **parameter**, niet als gelezen global — puur en unit-test-baar zonder React/Supabase-mocking.
- **Nieuwe, samengestelde rechten-check krijgt een eigen naam**, in plaats van een bestaande generieke functie (bv. `isModeratorOfAdmin`) stilzwijgend uit te breiden — voorkomt dat een UI-gate die voor doel A gemaakt is, ongemerkt ook doel B raakt.
- Een RBAC-fundament met fijnmazige permissies (`role_permissions` + `permissions`-tabellen, opgehaald als een `Set<string>` codes) kan **naast** de grove rol-functies bestaan — puur additief, voor nieuwe UI-elementen die een fijnere gate nodig hebben dan de bestaande rollen bieden.

### Hoe rechten gecheckt worden
- **Twee lagen, altijd allebei**: een UI-gate (verberg/disable een knop/pagina op basis van `lib/rollen.js`-functies) plus een database-RLS-policy die hetzelfde afdwingt. De UI-gate is puur UX (voorkomt een frustrerende, gegarandeerd-mislukkende actie); de RLS-policy is de eigenlijke beveiliging. Nooit alleen de UI-gate bouwen en de RLS-kant vergeten.
- **`useAuth()`-hook** is de enige plek die de Supabase-auth-sessie beheert: houdt `user`, `rol`, `permissies` (Set) bij, luistert op `onAuthStateChange`, en biedt `login`/`signup`/`logout`/wachtwoord-acties. Andere hooks/componenten lezen deze state door, ze benaderen Supabase-auth nooit rechtstreeks.
- **Val op**: geef state die uit een auth-callback komt (bv. `user`) nooit als dependency aan een `useCallback` die zelf weer in een `useEffect`-dependency-array staat die `onAuthStateChange` (her)abonneert — elke stille token-refresh triggert dan een nieuwe render-identiteit, wat een oneindige resubscribe-lus veroorzaakt. Los dit op door de callback expliciet de waarde als parameter te laten meekrijgen in plaats van 'm uit closure/state te lezen.
- Test auth-afhankelijke code minstens één keer tegen een **echte, ingelogde sessie** — een lokale "auth staat altijd uit"-kortsluiting (handig voor snelle dev-iteratie) verbergt dit soort bugs volledig tot productie.

---

## 4. Component-architectuur en state-management

- **Geen externe state-management-library** (geen Redux/Zustand/Recoil) — state leeft in custom hooks (`useX()`), die componenten aanroepen en doorgeven via props. Eén hook per samenhangend stuk state/gedrag (auth, sync, notificaties, een specifiek formulier).
- **Eén root-component (`App.jsx`)** orchestreert: roept alle top-level hooks aan, houdt de actieve "pagina" bij via simpele `useState('paginanaam')` (geen router-library nodig voor een app met een klein, vast aantal top-level pagina's), en geeft de juiste data/callbacks door aan de actieve pagina-component.
- **React Context spaarzaam gebruiken** — alleen voor iets dat écht breed gedeeld moet worden zonder prop-drilling door veel lagen (bv. een tool-/modus-context). De meeste state hoeft geen Context; expliciete props zijn duidelijker te traceren.
- **`lazy()` + `Suspense`** voor zware, niet-altijd-nodige subbomen (bv. een kaart-/chart-zware beheerinterface die alleen bepaalde rollen zien) — voorkomt dat elke gebruiker die bundle-gewicht download.
- **Eén Error Boundary rond de pagina-inhoud**, niet rond de hele app: zet 'm om het gedeelte dat kan crashen door route-specifieke rendering (`<main>`), zodat header/navigatie/auth-overlay (siblings) intact blijven en de gebruiker een uitweg houdt (bv. terug naar een veilige startpagina) in plaats van een volledig zwart scherm. Geef de boundary een `key` die verandert bij navigatie, zodat een geslaagde her-navigatie de fout-status niet laat "vastplakken".
- **Offline-first datalaag** (indien relevant voor het nieuwe project): lokale opslag (localStorage voor kleine records, IndexedDB voor blobs/bijlagen) is de bron van waarheid voor de UI; een aparte sync-hook (`useXSync(user, dataApi)`) synchroniseert naar Supabase op de achtergrond zodra er een sessie + connectiviteit is, met een `sync_status`-veld per record en een batch-upsert-pad voor "veel tegelijk synchroniseren na offline-periode".

---

## 5. Testopzet

- **Vitest** voor unit tests van pure `lib/`-logica: `describe`/`it`/`expect`, environment `node` (geen DOM nodig voor pure functies), bestandsnaam `*.test.js` naast de geteste module.
- Een enkele `*.test.jsx` (environment/plugin `react()` alleen daar nodig) voor component-tests met `@testing-library/react`, als een component genoeg pure rendering-logica bevat om het waard te zijn.
- **Playwright** voor e2e: `tests/e2e/*.spec.js`, config start de dev-server zelf (`webServer` met `reuseExistingServer: true`) zodat een losse server niet apart opgestart hoeft te worden.
- Testconventie: test **pure functies** uitgebreid (makkelijk, geen mocking nodig), test **integraties** (Supabase-calls, DOM-events) selectiever via e2e in plaats van veel unit-tests met gemockte clients.
- Val op bij e2e met file-uploads/tekenen op een canvas/kaart: volgorde van acties is soms strikt (bv. een file-input-actie moet de allereerste interactie zijn), en polygoon-/tekenacties op een kaartlibrary vereisen vaak een specifiek afrondingsevent (dubbelklik op een nieuw punt, niet op het laatst geplaatste). Dit soort details ontdek je pas door de library-documentatie/broncode te checken, niet door te raden.

---

## 6. Build/deploy-setup

- **Vite** als build-tool, met `build.sourcemap: true` — leesbare stacktraces in productie zijn de moeite waard zodra de app publiek draait; een geminificeerde regel-nummer-only stacktrace is bij een productie-only bug vaak niet te herleiden.
- **`vite-plugin-pwa`** (indien een PWA/offline-first ervaring gewenst is): `registerType: 'prompt'` (vraagt de gebruiker expliciet om te herladen bij een nieuwe versie, i.p.v. stilzwijgend `autoUpdate`) + `clientsClaim: true` in de workbox-config — zonder die laatste optie neemt een net geactiveerde service worker een al-open tab nooit over, waardoor een "herlaad nu"-knop niets lijkt te doen.
- **Vercel**: `vercel.json` met `framework: vite`, `outputDirectory: dist`, een SPA-rewrite (`"/((?!.*\\..*).*)" → "/index.html"`) zodat client-side routes (indien gebruikt) niet 404'en op een directe URL, en expliciete `Content-Type`-headers voor `.js`/`.css` plus een lang-cache-header (`immutable`) voor `/assets/*` (Vite hasht bestandsnamen toch bij elke wijziging).
- **Deploy-trigger**: als de repo op GitHub staat maar de Vercel-integratie geen automatische webhook-deploy triggert, is een handmatige `vercel deploy --prod` na elke push naar main nodig — check dit expliciet bij setup in plaats van aan te nemen dat pushen automatisch deployt.
- **Env-vars**: nooit lokaal `pull`en van gevoelige/production-vars in een gedeelde omgeving; zet ze rechtstreeks in het Vercel-dashboard en deploy met `vercel deploy --prod` (zonder `--prebuilt`, tenzij je zeker weet dat de prebuilt output al de juiste env-vars had ten tijde van bouwen).
- **ESLint**: `eslint-plugin-react-hooks` (flat recommended) + `eslint-plugin-react-refresh` (vite-preset) zijn het enige lint-fundament nodig bovenop `@eslint/js` recommended — geen aparte Prettier-integratie gezien, wat suggereert dat formatting hier niet apart afgedwongen wordt.

---

## 7. Generieke UX/design-system keuzes

### Design tokens
Eén centraal `theme.css` met CSS custom properties (`:root { --bg-primary: ...; --accent: ...; }`) — kleuren, font-sizes, en layout-constanten (headerhoogte e.d.) als tokens, nooit hardcoded waarden verspreid door component-CSS. Concreet gebleken waardevol:
- **Font-size-tokensysteem** (`--font-size-xs` t/m `--font-size-2xl`) i.p.v. losse `rem`/`px`-waarden — voorkomt dat toegankelijkheidsnormen (WCAG-contrast/leesbaarheidsminimum) sluipenderwijs ondermijnd worden door individueel "even iets kleiner" te kiezen per component. Vuistregel: metadata/mono-tekst mag het kleinste token zijn, tekst die de gebruiker actief moet lezen (labels, foutmeldingen, formulierhulp) niet.
- **Losse "glas"/overlay-tokens** (translucente achtergrond/rand als apart token i.p.v. inline `rgba(...)`) zodat een licht/donker-thema-variant die kan overschrijven zonder de component-CSS zelf aan te raken.
- Bewust **niet elk kleurgebruik** hoeft aan het centrale accent-token gekoppeld te zijn — een visualisatie-specifieke kleurcodering (bv. status-kleuren in een kaart of grafiek) mag losstaan van het UI-thema als semantische stabiliteit (dezelfde kleur = dezelfde betekenis, ongeacht thema-wissels) belangrijker is dan visuele consistentie met de merkkleur.

### Modals
- Eigen, lichte modal-component per gebruik (geen generieke `<Modal>`-wrapper-library) — elke modal:
  - zet focus bij het openen op een sluitknop/eerste focusbaar element (`useRef` + `useEffect(() => ref.current?.focus(), [])`),
  - implementeert een eigen focus-trap op `Tab`/`Shift+Tab` binnen de modal-boom,
  - sluit via een expliciete `onClose`-prop-callback (geen globale modal-state/stack-manager).
- Voor modals met genest, rol-afhankelijk detailniveau (bv. een gedeelde/publieke variant met minder informatie dan de eigenaar-variant): bouw een **aparte component** voor de gerestricte variant in plaats van de volledige detail-modal te hergebruiken met een `toon`-flag. Een voorwaardelijke render-tak in één grote component is makkelijker om per ongeluk te laten "lekken" (een nieuw veld toegevoegd aan de volledige variant vergeten af te schermen in de gerestricte tak) dan twee losse componenten die ieder alleen tonen wat ze expliciet krijgen doorgegeven.

### Forms
- Formulierstate als lokale `useState` per veld of één form-hook (`useXForm()`) die alle veldstate + validatie + submit-logica bundelt — teruggegeven als plat object, component blijft puur presentational.
- Bestandsuploads (foto's e.d.): client-side voorverwerken (bv. EXIF/GPS strippen, hash berekenen van het origineel vóórdat het gestript wordt) vóór opslag — bewaar het resultaat van zo'n voorbewerkingsstap (hash, gestripte versie) expliciet, niet alleen de eindwaarde, als een latere feature (bv. een verificatie-/audit-weergave) het onderscheid tussen origineel en verwerkt bestand nodig kan hebben.

### Error states
- **Toast-component** voor korte, niet-blokkerende feedback: `{ id, tekst, type }`-object als prop, een nieuwe `id` (ook bij gelijke tekst) toont 'm opnieuw, auto-hide na een vaste duur via `setTimeout` in een `useEffect`.
- **Eén centrale Error Boundary** (zie §4) voor onverwachte render-crashes, met een simpele fallback-UI (titel, korte uitleg, één herstel-actie zoals "pagina herladen" of "terug naar start") — nooit een technische stacktrace tonen aan de eindgebruiker.
- Foutregistratie naar een externe monitoring-dienst (bv. Sentry) via één centrale `captureFout()`-wrapper-functie (nooit de SDK rechtstreeks vanuit componenten aanroepen) — dat is de enige plek die weet óf monitoring actief is (env-var aanwezig + niet-localhost), en de enige plek die eventuele privacygevoelige data uit breadcrumbs/payloads filtert vóórdat die het project verlaat.

---

## Samenvatting van de kernprincipes

1. **Twee lagen voor rechten, altijd**: UI-gate voor UX, RLS-policy voor echte beveiliging.
2. **Fail-closed**: een policy/check die niets zegt, verbergt/blokkeert — uitzonderingen zijn expliciete extra voorwaarden.
3. **Pure functies waar mogelijk** (`lib/`), dun en declaratief in componenten (`components/`) — maximaliseert wat zonder DOM/mocking test-baar is.
4. **Eén centrale plek per cross-cutting concern**: één `client.js` voor de Supabase-client, één `rollen.js` voor rolchecks, één `captureFout()` voor monitoring, één `theme.css` voor design tokens.
5. **Nieuwe, samengestelde logica krijgt een eigen naam/component** in plaats van een bestaande generieke functie/component stilzwijgend uit te breiden — voorkomt onbedoelde koppeling tussen ongerelateerde use-cases.
