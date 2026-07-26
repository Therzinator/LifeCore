import { useState } from 'react';

// Lijst met supermarktketens waar het huishouden boodschappen doet — puur
// invoer, geen vaste opties (elk huishouden shopt bij een andere combinatie
// van ketens). Gebruikt door de voorkeur-supermarkt-keuze per boodschap-item
// (zie BoodschapItem in Boodschappen.jsx).
export default function BoodschappenInstellingen({ boodschappen }) {
  const [invoer, setInvoer] = useState('');

  function toevoegen(e) {
    e.preventDefault();
    boodschappen.voegKetenToe(invoer);
    setInvoer('');
  }

  return (
    <div>
      <p className="ti-hint">
        Supermarktketens waar jullie boodschappen doen — gebruikt om per boodschap een voorkeur-supermarkt
        te kunnen kiezen (bv. omdat je de aanbieding al kent, of om kwaliteitsredenen).
      </p>
      <form className="ti-veld-grp" onSubmit={toevoegen} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
        <input
          className="ti-veld"
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          placeholder="bijv. Lidl, Albert Heijn, Dirk..."
        />
        <button type="submit" className="btn btn-p btn-sm">+ Toevoegen</button>
      </form>
      {boodschappen.ketens.length === 0 ? (
        <p className="of-stap-tekst">Nog geen supermarktketens toegevoegd.</p>
      ) : (
        <div className="hh-lijst">
          {boodschappen.ketens.map((keten) => (
            <div className="hh-item" key={keten}>
              <span className="hh-tekst">{keten}</span>
              <button
                className="hh-verwijder"
                onClick={() => { if (window.confirm(`"${keten}" verwijderen?`)) boodschappen.verwijderKeten(keten); }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
