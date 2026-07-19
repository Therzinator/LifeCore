import { useEffect, useState } from 'react';
import { haalUitnodigingViaToken, accepteerUitnodiging } from '../../lib/supabase/huishoudens.js';
import '../auth/InlogScherm.css';

export default function UitnodigingAccepteren({ token, user, onKlaar }) {
  const [uitnodiging, setUitnodiging] = useState(null);
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState(null);

  useEffect(() => {
    haalUitnodigingViaToken(token).then((u) => { setUitnodiging(u); setLaden(false); });
  }, [token]);

  async function accepteren() {
    setBezig(true);
    setFout(null);
    const gelukt = await accepteerUitnodiging(uitnodiging, user.id, user.email);
    setBezig(false);
    if (!gelukt) { setFout('Kon de uitnodiging niet accepteren.'); return; }
    onKlaar();
  }

  if (laden) {
    return (
      <div className="is-wrap">
        <p className="is-tekst">Uitnodiging laden...</p>
      </div>
    );
  }

  const verlopen = uitnodiging && new Date(uitnodiging.verlopen_op) < new Date();

  if (!uitnodiging || uitnodiging.status !== 'open' || verlopen) {
    return (
      <div className="is-wrap">
        <div className="is-titel">Uitnodiging ongeldig</div>
        <p className="is-tekst">Deze uitnodiging bestaat niet (meer), is al gebruikt, of is verlopen.</p>
        <button className="btn btn-p btn-full" onClick={onKlaar}>Verder naar de app</button>
      </div>
    );
  }

  if (uitnodiging.uitgenodigd_email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    return (
      <div className="is-wrap">
        <div className="is-titel">Verkeerd account</div>
        <p className="is-tekst">
          Deze uitnodiging is voor {uitnodiging.uitgenodigd_email}, maar je bent ingelogd als {user.email}.
          Log in met het juiste account om de uitnodiging te accepteren.
        </p>
        <button className="btn btn-p btn-full" onClick={onKlaar}>Verder naar de app</button>
      </div>
    );
  }

  return (
    <div className="is-wrap">
      <div className="is-titel">Uitnodiging voor {uitnodiging.huishoudens?.naam}</div>
      <p className="is-tekst">Je bent uitgenodigd om lid te worden van dit huishouden.</p>
      {fout && <div className="is-fout">{fout}</div>}
      <button className="btn btn-p btn-full" onClick={accepteren} disabled={bezig}>
        {bezig ? 'Bezig...' : 'Accepteren'}
      </button>
      <button className="is-wissel" onClick={onKlaar}>Niet nu</button>
    </div>
  );
}
