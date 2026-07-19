import { useEffect, useRef, useState } from 'react';
import { verwerkFoto } from '../../lib/werk/fotoVoorbewerking.js';
import { uploadFoto, haalFotoUrl, verwijderFoto } from '../../lib/supabase/klusjeFotos.js';
import FotoLightbox from '../ui/FotoLightbox.jsx';
import './FotosLijst.css';

// Foto's per klusje, om te verduidelijken wat er precies moet gebeuren.
// paden zijn Storage-paden (geen URL's, zie klusjeFotos.js) — elke
// weergave haalt zelf een verse signed URL op.
export default function FotosLijst({ userId, huishoudenId, projectId, klusjeId, paden, onVoegToe, onVerwijder, toonToast }) {
  // Zodra een project bij een huishouden hoort, uploadt een foto onder het
  // huishouden-pad (RLS staat dan leesbaarheid toe voor elk lid) i.p.v.
  // onder de eigen user_id — zie migratie 0013.
  const scopeId = huishoudenId ?? userId;
  const [urls, setUrls] = useState({});
  const [bezig, setBezig] = useState(false);
  const [uitgelicht, setUitgelicht] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let actief = true;
    paden.forEach((pad) => {
      haalFotoUrl(pad).then((url) => {
        if (actief && url) setUrls((huidig) => ({ ...huidig, [pad]: url }));
      });
    });
    return () => { actief = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij wijziging van paden opnieuw ophalen, niet bij elke urls-update zelf.
  }, [paden]);

  async function bestandGekozen(e) {
    const bestand = e.target.files?.[0];
    e.target.value = '';
    if (!bestand || !userId) return;

    setBezig(true);
    try {
      const verwerkt = await verwerkFoto(bestand);
      const pad = await uploadFoto(scopeId, klusjeId, verwerkt);
      if (pad) {
        onVoegToe(projectId, klusjeId, pad);
        toonToast('Foto toegevoegd', 'ok');
      } else {
        toonToast('Kon foto niet uploaden — ben je ingelogd?', 'wn');
      }
    } catch {
      toonToast('Kon foto niet verwerken', 'wn');
    } finally {
      setBezig(false);
    }
  }

  async function verwijderKlik(pad) {
    onVerwijder(projectId, klusjeId, pad);
    await verwijderFoto(pad);
  }

  return (
    <div className="fotos-lijst">
      <label className="ti-lbl">Foto's</label>
      <div className="fotos-grid">
        {paden.map((pad) => (
          <div className="foto-thumb-wrap" key={pad}>
            {urls[pad] ? (
              <button type="button" className="foto-thumb-btn" onClick={() => setUitgelicht(urls[pad])}>
                <img src={urls[pad]} alt="" className="foto-thumb" />
              </button>
            ) : (
              <div className="foto-thumb foto-thumb-laden" />
            )}
            <button className="foto-verwijder" onClick={() => verwijderKlik(pad)} aria-label="Foto verwijderen">✕</button>
          </div>
        ))}
        <button type="button" className="foto-toevoegen-btn" onClick={() => inputRef.current?.click()} disabled={bezig || !userId}>
          {bezig ? '...' : '+ Foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={bestandGekozen}
        />
      </div>
      {!userId && <p className="ti-hint">Log in om foto's toe te voegen.</p>}
      <FotoLightbox url={uitgelicht} onClose={() => setUitgelicht(null)} />
    </div>
  );
}
