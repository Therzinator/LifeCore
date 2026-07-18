import { useState } from 'react';
import './AdhdKlusboek.css';

export default function AdhdKlusboek({ klusboek, adhdDag, toonToast }) {
  const [naam, setNaam] = useState('');
  const [minuten, setMinuten] = useState(10);

  function toevoegen(e) {
    e.preventDefault();
    const tekst = naam.trim();
    if (!tekst) return;
    klusboek.voegToe(tekst, minuten);
    setNaam('');
    setMinuten(10);
  }

  function naarVandaag(item) {
    adhdDag.voegTaakToe(item.naam);
    toonToast(`"${item.naam}" toegevoegd aan vandaag`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Klusboek</div>
      <p className="of-stap-tekst">
        Een bibliotheek van kleine, terugkerende taken. Haal er eentje naar vandaag zonder hem opnieuw te hoeven intypen.
      </p>

      <form className="card ak-form" onSubmit={toevoegen}>
        <div className="ak-form-rij">
          <input
            className="ak-veld"
            type="text"
            placeholder="Naam van de klus..."
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />
          <input
            className="ak-veld ak-veld-min"
            type="number"
            min="1"
            max="180"
            value={minuten}
            onChange={(e) => setMinuten(parseInt(e.target.value, 10) || 5)}
          />
        </div>
        <button className="btn btn-p btn-full" type="submit">Toevoegen aan klusboek</button>
      </form>

      {klusboek.items.length === 0 ? (
        <p className="of-stap-tekst">Nog leeg — voeg kleine klussen toe die vaker terugkomen.</p>
      ) : (
        <div className="ak-lijst">
          {klusboek.items.map((item) => (
            <div className="ak-item" key={item.id}>
              <div className="ak-item-info">
                <div className="ak-item-naam">{item.naam}</div>
                <div className="ak-item-min">{item.minuten} min</div>
              </div>
              <button className="btn btn-g btn-sm" onClick={() => naarVandaag(item)}>+ Vandaag</button>
              <button className="ak-verwijder" onClick={() => klusboek.verwijder(item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
