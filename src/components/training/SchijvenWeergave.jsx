import { berekenSchijven } from '../../lib/training/schijven.js';
import './SchijvenWeergave.css';

export default function SchijvenWeergave({ totaalGewicht, stangType }) {
  const { ok, stangGewicht, schijven } = berekenSchijven(totaalGewicht, stangType);

  if (!ok) {
    return <div className="sw-waarschuwing">⚠ Dit gewicht is niet exact te maken met deze schijven.</div>;
  }

  if (schijven.length === 0) {
    return <div className="sw-leeg">Lege stang ({stangGewicht} kg)</div>;
  }

  return (
    <div className="sw-chips">
      {schijven.map((s) => (
        <span className="sw-chip" key={s.gewicht}>{s.aantal}× {s.gewicht}kg</span>
      ))}
      <span className="sw-per-kant">per kant</span>
    </div>
  );
}
