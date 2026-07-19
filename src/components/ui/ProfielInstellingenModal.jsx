import { useState } from 'react';
import { usePersoonsProfiel } from '../../hooks/usePersoonsProfiel.js';
import { useThemaVoorkeur } from '../../hooks/useThemaVoorkeur.js';
import { useHuishouden } from '../../hooks/useHuishouden.js';
import { MODULES, MODULE_CATEGORIEEN } from '../../lib/nav/modules.js';
import './ProfielInstellingenModal.css';

const THEMA_OPTIES = [
  { id: 'donker', label: 'Donker' },
  { id: 'licht', label: 'Licht (volgt later)' },
  { id: 'systeem', label: 'Systeem (volgt later)' },
];

function EmailSectie({ auth }) {
  const [email, setEmail] = useState(auth.user?.email ?? '');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState(null);
  const [gelukt, setGelukt] = useState(null);

  async function opslaan(e) {
    e.preventDefault();
    if (!email || email === auth.user?.email) return;

    setBezig(true);
    setFout(null);
    setGelukt(null);
    const { error } = await auth.bijwerkenAccount({ email });
    setBezig(false);
    if (error) {
      setFout(error);
      return;
    }
    setGelukt('Bevestig de wijziging via de link die naar je nieuwe e-mailadres is gestuurd.');
  }

  return (
    <div className="card">
      <div className="td-label">E-mailadres</div>
      <form onSubmit={opslaan}>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="pim-email">E-mailadres</label>
          <input
            id="pim-email"
            className="ti-veld"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {fout && <p className="is-fout">{fout}</p>}
        {gelukt && <p className="pim-gelukt">{gelukt}</p>}

        <button className="btn btn-p btn-full" type="submit" disabled={bezig || !email || email === auth.user?.email}>
          {bezig ? 'Bezig...' : 'E-mailadres wijzigen'}
        </button>
      </form>
    </div>
  );
}

function WachtwoordSectie({ auth }) {
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('');
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState(null);
  const [gelukt, setGelukt] = useState(null);

  async function opslaan(e) {
    e.preventDefault();
    if (!huidigWachtwoord || !nieuwWachtwoord) return;

    setBezig(true);
    setFout(null);
    setGelukt(null);
    const { error } = await auth.wachtwoordWijzigen(huidigWachtwoord, nieuwWachtwoord);
    setBezig(false);
    if (error) {
      setFout(error);
      return;
    }
    setHuidigWachtwoord('');
    setNieuwWachtwoord('');
    setGelukt('Wachtwoord bijgewerkt.');
  }

  return (
    <div className="card">
      <div className="td-label">Wachtwoord wijzigen</div>
      <form onSubmit={opslaan}>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="pim-huidig-wachtwoord">Huidig wachtwoord</label>
          <input
            id="pim-huidig-wachtwoord"
            className="ti-veld"
            type="password"
            autoComplete="current-password"
            value={huidigWachtwoord}
            onChange={(e) => setHuidigWachtwoord(e.target.value)}
            placeholder="Vereist om te wijzigen"
          />
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="pim-wachtwoord">Nieuw wachtwoord</label>
          <input
            id="pim-wachtwoord"
            className="ti-veld"
            type="password"
            autoComplete="new-password"
            value={nieuwWachtwoord}
            onChange={(e) => setNieuwWachtwoord(e.target.value)}
            placeholder="Minstens 6 tekens"
            minLength={6}
          />
        </div>

        {fout && <p className="is-fout">{fout}</p>}
        {gelukt && <p className="pim-gelukt">{gelukt}</p>}

        <button className="btn btn-p btn-full" type="submit" disabled={bezig || !huidigWachtwoord || !nieuwWachtwoord}>
          {bezig ? 'Bezig...' : 'Wachtwoord wijzigen'}
        </button>
      </form>
    </div>
  );
}

function HuishoudenSectie({ auth }) {
  const huishouden = useHuishouden(auth.user?.id, auth.user?.email);
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [nieuweLink, setNieuweLink] = useState(null);
  const [gekopieerd, setGekopieerd] = useState(false);

  if (huishouden.laden) {
    return <div className="card"><p className="ti-hint">Laden...</p></div>;
  }

  if (!huishouden.huishouden) {
    return (
      <div className="card">
        <div className="td-label">Huishouden</div>
        <p className="ti-hint">
          Maak een huishouden aan om straks samen met je partner Kluslijst-projecten en het
          huishoudschema te gebruiken.
        </p>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="hs-naam">Naam</label>
          <input
            id="hs-naam"
            className="ti-veld"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="bijv. Familie Klop"
          />
        </div>
        <button
          className="btn btn-p btn-full"
          disabled={!naam.trim()}
          onClick={async () => { await huishouden.maakAan(naam.trim()); setNaam(''); }}
        >
          Huishouden aanmaken
        </button>
      </div>
    );
  }

  const mijnLid = huishouden.leden.find((l) => l.user_id === auth.user?.id);
  const openUitnodigingen = huishouden.uitnodigingen.filter((u) => u.status === 'open');

  async function uitnodigen(e) {
    e.preventDefault();
    if (!email.trim()) return;
    const uitnodiging = await huishouden.nodigUit(email.trim());
    setEmail('');
    setGekopieerd(false);
    if (uitnodiging) setNieuweLink(`${window.location.origin}?uitnodiging=${uitnodiging.token}`);
  }

  function kopieer(link) {
    navigator.clipboard?.writeText(link);
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 2000);
  }

  return (
    <div className="card">
      <div className="td-label">{huishouden.huishouden.naam}</div>

      <label className="ti-lbl">Leden</label>
      <div className="hh-lijst">
        {huishouden.leden.map((lid) => (
          <div className="hh-item" key={lid.id}>
            <span className="hh-tekst">
              {lid.lid_email}
              {lid.rol === 'eigenaar' && <span className="hhp-werk-badge"> · eigenaar</span>}
            </span>
            {(lid.user_id === auth.user?.id || mijnLid?.rol === 'eigenaar') && (
              <button
                className="hh-verwijder"
                onClick={() => huishouden.verwijderLid(lid.id)}
                title={lid.user_id === auth.user?.id ? 'Huishouden verlaten' : 'Verwijderen'}
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <label className="ti-lbl" style={{ marginTop: 'var(--space-md)' }}>Partner uitnodigen</label>
      <form onSubmit={uitnodigen} className="ti-rij">
        <input
          className="ti-veld"
          style={{ flex: 1 }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e-mailadres"
          required
        />
        <button className="btn btn-p btn-sm" type="submit">Uitnodigen</button>
      </form>

      {nieuweLink && (
        <div className="pim-gelukt">
          <p style={{ marginBottom: 'var(--space-xs)' }}>Deel deze link (bv. via WhatsApp of e-mail):</p>
          <div className="ti-rij">
            <input className="ti-veld" style={{ flex: 1 }} readOnly value={nieuweLink} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn-g btn-sm" onClick={() => kopieer(nieuweLink)}>
              {gekopieerd ? 'Gekopieerd!' : 'Kopieer'}
            </button>
          </div>
        </div>
      )}

      {openUitnodigingen.length > 0 && (
        <>
          <label className="ti-lbl" style={{ marginTop: 'var(--space-md)' }}>Openstaande uitnodigingen</label>
          <div className="hh-lijst">
            {openUitnodigingen.map((u) => (
              <div className="hh-item" key={u.id}>
                <span className="hh-tekst">{u.uitgenodigd_email}</span>
                <button className="btn btn-g btn-sm" onClick={() => huishouden.trekIn(u.id)}>Intrekken</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AccountSectie({ auth, onUitgelogd }) {
  return (
    <div>
      <EmailSectie auth={auth} />
      <WachtwoordSectie auth={auth} />

      <div className="card">
        <button type="button" className="pim-uitloggen" onClick={() => { onUitgelogd(); auth.logout(); }}>
          Uitloggen
        </button>
      </div>
    </div>
  );
}

const BASIS_TABS = [
  { id: 'profiel', label: 'Profiel' },
  { id: 'modules', label: 'Modules' },
];

function ModulesSectie({ moduleVoorkeuren }) {
  const { actieveModules, zetActieveModules } = moduleVoorkeuren;

  function wissel(id) {
    const nieuw = actieveModules.includes(id)
      ? actieveModules.filter((m) => m !== id)
      : [...actieveModules, id];
    zetActieveModules(nieuw);
  }

  return (
    <div className="card">
      <div className="td-label">Modules</div>
      <p className="ti-hint">Welke onderdelen wil je in de navigatie zien? Uitzetten verwijdert geen data — je kunt alles hier weer aanzetten.</p>
      {MODULE_CATEGORIEEN.map((cat) => (
        <div key={cat.id} className="ti-veld-grp">
          <label className="ti-lbl">{cat.titel}</label>
          <div className="ti-rij">
            {cat.modules.map((id) => (
              <button
                key={id}
                type="button"
                className={`btn btn-sm ${actieveModules.includes(id) ? 'btn-p' : 'btn-g'}`}
                style={{ flex: 1 }}
                onClick={() => wissel(id)}
              >{MODULES[id].label}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AppSectie({ appUpdate }) {
  return (
    <div className="card">
      <div className="td-label">App</div>
      <p className="ti-hint">
        Huidige versie: {__APP_VERSION__}. Een nieuwe versie wordt niet altijd automatisch opgepikt
        (vooral op mobiel) — forceer de nieuwste versie als de app verouderd aanvoelt.
      </p>
      <button type="button" className="btn btn-g btn-full" onClick={appUpdate.forceerNieuwsteVersie}>
        Nieuwste versie forceren
      </button>
    </div>
  );
}

export default function ProfielInstellingenModal({ auth, appUpdate, moduleVoorkeuren, onUitgelogd }) {
  const { profiel, bewaar } = usePersoonsProfiel();
  const { thema, setThema } = useThemaVoorkeur();
  const [tab, setTab] = useState('profiel');
  const heeftAccountTab = Boolean(auth?.enabled && auth?.ingelogd);
  const tabs = heeftAccountTab
    ? [...BASIS_TABS, { id: 'huishouden', label: 'Huishouden' }, { id: 'account', label: 'Account & privacy' }]
    : BASIS_TABS;

  return (
    <div>
      <div className="ti-rij pim-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`btn btn-sm ${tab === t.id ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
      </div>

      {tab === 'profiel' && (
        <>
          <div className="card">
            <div className="td-label">Thema</div>
            <div className="ti-rij">
              {THEMA_OPTIES.map((optie) => (
                <button
                  key={optie.id}
                  type="button"
                  className={`btn btn-sm ${thema === optie.id ? 'btn-p' : 'btn-g'}`}
                  style={{ flex: 1 }}
                  onClick={() => setThema(optie.id)}
                >
                  {optie.label}
                </button>
              ))}
            </div>
            <p className="ti-hint">
              Licht/systeem is voorlopig alleen een opgeslagen voorkeur — het lichte kleurenpalet zelf volgt later.
            </p>
          </div>

          <div className="card">
            <div className="td-label">Profielgegevens</div>
            <div className="pp-grid">
              <div className="ti-veld-grp">
                <label className="ti-lbl" htmlFor="pim-naam">Naam</label>
                <input
                  id="pim-naam"
                  className="ti-veld"
                  value={profiel.naam ?? ''}
                  onChange={(e) => bewaar({ naam: e.target.value })}
                  placeholder="Jouw naam"
                />
              </div>
              <div className="ti-veld-grp">
                <label className="ti-lbl" htmlFor="pim-geslacht">Geslacht</label>
                <select
                  id="pim-geslacht"
                  className="ti-veld"
                  value={profiel.geslacht ?? ''}
                  onChange={(e) => bewaar({ geslacht: e.target.value })}
                >
                  <option value="">— kies —</option>
                  <option value="man">Man</option>
                  <option value="vrouw">Vrouw</option>
                  <option value="anders">Anders / niet vermeld</option>
                </select>
              </div>
              <div className="ti-veld-grp">
                <label className="ti-lbl" htmlFor="pim-leeftijd">Leeftijd</label>
                <input
                  id="pim-leeftijd" type="number" className="ti-veld" min="10" max="100"
                  value={profiel.leeftijd ?? ''}
                  onChange={(e) => bewaar({ leeftijd: e.target.value ? parseInt(e.target.value, 10) : null })}
                  placeholder="bijv. 32"
                />
              </div>
              <div className="ti-veld-grp">
                <label className="ti-lbl" htmlFor="pim-lengte">Lengte (cm)</label>
                <input
                  id="pim-lengte" type="number" className="ti-veld" min="100" max="250"
                  value={profiel.lengte ?? ''}
                  onChange={(e) => bewaar({ lengte: e.target.value ? parseInt(e.target.value, 10) : null })}
                  placeholder="bijv. 182"
                />
              </div>
              <div className="ti-veld-grp">
                <label className="ti-lbl" htmlFor="pim-gewicht">Lichaamsgewicht (kg)</label>
                <input
                  id="pim-gewicht" type="number" className="ti-veld" min="30" max="300" step="0.5"
                  value={profiel.lichaamsgewicht ?? ''}
                  onChange={(e) => bewaar({ lichaamsgewicht: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="bijv. 82.5"
                />
              </div>
            </div>
            <p className="ti-hint">Trainingsprofiel en startgewichten stel je in bij Training → Mijn profiel.</p>
          </div>
        </>
      )}

      {tab === 'modules' && <ModulesSectie moduleVoorkeuren={moduleVoorkeuren} />}

      {tab === 'huishouden' && heeftAccountTab && <HuishoudenSectie auth={auth} />}

      {tab === 'account' && heeftAccountTab && <AccountSectie auth={auth} onUitgelogd={onUitgelogd} />}

      {appUpdate && <AppSectie appUpdate={appUpdate} />}
    </div>
  );
}
