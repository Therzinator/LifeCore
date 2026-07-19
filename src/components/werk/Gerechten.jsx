import { useState } from 'react';
import { CURATED_GERECHTEN } from '../../lib/boodschappen/curatedeGerechten.js';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import './HuishoudTaken.css';
import './HuishoudProjecten.css';

const CATEGORIEEN = [
  { key: 'ingredienten', label: 'Ingrediënten' },
  { key: 'optioneel', label: 'Optioneel' },
  { key: 'kruiden', label: 'Kruiden' },
];

function NieuwGerechtForm({ onOpslaan, onAnnuleren }) {
  const [naam, setNaam] = useState('');
  const [bereiding, setBereiding] = useState('');
  const [ingredienten, setIngredienten] = useState('');
  const [optioneel, setOptioneel] = useState('');
  const [kruiden, setKruiden] = useState('');

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
// useBoodschappen()-instantie van ThuisPagina — bewust als prop meegegeven
// i.p.v. hier een eigen instantie aan te maken: twee losse instanties voor
// hetzelfde huishouden botsen op hetzelfde Supabase Realtime-kanaal (zie
// AgendaPagina-geschiedenis).
export default function Gerechten({ gerechten, boodschappen, toonToast }) {
  const [uitgeklapt, setUitgeklapt] = useState(null);
  const [toonForm, setToonForm] = useState(false);

  const alleGerechten = [
    ...CURATED_GERECHTEN.map((g) => ({ ...g, curated: true })),
    ...gerechten.gerechten.map((g) => ({ ...g, curated: false })),
  ];

  function opslaan(gerecht) {
    gerechten.maakGerecht(gerecht);
    setToonForm(false);
    toonToast(`Gerecht "${gerecht.naam}" opgeslagen`, 'ok');
  }

  function wissel(id) {
    setUitgeklapt((huidig) => (huidig === id ? null : id));
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Gerechten</div>
      <p className="of-stap-tekst">
        Kies een gerecht en voeg de ingrediënten selectief toe aan je boodschappenlijst — per categorie in
        één keer, of los per item.
      </p>

      <div className="hh-lijst">
        {alleGerechten.map((g) => (
          <div key={g.id}>
            <div className="hh-item">
              <span className="hh-tekst" style={{ cursor: 'pointer' }} onClick={() => wissel(g.id)}>
                {g.naam}
                {g.curated && <span className="hhp-werk-badge"> · bibliotheek</span>}
              </span>
              <button type="button" className="hhp-stappen-toggle" onClick={() => wissel(g.id)} aria-label="Details tonen of verbergen">
                {uitgeklapt === g.id ? '▲' : '▼'}
              </button>
              {!g.curated && (
                <button
                  className="hh-verwijder"
                  onClick={() => { if (window.confirm(`Gerecht "${g.naam}" verwijderen?`)) gerechten.verwijderGerecht(g.id); }}
                >✕</button>
              )}
            </div>
            {uitgeklapt === g.id && <GerechtDetails gerecht={g} boodschappen={boodschappen} toonToast={toonToast} />}
          </div>
        ))}
      </div>

      {toonForm ? (
        <div className="card" style={{ marginTop: 'var(--space-sm)' }}>
          <NieuwGerechtForm onOpslaan={opslaan} onAnnuleren={() => setToonForm(false)} />
        </div>
      ) : (
        <button className="btn btn-g btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={() => setToonForm(true)}>+ Nieuw gerecht</button>
      )}
    </div>
  );
}
