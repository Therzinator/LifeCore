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
import { groepeerOpAfdeling, AFDELINGEN } from '../../lib/boodschappen/categorieDetectie.js';
import SpraakInvoer from '../werk/SpraakInvoer.jsx';
import BewerkbareTekst from '../ui/BewerkbareTekst.jsx';
import '../werk/HuishoudTaken.css';
import './Boodschappen.css';

// Eén regel van de boodschappenlijst — los getrokken zodat 'm zowel binnen
// een afdelingsgroep als (voor 'laatst gekocht', dat niet gegroepeerd is)
// los gebruikt kan worden.
// categorie: de huidige effectieve afdeling (override, of anders de
// trefwoord-detectie) — meegegeven vanuit de groepering in Boodschappen
// zodat hier niet opnieuw bepaald hoeft te worden welke afdeling actief is.
function BoodschapItem({ item, boodschappen, categorie }) {
  return (
    <div className="hh-item bd-item">
      <button className="hh-check" onClick={() => boodschappen.toggleGekocht(item.id)} aria-label="Markeer als gekocht" title="Gekocht" />
      <span className="hh-tekst">
        <BewerkbareTekst waarde={item.tekst} onWijzig={(t) => boodschappen.hernoemItem(item.id, t)} label="Naam" />
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

  const actief = boodschappen.items.filter((i) => i.opLijst);
  const afdelingen = groepeerOpAfdeling(actief, 'tekst', boodschappen.categorieOverrides);
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
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Boodschappen</div>
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
        {afdelingen.map(({ afdeling, items }) => (
          <div key={afdeling} style={{ marginBottom: 'var(--space-sm)' }}>
            <label className="ti-lbl">{afdeling}</label>
            <div className="hh-lijst">
              {items.map((i) => <BoodschapItem key={i.id} item={i} boodschappen={boodschappen} categorie={afdeling} />)}
            </div>
          </div>
        ))}
      </div>

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
