import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { relatieveTijd } from '../../utils/datum.js';

// 'Laatst gekocht' toont zowel de exacte datum als de relatieve duiding — de
// gebruiker wil de exacte datum kunnen zien, relatieveTijd() alleen ('3 dagen
// geleden') liet dat weg.
function exacteDatum(isoDatum) {
  return new Date(isoDatum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}
import { detecteerFavorieten, detecteerPopulair } from '../../lib/werk/boodschappenLeren.js';
import { groepeerOpAfdeling, bepaalCategorie, AFDELINGEN } from '../../lib/boodschappen/categorieDetectie.js';
import { ketenNaarSlug, slugNaarNaam } from '../../lib/boodschappen/supermarktKetens.js';
import { groepeerPerSupermarkt, verdeelVoorSortering } from '../../lib/boodschappen/aanbiedingSamenvatting.js';
import { checkAanbiedingen } from '../../lib/supabase/aanbiedingCheck.js';
import SpraakInvoer from '../werk/SpraakInvoer.jsx';
import BewerkbareTekst from '../ui/BewerkbareTekst.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import BoodschappenInstellingen from './BoodschappenInstellingen.jsx';
import '../werk/HuishoudTaken.css';
import './Boodschappen.css';

// Eén regel van de boodschappenlijst — los getrokken zodat 'm zowel binnen
// een afdelingsgroep als (voor 'laatst gekocht', dat niet gegroepeerd is)
// los gebruikt kan worden.
// categorie: de huidige effectieve afdeling (override, of anders de
// trefwoord-detectie) — meegegeven vanuit de groepering in Boodschappen
// zodat hier niet opnieuw bepaald hoeft te worden welke afdeling actief is.
// aanbieding: de beste gevonden kandidaat voor dit item (of undefined) —
// resultaat van de handmatige 'Aanbiedingen checken'-actie in Boodschappen,
// hier alleen weergegeven, niet zelf opgehaald.
function BoodschapItem({ item, boodschappen, categorie, aanbieding }) {
  return (
    <div className="hh-item bd-item">
      <button className="hh-check" onClick={() => boodschappen.toggleGekocht(item.id)} aria-label="Markeer als gekocht" title="Gekocht" />
      <span className="hh-tekst">
        <BewerkbareTekst waarde={item.tekst} onWijzig={(t) => boodschappen.hernoemItem(item.id, t)} label="Naam" />
        {aanbieding && (
          <span className="bd-aanbieding-badge" title={aanbieding.naam}>
            🏷️ {aanbieding.promotieTekst ? `${aanbieding.promotieTekst} — ` : ''}€{aanbieding.prijs.toFixed(2)} bij {slugNaarNaam(aanbieding.retailer)}
            {aanbieding.voordeel > 0 && ` (−€${aanbieding.voordeel.toFixed(2)})`}
          </span>
        )}
      </span>
      <select
        className="bd-categorie-select"
        value={categorie}
        onChange={(e) => boodschappen.zetCategorie(item.tekst, e.target.value)}
        aria-label={`Supermarktafdeling voor ${item.tekst}`}
        title="Supermarktafdeling aanpassen"
      >
        {AFDELINGEN.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {boodschappen.ketens.length > 0 && (
        <select
          className="bd-categorie-select"
          value={item.voorkeurSupermarkt ?? ''}
          onChange={(e) => boodschappen.zetVoorkeurSupermarkt(item.id, e.target.value || null)}
          aria-label={`Voorkeur-supermarkt voor ${item.tekst}`}
          title="Voorkeur-supermarkt (bv. vanwege een aanbieding of kwaliteit)"
        >
          <option value="">Geen voorkeur</option>
          {boodschappen.ketens.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      )}
      <div className="bd-aantal-ctrl">
        <button className="wt-mini-btn" onClick={() => boodschappen.zetAantal(item.id, item.aantal - 1)}>−</button>
        <span className="bd-aantal-val">{item.aantal}</span>
        <button className="wt-mini-btn" onClick={() => boodschappen.zetAantal(item.id, item.aantal + 1)}>+</button>
      </div>
      <button
        className="hh-verwijder"
        onClick={() => { if (window.confirm(`"${item.tekst}" verwijderen van de boodschappenlijst?`)) boodschappen.verwijder(item.id); }}
      >✕</button>
    </div>
  );
}

export default function Boodschappen({ boodschappen, toonToast }) {
  const [invoer, setInvoer] = useState('');
  const [toonLaatstGekocht, setToonLaatstGekocht] = useState(false);
  const [aanbiedingen, setAanbiedingen] = useState({}); // { [itemId]: kandidaten[] }
  const [aanbiedingenBezig, setAanbiedingenBezig] = useState(false);
  const [weergave, setWeergave] = useState('afdeling'); // 'afdeling' | 'aanbieding'

  const actief = boodschappen.items.filter((i) => i.opLijst);
  const afdelingen = groepeerOpAfdeling(actief, 'tekst', boodschappen.categorieOverrides);
  const supermarktSamenvatting = groepeerPerSupermarkt(actief, aanbiedingen);
  const supermarktVerdeling = verdeelVoorSortering(actief, aanbiedingen);

  // Handmatige actie (geen automatische achtergrond-check) — vraagt de
  // PrijsProfeet-Edge Function per boodschap de actuele aanbiedingen op.
  // Best-effort matching: de zoekopdracht is kale tekst, geen EAN-matching
  // (die zit in het Pro-plan), dus niet elk resultaat is per se relevant —
  // vandaar dat dit alleen als suggestie getoond wordt, niet automatisch aan
  // de lijst zelf toegevoegd.
  async function aanbiedingenChecken() {
    if (actief.length === 0) { toonToast('Niets op de lijst om te checken', 'wn'); return; }
    setAanbiedingenBezig(true);
    const ketenSlugs = boodschappen.ketens.map(ketenNaarSlug).filter(Boolean);
    const resultaat = await checkAanbiedingen(actief.map((i) => ({ id: i.id, tekst: i.tekst })), ketenSlugs);
    setAanbiedingenBezig(false);
    if (!resultaat) { toonToast('Kon aanbiedingen niet ophalen — alleen online beschikbaar', 'wn'); return; }
    setAanbiedingen(resultaat);
    const aantalGevonden = Object.values(resultaat).filter((k) => k.length > 0).length;
    toonToast(aantalGevonden > 0 ? `${aantalGevonden} aanbieding(en) gevonden` : 'Geen actuele aanbiedingen gevonden voor deze lijst', aantalGevonden > 0 ? 'ok' : 'neu');
    return aantalGevonden > 0;
  }

  // 'Sorteren op aanbieding' hergebruikt de aanbiedingenChecken-actie als er
  // nog niets opgehaald is (i.p.v. een lege verdeling te tonen) — zo hoeft de
  // gebruiker niet eerst zelf op 'Aanbiedingen checken' te klikken. Nogmaals
  // klikken schakelt terug naar de normale afdelingen-weergave.
  async function sorteerOpAanbieding() {
    if (weergave === 'aanbieding') { setWeergave('afdeling'); return; }
    if (actief.length === 0) { toonToast('Niets op de lijst om te sorteren', 'wn'); return; }
    if (Object.keys(aanbiedingen).length === 0) {
      const gevonden = await aanbiedingenChecken();
      if (!gevonden) return;
    }
    setWeergave('aanbieding');
  }
  const laatstGekocht = boodschappen.items
    .filter((i) => !i.opLijst && i.laatstGekochtOp)
    .sort((a, b) => new Date(b.laatstGekochtOp) - new Date(a.laatstGekochtOp));
  const favorieten = detecteerFavorieten(boodschappen.beurten);
  const populair = detecteerPopulair(boodschappen.beurten);

  function toevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen boodschappen gevonden in de tekst', 'wn'); return; }
    teksten.forEach((tekst) => boodschappen.voegToe(tekst, 'week'));
    setInvoer('');
    toonToast(`${teksten.length} item(s) toegevoegd`, 'ok');
  }

  // Favoriet toevoegen hergebruikt een bestaand item (actief laten staan, of
  // terughalen uit 'laatst gekocht') i.p.v. altijd een nieuw item aan te
  // maken — anders zou hetzelfde product als dubbel op de lijst belanden.
  function voegFavorietToe(tekst) {
    const bestaand = boodschappen.items.find((i) => i.tekst.trim().toLowerCase() === tekst.trim().toLowerCase());
    if (bestaand?.opLijst) {
      toonToast(`"${tekst}" staat al op de lijst`, 'neu');
      return;
    }
    if (bestaand) boodschappen.heractiveren(bestaand.id);
    else boodschappen.voegToe(tekst, 'week');
    toonToast(`"${tekst}" toegevoegd aan de lijst`, 'ok');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Boodschappen</div>
        <ModuleInstellingenKnop titel="Boodschappen-instellingen">
          <BoodschappenInstellingen boodschappen={boodschappen} />
        </ModuleInstellingenKnop>
      </div>
      <p className="of-stap-tekst">
        Eenmaal ingevoerd blijft een item onthouden, ook nadat je het hebt gekocht — de app leert zelf welke
        producten je wekelijks of maandelijks koopt (zie Favorieten hieronder).
      </p>

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. melk, brood, wc-papier..." />
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={toevoegen}>
          Toevoegen
        </button>
      </div>

      {(favorieten.wekelijks.length > 0 || favorieten.maandelijks.length > 0 || populair.length > 0) && (
        <div className="card">
          <div className="td-label">Favorieten (zelflerend)</div>
          <p className="ti-hint">Op basis van je koopgeschiedenis — één tik voegt het toe aan de lijst.</p>
          {favorieten.wekelijks.length > 0 && (
            <>
              <label className="ti-lbl">Wekelijks</label>
              <div className="hh-freq-rij" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                {favorieten.wekelijks.map((f) => (
                  <button key={f.tekst} type="button" className="btn btn-g btn-sm" onClick={() => voegFavorietToe(f.tekst)}>+ {f.tekst}</button>
                ))}
              </div>
            </>
          )}
          {favorieten.maandelijks.length > 0 && (
            <>
              <label className="ti-lbl">Maandelijks</label>
              <div className="hh-freq-rij" style={{ flexWrap: 'wrap', marginBottom: populair.length > 0 ? 'var(--space-sm)' : 0 }}>
                {favorieten.maandelijks.map((f) => (
                  <button key={f.tekst} type="button" className="btn btn-g btn-sm" onClick={() => voegFavorietToe(f.tekst)}>+ {f.tekst}</button>
                ))}
              </div>
            </>
          )}
          {populair.length > 0 && (
            <>
              <label className="ti-lbl">Vaak gekocht (onregelmatig)</label>
              <div className="hh-freq-rij" style={{ flexWrap: 'wrap' }}>
                {populair.map((f) => (
                  <button key={f.tekst} type="button" className="btn btn-g btn-sm" onClick={() => voegFavorietToe(f.tekst)}>+ {f.tekst}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="td-label">Boodschappenlijst ({actief.length})</div>
        {actief.length === 0 && <p className="of-stap-tekst">Niets op de lijst.</p>}
        {actief.length > 0 && (
          <div className="hh-freq-rij" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
            <button
              type="button" className="btn btn-g btn-sm"
              onClick={aanbiedingenChecken} disabled={aanbiedingenBezig}
            >
              {aanbiedingenBezig ? 'Aanbiedingen ophalen…' : '🏷️ Aanbiedingen checken'}
            </button>
            <button
              type="button" className="btn btn-g btn-sm"
              onClick={sorteerOpAanbieding} disabled={aanbiedingenBezig}
            >
              {weergave === 'aanbieding' ? '↺ Sorteren op afdeling' : '🛒 Sorteren op aanbieding'}
            </button>
          </div>
        )}
        {weergave === 'afdeling' && afdelingen.map(({ afdeling, items }) => (
          <div key={afdeling} style={{ marginBottom: 'var(--space-sm)' }}>
            <label className="ti-lbl">{afdeling}</label>
            <div className="hh-lijst">
              {items.map((i) => (
                <BoodschapItem key={i.id} item={i} boodschappen={boodschappen} categorie={afdeling} aanbieding={aanbiedingen[i.id]?.[0]} />
              ))}
            </div>
          </div>
        ))}
        {weergave === 'aanbieding' && supermarktVerdeling.map((g) => (
          <div key={g.retailerSlug ?? 'geen'} style={{ marginBottom: 'var(--space-sm)' }}>
            <label className="ti-lbl">
              {g.retailerNaam}{g.retailerSlug && ` — voordeel €${g.totaalVoordeel.toFixed(2)}`}
            </label>
            <div className="hh-lijst">
              {g.items.map((it) => {
                const item = actief.find((i) => i.id === it.itemId);
                if (!item) return null;
                return (
                  <BoodschapItem
                    key={item.id} item={item} boodschappen={boodschappen}
                    categorie={bepaalCategorie(item.tekst, boodschappen.categorieOverrides)}
                    aanbieding={aanbiedingen[item.id]?.[0]}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {supermarktSamenvatting.length > 0 && (
        <div className="card">
          <div className="td-label">Aanbiedingen per supermarkt</div>
          {supermarktSamenvatting.map((g) => (
            <div key={g.retailerSlug} style={{ marginBottom: 'var(--space-sm)' }}>
              <label className="ti-lbl">{g.retailerNaam} — voordeel €{g.totaalVoordeel.toFixed(2)}</label>
              <div className="hh-lijst">
                {g.items.map((it) => (
                  <div className="hh-item" key={it.itemId}>
                    <span className="hh-tekst">{it.boodschapTekst}</span>
                    <span className="hhp-werk-badge">€{it.prijs.toFixed(2)} (−€{it.voordeel.toFixed(2)})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <button type="button" className="bd-inklap-knop" onClick={() => setToonLaatstGekocht((v) => !v)}>
          <span className="td-label" style={{ marginBottom: 0 }}>Laatst gekocht ({laatstGekocht.length})</span>
          <span aria-hidden="true">{toonLaatstGekocht ? '▲' : '▼'}</span>
        </button>
        {toonLaatstGekocht && (
          laatstGekocht.length === 0 ? (
            <p className="of-stap-tekst" style={{ marginTop: 'var(--space-sm)' }}>Nog niets afgevinkt.</p>
          ) : (
            <div className="hh-lijst" style={{ marginTop: 'var(--space-sm)' }}>
              {laatstGekocht.map((i) => (
                <div className="hh-item" key={i.id}>
                  <span className="hh-tekst">
                    <BewerkbareTekst waarde={i.tekst} onWijzig={(t) => boodschappen.hernoemItem(i.id, t)} label="Naam" />
                    <span className="hhp-werk-badge"> · {exacteDatum(i.laatstGekochtOp)} ({relatieveTijd(i.laatstGekochtOp)})</span>
                  </span>
                  <button className="btn btn-g btn-sm" onClick={() => boodschappen.heractiveren(i.id)}>+ Weer op lijst</button>
                  <button
                    className="hh-verwijder"
                    onClick={() => { if (window.confirm(`"${i.tekst}" definitief verwijderen (ook uit laatst gekocht)?`)) boodschappen.verwijder(i.id); }}
                  >✕</button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
