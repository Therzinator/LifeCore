# LifeCore — Kruismodule-signalenlaag

Ontwerpdocument, geschreven vóórafgaand aan de bouw van Module 3 (Welzijn:
burn-out/herstel-check), op expliciet verzoek: LifeCore's overkoepelende
doel is structuur en reïntegratie, en de modules moeten daarvoor met elkaar
in verbinding staan — niet naast elkaar bestaan als losse eilanden.

## Het probleem

Elke module (`components/<feature>/`) heeft nu zijn eigen `lib/`-logica,
eigen hook, eigen `localStorage`-sleutel — volledig ontkoppeld van de
andere modules. Dat is een bewuste, goede keuze voor primaire data (zie
`docs/ARCHITECTURE.md`), maar betekent dat een patroon dat in module A
zichtbaar wordt (bijv. een dalende hersteltrend in Welzijn) nergens anders
in de app meeweegt, terwijl dat inhoudelijk wel zou moeten — dat is precies
de reden dat de werkgrenzen-module al langer bestaat: reïntegratie vraagt
om het hele beeld, niet om geïsoleerde metingen.

## Architectuurkeuze: een lichte signalenlaag, geen event-bus

Twee uitersten, en waarom ik voor het midden kies:

**A. Rechtstreekse koppeling per stuk** (module B leest module A's hook
direct in). Bestaat al op kleine schaal — `StapActivering.jsx` en
`AdhdDashboard.jsx` lezen allebei rechtstreeks `dagdata.dag.checkin?.energie`
uit de ochtend-module. Simpel, maar schaalt slecht: bij 5+ koppelingen wordt
onzichtbaar wat waar vandaan komt, en elke koppeling vraagt wijzigingen in
zowel bron als doel.

**B. Volwaardige signalen-bus** (elke module publiceert events, andere
modules abonneren zich). Geeft overzicht en ontkoppeling, maar is
architectuur die dit project nergens anders gebruikt — geen Context, geen
event-emitter, alles is nu pure functies + hooks. Voor een single-user
lokale app met naar schatting 5-8 koppelingen is dat over-engineering.

**Gekozen: optie A's eenvoud, optie B's overzicht.** Eén centrale, pure
module (`src/lib/signalen/kruisverbanden.js`) die de bestaande
geschiedenis-hooks van meerdere modules als input neemt en een platte lijst
actieve signalen teruggeeft. Geen event-bus, geen registratie-mechanisme —
gewoon expliciete, leesbare `if`/`then`-functies op dezelfde manier als
`dagLimiet.js` dat nu al doet voor energie → daglimiet. Het verschil met
optie A is puur dát het op één centrale, makkelijk te auditen plek staat
in plaats van verspreid over consumer-componenten.

Signalen zijn **afgeleid, niet opgeslagen** — ze worden bij elke render
opnieuw berekend uit de bestaande, al-gesynchroniseerde brondata (net als
`dagLimiet()`). Geen nieuwe `localStorage`-sleutel, geen sync-vraagstuk,
geen achtergrond-taak of cron: puur client-side, alleen actief wanneer een
consumer-module daadwerkelijk open is.

## Structuur

```
src/lib/signalen/
  kruisverbanden.js   — pure functies, één per koppeling, plus bepaalSignalen()
                         die alle geschiedenissen samenvoegt tot één lijst
src/hooks/
  useKruisSignalen.js — dunne hook: roept de relevante geschiedenis-hooks
                         aan, voedt kruisverbanden.js, respecteert de
                         per-koppeling aan/uit-instelling (zie hieronder)
```

Elke `Signaal`-vorm: `{ id, bron, doel, ernst: 'aandacht'|'info', tekst, actie? }`
— `bron`/`doel` zijn module-id's (dezelfde als `MODULE_VOLGORDE` in
`lib/nav/modules.js`), zodat een consumer eenvoudig filtert op
`signalen.filter(s => s.doel === 'mindfulness')`.

## Concrete koppelingen (v1)

| # | Bron | Conditie | Doel | Effect | Instelling (in doel-module) |
|---|------|----------|------|--------|------------------------------|
| 1 | Welzijn | Signaal A of B actief (zie Module 3) | Mindfulness | Zachte suggestiekaart boven de oefeningenlijst: "Je hersteltrend vraagt aandacht — een korte ademoefening kan helpen", linkt direct naar Ademmeditatie | "Toon suggesties vanuit de welzijnscheck" |
| 2 | Welzijn | Signaal A of B actief | Waarden (ACT) | Zelfde soort suggestiekaart, linkt naar Defusie-oefening | "Toon suggesties vanuit de welzijnscheck" |
| 3 | Welzijn | Signaal A (aanhoudend hoge uitputting) actief | Focus/ADHD | Daglimiet (`dagLimiet.js`) krijgt een extra verlagingsfactor, exact zoals nu al gebeurt bij lage ochtend-energie — geen nieuw mechanisme, hergebruik van bestaande logica | "Pas daglimiet aan bij aanhoudende uitputting" |
| 4 | Training | Laatste sessie > 3 weken geleden | Ochtend (activering) | Neutrale melding bij de plank/push-up-stap: "Het is een tijd geleden sinds je laatste training — vandaag hoeft niet zwaar te zijn", geen schuldframing | "Toon trainingsherinnering in ochtendroutine" |
| 5 | Werk | Ongebruikelijk veel afgeronde taken/overuren deze week | Welzijn | Geen geforceerde vervroeging — toont alleen: "Het is nog N dagen tot je volgende check, maar gezien een drukke week kun je 'm ook nu al doen", drempel is puur zichtbaarheid, nooit een blokkade | "Toon vroege-check-suggestie" |

Elke koppeling staat op zichzelf: signaal 3 kan aan staan terwijl 1 en 2 uit
staan, etc. Drempelwaarden voor koppeling 3-5 volgen dezelfde
onderbouwings-eis als Module 3 zelf (geen ronde getallen zonder reden) —
koppeling 4's "3 weken" sluit aan bij de bestaande cadans-logica van
Training (een trainingsschema gaat uit van 2-3x/week; 3 weken zonder sessie
is drie gemiste cycli, niet één gemiste dag), koppeling 3 hergebruikt
letterlijk de bestaande energie-gebaseerde reductiefactor uit
`dagLimiet.js` in plaats van een nieuw getal te verzinnen.

## Guilt-free: per koppeling uit te zetten

Geen centrale "alle suggesties uit"-schakelaar (te grofmazig) en geen
losse nieuwe instellingenpagina (dat hebben we recent juist afgebouwd ten
gunste van instellingen-per-module). In plaats daarvan: elke koppeling
krijgt een eigen toggle in de instellingen van de **doel**-module (waar je
de suggestie ook daadwerkelijk ziet) — bijvoorbeeld Mindfulness'
instellingen-tab krijgt naast de geluidskiezer een "Toon suggesties vanuit
de welzijnscheck"-schakelaar. Standaard aan, één tik om uit te zetten,
geen rechtvaardiging nodig. Dit is dezelfde plek waar je 'm tegenkomt, dus
geen losse "kruisverbanden-instellingen"-pagina die niemand vindt.

## Wat dit niet is

- Geen notificaties/achtergrond-polling — een signaal wordt alleen zichtbaar
  wanneer je de doel-module daadwerkelijk opent.
- Geen server-side logica — alles client-side, puur afgeleid uit al
  gesynchroniseerde data.
- Geen dwingende acties — elke koppeling is een suggestie of een subtiele
  aanpassing (daglimiet), nooit een blokkade of verplichting.

## Vervolg

Module 3 (Welzijn) implementeert zelf Signaal A en B (zie apart ontwerp).
Zodra dat er is, is koppeling 1-3 hierboven triviaal: `useKruisSignalen()`
roept simpelweg `useVragenlijstGeschiedenis('welzijn_check').afnames` aan en
geeft het resultaat van Module 3's eigen `bepaalSignalen()` door. Koppeling
4 en 5 kunnen na Module 3 in een aparte, kleine vervolgstap.
