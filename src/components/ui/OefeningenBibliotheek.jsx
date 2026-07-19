import { useState } from 'react';
import Modal from './Modal.jsx';
import OefeningDetail from './OefeningDetail.jsx';
import './OefeningenBibliotheek.css';

const CATEGORIE_LABEL = {
  nek: 'Nek', borst: 'Borst', rug: 'Rug', schouders: 'Schouders',
  basis: 'StrongLifts-basis',
};

// Knop die een browsable bibliotheek-overlay opent, gegroepeerd per
// categorie. Wisselt tussen lijst- en detailweergave binnen ÉÉN Modal-
// instantie (i.p.v. een detail-popup ín de bibliotheek-popup te nesten) —
// twee tegelijk-gemonteerde Modals zouden allebei op Escape reageren, wat
// per ongeluk de hele bibliotheek zou sluiten i.p.v. alleen het detail.
// Sluiten (rechtsboven) in de detailweergave gaat terug naar de lijst; de
// knop zelf sluit de hele bibliotheek.
export default function OefeningenBibliotheek({ oefeningen, titel = 'Oefeningenbibliotheek', knopLabel = '📚 Oefeningenbibliotheek' }) {
  const [open, setOpen] = useState(false);
  const [actieveId, setActieveId] = useState(null);
  const [lijstScroll, setLijstScroll] = useState(0);

  const actief = oefeningen.find((o) => o.id === actieveId) ?? null;

  function sluiten() {
    setOpen(false);
    setActieveId(null);
    setLijstScroll(0);
  }

  const gegroepeerd = oefeningen.reduce((acc, o) => {
    const lijst = acc[o.categorie] ?? [];
    lijst.push(o);
    acc[o.categorie] = lijst;
    return acc;
  }, {});

  return (
    <>
      <button type="button" className="btn btn-g btn-sm" onClick={() => setOpen(true)}>{knopLabel}</button>

      {open && !actief && (
        <Modal titel={titel} onClose={sluiten} initieleScroll={lijstScroll} onScrollChange={setLijstScroll}>
          {Object.entries(gegroepeerd).map(([categorie, lijst]) => (
            <div className="ob-categorie" key={categorie}>
              <div className="ob-categorie-titel">{CATEGORIE_LABEL[categorie] ?? categorie}</div>
              {lijst.map((o) => (
                <button key={o.id} type="button" className="oe-toggle" onClick={() => setActieveId(o.id)}>
                  <span className="oe-naam">{o.naam}</span>
                  <span className="oe-kort">{o.kort}</span>
                </button>
              ))}
            </div>
          ))}
        </Modal>
      )}

      {open && actief && (
        <Modal titel={actief.naam} onClose={() => setActieveId(null)}>
          <OefeningDetail oefening={actief} />
        </Modal>
      )}
    </>
  );
}
