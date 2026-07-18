# LifeCore — Agenda-module (ontwerpvoorstel, nog niet gebouwd)

Status: **voorstel, wacht op akkoord**. Dit document wordt gepresenteerd
zoals gevraagd — er is nog geen implementatiecode voor deze module. Bouw
start pas na een expliciet akkoord op de keuzes hieronder, met name de
Google-koppeling (die vraagt om een stap die je zelf buiten deze sessie om
moet zetten, zie §3).

## 1. Probleem

Bij hyperfocus (ADHD) raken losse afspraken en dagstructuur makkelijk uit
beeld — niet omdat de informatie ontbreekt, maar omdat er geen centraal,
op-het-juiste-moment-zichtbaar overzicht is. Al bevestigd: dit wordt een
**los overzicht**, geen vervanging van de planning die al in Werk (werkdagen),
Cardio (weekschema) en Huishouden (frequentie/projecten) zit — die blijven
zoals ze zijn.

## 2. Twee soorten inhoud in de Agenda

De Agenda combineert drie verschillende databronnen — geen van drieën wordt
"verplaatst", ze worden alleen samen getoond:

**A. Externe afspraken (Google Calendar, alleen-lezen)**
Werkafspraken en al het andere dat al in je Google-agenda staat. Zie §3.

**B. Nieuwe lokale planningsblokken**
Voor de dingen die je zelf wilt inplannen maar die nog geen eigen tracking
hebben: ontspanning, sport/bewegen, sociale tijd met je partner. Dit is
**nieuwe opslag** (`agenda_blokken`, lokaal + gesynchroniseerd zoals de rest
van de app) — een blok heeft een titel, type (ontspanning/sport/sociaal/
overig), datum, start-/eindtijd, en optioneel "herhaalt wekelijks". Puur
zelf aangemaakt, niets automatisch — de Agenda dwingt niets af, het geeft
je alleen de plek om het bewust in te plannen.

**C. Afgeleide signalen uit bestaande modules (hergebruik, geen nieuwe opslag)**
Zelfde principe als de kruismodule-signalenlaag (`docs/SIGNALEN.md`) — pure
functies die bestaande data aflezen, niets nieuws bewaren:
- Cardio/Training: `bepaalWeekoverzicht()` bestaat al (`lib/dagstructuur/
  weekoverzicht.js`) — liftdagen/aanbevolen cardiodagen, kant-en-klaar
  herbruikbaar voor de week-/maandweergave.
- Huishouden: welke terugkerende klussen deze week/maand nog open staan,
  en welke Project-klusjes in de huidige maand gepland staan (uit de net
  gebouwde Projecten-verdeling).
- Welzijn: eerstvolgende burn-out/herstel-check-datum (`volgendeCheckDatum()`,
  bestaat al).
- Werk: welke dagen ingesteld staan als werkdag (uit Werk-instellingen).

## 3. Google Calendar — alleen lezen

**Bevestigd**: alleen-lezen import, geen terugschrijven naar Google.

### Wat dit technisch betekent
- OAuth 2.0 via Google Identity Services (GIS), scope
  `https://www.googleapis.com/auth/calendar.readonly` — geen bredere
  toegang dan nodig.
- Geen backend nodig voor de basisversie: GIS's token-client geeft een
  kortlevend access-token (~1 uur) rechtstreeks in de browser. Voor een app
  die je een paar keer per dag opent is dat prima — de eerste keer per
  sessie (of na verloop van een uur) vraagt de app opnieuw om toestemming
  via een Google-popup, net als "inloggen met Google" ergens anders.

### Wat je zelf moet doen (kan ik niet voor je automatiseren)
1. Een Google Cloud-project aanmaken op [console.cloud.google.com](https://console.cloud.google.com).
2. De **Google Calendar API** inschakelen voor dat project.
3. Een **OAuth-clientID** aanmaken (type "Web application"), met als
   *Authorized JavaScript origin* het adres waar LifeCore op draait (je
   Vercel-domein, en `http://localhost:5173` voor lokaal testen).
4. Het OAuth-*consentscherm* minimaal invullen (naam, contact-e-mail) —
   voor persoonlijk gebruik blijft de app in "Testing"-status, wat prima is
   zolang alleen jouw eigen Google-account de app gebruikt (tot 100
   testgebruikers toegestaan zonder Google-review).
5. De gegenereerde Client ID aan mij doorgeven (of zelf in een nieuwe
   `VITE_GOOGLE_CLIENT_ID`-omgevingsvariabele zetten, zelfde patroon als de
   bestaande Supabase-env-vars).

### Latere uitbreiding (niet nu, wel het overwegen waard)
Kortlevende tokens betekenen: elke sessie (of na een uur) opnieuw een
Google-popup. Dat is een bewuste, eenvoudige eerste keus. Mocht dat als
storend ervaren worden, is de volgende stap een **Supabase Edge Function**
die de OAuth *authorization code*-flow afhandelt en een langlevend
refresh-token server-side bewaart — meer bouwwerk, maar dan hoef je nooit
opnieuw in te loggen. Dit is een losse, latere beslissing, geen blokkade
voor de eerste versie.

## 4. Weergave: maand / week / dag

Geen externe kalender-UI-library (past niet bij de rest van de app — zie
`docs/ARCHITECTURE.md`'s principe van lichte, zelfgebouwde componenten in
plaats van zware dependencies zoals bij de grafieken). Een lichte,
agenda-lijst-stijl in plaats van een volledig uur-voor-uur rooster (past
beter bij het soort inhoud — afspraken en blokken, geen minuten-precieze
planning):

- **Maandweergave**: een grid van dagen (zoals de bestaande "Deze week"-
  widget, maar dan een volle maand) — per dag een puntje per bron (Google-
  afspraak, planningsblok, huishoud-klus, liftdag) i.p.v. volledige tekst,
  tikken op een dag springt naar de dagweergave.
- **Weekweergave**: 7 dagen onder elkaar, elk met een korte lijst van wat
  die dag relevant is — vergelijkbaar met de bestaande "Deze week"-widget,
  maar met alle drie de bronnen samengevoegd i.p.v. alleen lift/cardio.
- **Dagweergave**: chronologische lijst voor één dag — Google-afspraken met
  tijdstip, planningsblokken met tijdstip, en de niet-tijdgebonden signalen
  (welzijn-check, huishoud-klussen) onderaan als "vandaag ook relevant".

## 5. Het kernprobleem: voorkomen dat je het vergeet

Een agenda die je alleen ziet als je 'm zelf opent, lost hyperfocus-
vergeetachtigheid maar deels op. Twee opties, geen van beide al gekozen:

**A. Prominent bij het openen van de app** (geen extra complexiteit)
Het startscherm (`SnelkeuzeScherm`) toont vandaag's agenda-samenvatting
bovenaan, zodat je het sowieso ziet zodra je de app opent voor iets anders
— vergelijkbaar met hoe "Deze week" nu al bovenaan staat.

**B. Push-notificaties** (aanzienlijk meer bouwwerk)
Een échte herinnering die afgaat zonder dat je de app hoeft te openen,
vereist Web Push: een service-worker-uitbreiding, VAPID-sleutels, expliciete
notificatie-toestemming van de gebruiker, en (voor betrouwbare aflevering
op Android) een always-on stukje infrastructuur dat op het juiste moment
pusht — dat laatste past niet in de huidige puur-client-side/geen-
backend-behalve-Supabase-architectuur zonder een nieuwe achtergrond-taak
(bv. een Supabase Edge Function op een cron-schema).

**Aanbeveling**: optie A eerst (past in de bestaande architectuur, geen
nieuwe permissies/infrastructuur), optie B als bewuste vervolgstap als A
in de praktijk niet genoeg blijkt.

## 6. Wat dit niet is

- Geen tweewegsync met Google — wijzigingen in LifeCore komen nooit in
  Google Calendar terecht.
- Geen vervanging van Werk/Cardio/Huishouden's eigen instellingen — de
  Agenda leest ze uit, wijzigt ze niet.
- Geen taken-uitvoering vanuit de Agenda zelf (geen "vink hier een
  huishoud-klus af" direct in de dagweergave in v1) — tikken op een
  huishoud-signaal in de Agenda linkt door naar de Huishouden-module zelf,
  waar het al afvinkbaar is. Voorkomt dubbele afvink-logica op twee plekken.

## 7. Openstaande vraag vóór bouw

Eén ding is nog niet expliciet gevraagd en bepaalt hoeveel v1 kan doen
zonder op jou te wachten: **ga je de Google Cloud-stappen uit §3 zelf
zetten, en zo ja — wil je eerst de rest van de Agenda (lokale
planningsblokken + maand/week/dag-weergave + bestaande-module-signalen)
zonder Google-koppeling, en Google er later bij, of in één keer?**
Bouwen zonder Google is een kleinere, onafhankelijke eerste stap die niet
op jouw Cloud Console-setup hoeft te wachten.
