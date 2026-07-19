import { useEffect } from 'react';
import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { instantiesInBereik } from '../../lib/agenda/agendaBlokken.js';
import { TYPE_ICOON } from '../agenda/agendaWeergave.js';
import { datumKey } from '../../utils/datum.js';

export default function StapAfronden({ dagdata, toonToast }) {
  useEffect(() => {
    if (!dagdata.dag.afgerond) {
      dagdata.setAfgerond();
      toonToast('Fijne dag verder', 'ok');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { blokken } = useAgendaBlokken();
  const vandaag = datumKey();
  const blokkenVandaag = instantiesInBereik(blokken, vandaag, vandaag)
    .filter((b) => b.datum === vandaag)
    .sort((a, b) => a.starttijd.localeCompare(b.starttijd));

  return (
    <div>
      <div className="of-stap-titel">Klaar voor vandaag</div>
      <p className="of-stap-tekst">
        Je hoofd is leger, je dag heeft een richting. Dat is genoeg. Tot morgen.
      </p>

      <div className="ti-veld-grp" style={{ marginTop: 'var(--space-md)' }}>
        <label className="ti-lbl">Op de Agenda vandaag</label>
        {blokkenVandaag.length === 0 && <p className="ti-hint">Niets gepland — een lege dag.</p>}
        {blokkenVandaag.length > 0 && (
          <div className="hh-lijst">
            {blokkenVandaag.map((b) => (
              <div className="ag-blok-item" key={`${b.id}-${b.datum}`}>
                <div className="ag-blok-titel-rij">
                  <span className="hh-tekst">{TYPE_ICOON[b.type] ?? '•'} {b.titel}</span>
                </div>
                <div className="ag-blok-acties-rij">
                  <span className="ag-item-tijd">{b.starttijd}–{b.eindtijd}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
