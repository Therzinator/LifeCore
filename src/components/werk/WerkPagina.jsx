import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useWerkProjecten } from '../../hooks/useWerkProjecten.js';
import { useWerkInstellingen } from '../../hooks/useWerkInstellingen.js';
import WerkTaken from './WerkTaken.jsx';
import WerkInstellingen from './WerkInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';

// Huishouden, Kluslijst, Ontspullen en Boodschappen zijn verhuisd naar de
// Thuis-module (zie thuis/ThuisPagina.jsx) — Werk is nu puur de werk-taken
// van de dag. werkProjecten is Werk's eigen, losse projectenlaag (zie
// useWerkProjecten.js) — niet gekoppeld aan Kluslijst.
export default function WerkPagina({ toonToast }) {
  const werkTaken = useWerkTaken();
  const werkProjecten = useWerkProjecten();
  const { instellingen, bewaar, voegCategorieToe, hernoemCategorie, verwijderCategorie } = useWerkInstellingen();

  // Validatie hier i.p.v. binnen hernoemCategorie zelf, zodat de taken-migratie
  // alleen gebeurt als de naam ook echt is gewijzigd in de instellingen-lijst
  // (anders verweest een mislukte hernoeming — leeg/duplicaat — de taken toch).
  function hernoemCategorieOveral(oud, nieuw) {
    const schoon = nieuw.trim();
    if (!schoon || schoon === oud || instellingen.categorieen.includes(schoon)) return;
    hernoemCategorie(oud, schoon);
    werkTaken.hernoemCategorieOpTaken(oud, schoon);
  }

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div style={{ flex: 1 }} />
        <ModuleInstellingenKnop titel="Werk-instellingen">
          <WerkInstellingen
            instellingen={instellingen}
            bewaar={bewaar}
            voegCategorieToe={voegCategorieToe}
            hernoemCategorie={hernoemCategorieOveral}
            verwijderCategorie={verwijderCategorie}
            werkProjecten={werkProjecten}
          />
        </ModuleInstellingenKnop>
      </div>

      <div className="card">
        <WerkTaken werkTaken={werkTaken} toonToast={toonToast} instellingen={instellingen} werkProjecten={werkProjecten} />
      </div>
    </div>
  );
}
