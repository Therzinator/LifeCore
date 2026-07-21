import { useRef, useState } from 'react';
import { CURATED_GERECHTEN } from '../../lib/boodschappen/curatedeGerechten.js';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { verwerkFoto } from '../../lib/werk/fotoVoorbewerking.js';
import { sbClient } from '../../lib/supabase/client.js';
import SpraakInvoer from '../werk/SpraakInvoer.jsx';
import '../werk/HuishoudTaken.css';
import '../werk/HuishoudProjecten.css';

const CATEGORIEEN = [
  { key: 'ingredienten', label: 'Ingrediënten' },
  { key: 'optioneel', label: 'Optioneel' },
  { key: 'kruiden', label: 'Kruiden' },
];

// Herkent alleen data-URL's ('data:image/jpeg;base64,xxx') — het resultaat
// van verwerkFoto() als blob-URL via FileReader.readAsDataURL ingelezen.
function bestandNaarBase64(bestand) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Kon foto niet lezen'));
    reader.readAsDataURL(bestand);
  });
}

// initieel (optioneel): voorgevulde waarden vanuit de foto-naar-recept-flow
// (zie fotoNaarRecept in Gerechten) — arrays worden terug naar tekstregels
// omgezet, dezelfde vorm die parseSpraakTekst bij opslaan weer verwacht.
function NieuwGerechtForm({ onOpslaan, onAnnuleren, initieel }) {
  const [naam, setNaam] = useState(initieel?.naam ?? '');
  const [bereiding, setBereiding] = useState(initieel?.bereiding ?? '');
  const [ingredienten, setIngredienten] = useState((initieel?.ingredienten ?? []).join('\n'));
  const [optioneel, setOptioneel] = useState((initieel?.optioneel ?? []).join('\n'));
  const [kruiden, setKruiden] = useState((initieel?.kruiden ?? []).join('\n'));

  function submit(e) {
    e.preventDefault();
    const ingredientenLijst = parseSpraakTekst(ingredienten);
    if (!naam.trim() || ingredientenLijst.length === 0) return;
    onOpslaan({
      naam: naam.trim(),
      bereiding: bereiding.trim(),
      ingredienten: ingredientenLijst,
      optioneel: parseSpraakTekst(optioneel),
      kruiden: parseSpraakTekst(kruiden),
    });
  }

  return (
    <form className="hhp-form" onSubmit={submit}>
      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="ger-naam">Naam van het gerecht</label>
        <input id="ger-naam" className="ti-veld" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="bijv. Kip wraps" />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="ger-bereiding">Korte bereidingswijze (optioneel)</label>
        <textarea
          id="ger-bereiding"
          className="ti-veld"
          rows={3}
          value={bereiding}
          onChange={(e) => setBereiding(e.target.value)}
          placeholder="bijv. Kipfilet bakken, groenten roerbakken, alles vullen in de wraps..."
        />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl">Ingrediënten (één per regel, komma of &quot;en&quot;)</label>
        <SpraakInvoer waarde={ingredienten} onWaarde={setIngredienten} placeholder="bijv. kipfilet 300gr, paprika, rode ui..." />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl">Optioneel</label>
        <SpraakInvoer waarde={optioneel} onWaarde={setOptioneel} placeholder="bijv. avocado, verse sla..." />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl">Kruiden</label>
        <SpraakInvoer waarde={kruiden} onWaarde={setKruiden} placeholder="bijv. kipkruiden, peper, komijn..." />
      </div>
      <div className="of-acties">
        <button type="button" className="btn btn-text" onClick={onAnnuleren}>Annuleren</button>
        <button type="submit" className="btn btn-p btn-full">Gerecht opslaan</button>
      </div>
    </form>
  );
}

// Samenvatting van een gerecht — per categorie een 'hele categorie
// toevoegen'-knop, én losse selectievinkjes per item (zoals gevraagd: geen
// alles-of-niets). De selectie wordt na het toevoegen weer geleegd.
function GerechtDetails({ gerecht, boodschappen, toonToast }) {
  const [selectie, setSelectie] = useState(() => new Set());
  const [toonBereiding, setToonBereiding] = useState(false);

  function sleutel(categorie, tekst) {
    return `${categorie}:${tekst}`;
  }

  function toggleItem(categorie, tekst) {
    setSelectie((huidig) => {
      const nieuw = new Set(huidig);
      const key = sleutel(categorie, tekst);
      if (nieuw.has(key)) nieuw.delete(key); else nieuw.add(key);
      return nieuw;
    });
  }

  function voegToeAanLijst(teksten) {
    if (teksten.length === 0) return;
    teksten.forEach((tekst) => boodschappen.voegToe(tekst, 'week'));
    toonToast(`${teksten.length} item(s) toegevoegd aan de boodschappenlijst`, 'ok');
  }

  function voegSelectieToe() {
    voegToeAanLijst([...selectie].map((key) => key.split(':').slice(1).join(':')));
    setSelectie(new Set());
  }

  return (
    <div className="hhp-details">
      {gerecht.bereiding && (
        <div style={{ marginBottom: 'var(--space-sm)' }}>
          <button
            type="button"
            className="bd-inklap-knop"
            onClick={() => setToonBereiding((v) => !v)}
          >
            <span className="ti-lbl" style={{ marginBottom: 0 }}>🍳 Bereiding</span>
            <span aria-hidden="true">{toonBereiding ? '▲' : '▼'}</span>
          </button>
          {toonBereiding && <p className="of-stap-tekst" style={{ marginTop: 'var(--space-xs)' }}>{gerecht.bereiding}</p>}
        </div>
      )}
      {CATEGORIEEN.map(({ key, label }) => {
        const items = gerecht[key] ?? [];
        if (items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 'var(--space-sm)' }}>
            <div className="ti-rij" style={{ alignItems: 'center' }}>
              <label className="ti-lbl" style={{ flex: 1, marginBottom: 0 }}>{label}</label>
              <button type="button" className="btn btn-g btn-sm" onClick={() => voegToeAanLijst(items)}>+ Hele categorie</button>
            </div>
            <div className="hh-lijst">
              {items.map((tekst) => (
                <div className="hh-item" key={tekst}>
                  <button
                    type="button"
                    className={`hh-check ${selectie.has(sleutel(key, tekst)) ? 'gedaan' : ''}`}
                    onClick={() => toggleItem(key, tekst)}
                  >{selectie.has(sleutel(key, tekst)) ? '✓' : ''}</button>
                  <span className="hh-tekst">{tekst}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {selectie.size > 0 && (
        <button type="button" className="btn btn-p btn-full" onClick={voegSelectieToe}>+ Selectie toevoegen ({selectie.size})</button>
      )}
    </div>
  );
}

// gerechten = useGerechten()-hook, boodschappen = de BESTAANDE
// useBoodschappen()-instantie van ShoppingPagina — bewust als prop meegegeven
// i.p.v. hier een eigen instantie aan te maken: twee losse instanties voor
// hetzelfde huishouden botsen op hetzelfde Supabase Realtime-kanaal (zie
// AgendaPagina-geschiedenis).
// Eén gerecht-rij + inklapbare details — gedeeld tussen de bibliotheek- en
// de eigen-recepten-sectie, alleen de verwijderknop verschilt (curated
// gerechten zijn read-only, eigen recepten niet).
function GerechtRij({ gerecht, uitgeklapt, onWissel, onVerwijder, boodschappen, toonToast }) {
  return (
    <div>
      <div className="hh-item">
        <span className="hh-tekst" style={{ cursor: 'pointer' }} onClick={() => onWissel(gerecht.id)}>
          {gerecht.naam}
        </span>
        <button type="button" className="hhp-stappen-toggle" onClick={() => onWissel(gerecht.id)} aria-label="Details tonen of verbergen">
          {uitgeklapt ? '▲' : '▼'}
        </button>
        {onVerwijder && (
          <button
            className="hh-verwijder"
            onClick={() => { if (window.confirm(`Gerecht "${gerecht.naam}" verwijderen?`)) onVerwijder(gerecht.id); }}
          >✕</button>
        )}
      </div>
      {uitgeklapt && <GerechtDetails gerecht={gerecht} boodschappen={boodschappen} toonToast={toonToast} />}
    </div>
  );
}

export default function Gerechten({ gerechten, boodschappen, toonToast }) {
  const [uitgeklapt, setUitgeklapt] = useState(null);
  const [toonForm, setToonForm] = useState(false);
  const [voorgevuld, setVoorgevuld] = useState(null);
  const [fotoBezig, setFotoBezig] = useState(false);
  const fotoInputRef = useRef(null);

  function opslaan(gerecht) {
    gerechten.maakGerecht(gerecht);
    setToonForm(false);
    setVoorgevuld(null);
    toonToast(`Gerecht "${gerecht.naam}" opgeslagen`, 'ok');
  }

  function annuleerForm() {
    setToonForm(false);
    setVoorgevuld(null);
  }

  function wissel(id) {
    setUitgeklapt((huidig) => (huidig === id ? null : id));
  }

  // Foto wordt alleen lokaal verwerkt (compressie + base64) en naar de
  // Edge Function gestuurd — nooit geüpload naar storage, dus na deze
  // functie is er niets meer om op te ruimen.
  async function fotoNaarRecept(e) {
    const bestand = e.target.files?.[0];
    e.target.value = '';
    if (!bestand) return;

    const sb = sbClient();
    if (!sb) { toonToast('Supabase niet geconfigureerd — foto-naar-recept werkt alleen online', 'wn'); return; }

    setFotoBezig(true);
    try {
      const verwerkt = await verwerkFoto(bestand);
      const afbeelding = await bestandNaarBase64(verwerkt);
      const { data, error } = await sb.functions.invoke('recept-uit-foto', {
        body: { afbeelding, mediaType: verwerkt.type },
      });
      if (error || data?.error) throw new Error(data?.error || error.message);

      setVoorgevuld(data);
      setToonForm(true);
      toonToast('Recept herkend — controleer en pas aan waar nodig', 'ok');
    } catch (err) {
      console.error('Kon foto niet omzetten naar recept', err);
      toonToast('Kon de foto niet verwerken', 'wn');
    } finally {
      setFotoBezig(false);
    }
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Gerechten</div>
      <p className="of-stap-tekst">
        Kies een gerecht en voeg de ingrediënten selectief toe aan je boodschappenlijst — per categorie in
        één keer, of los per item.
      </p>

      <div className="td-label">Eigen recepten</div>
      {gerechten.gerechten.length === 0 && (
        <p className="of-stap-tekst" style={{ marginBottom: 'var(--space-sm)' }}>
          Nog geen eigen recepten — voeg er hieronder een toe.
        </p>
      )}
      <div className="hh-lijst" style={{ marginBottom: 'var(--space-md)' }}>
        {gerechten.gerechten.map((g) => (
          <GerechtRij
            key={g.id}
            gerecht={g}
            uitgeklapt={uitgeklapt === g.id}
            onWissel={wissel}
            onVerwijder={gerechten.verwijderGerecht}
            boodschappen={boodschappen}
            toonToast={toonToast}
          />
        ))}
      </div>

      <div className="td-label">Bibliotheek</div>
      <div className="hh-lijst">
        {CURATED_GERECHTEN.map((g) => (
          <GerechtRij
            key={g.id}
            gerecht={g}
            uitgeklapt={uitgeklapt === g.id}
            onWissel={wissel}
            onVerwijder={null}
            boodschappen={boodschappen}
            toonToast={toonToast}
          />
        ))}
      </div>

      {toonForm ? (
        <div className="card" style={{ marginTop: 'var(--space-sm)' }}>
          {voorgevuld && <p className="ti-hint">Herkend uit de foto — controleer en pas aan voor je opslaat.</p>}
          <NieuwGerechtForm onOpslaan={opslaan} onAnnuleren={annuleerForm} initieel={voorgevuld} />
        </div>
      ) : (
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <button className="btn btn-g btn-full" onClick={() => setToonForm(true)}>+ Nieuw gerecht</button>
          <button
            type="button"
            className="btn btn-g btn-full"
            disabled={fotoBezig}
            onClick={() => fotoInputRef.current?.click()}
          >
            {fotoBezig ? 'Foto verwerken...' : '📷 Foto van recept'}
          </button>
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={fotoNaarRecept}
          />
        </div>
      )}
    </div>
  );
}
