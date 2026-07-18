export default function CardioInstellingen({ instellingen, bewaar }) {
  function veld(key, parse = (v) => v) {
    return (e) => bewaar({ [key]: parse(e.target.value) });
  }

  return (
    <div>
      <p className="of-stap-tekst">Intervalvoorkeuren voor de HIIT-variant van het roeiprogramma.</p>

      <div className="card">
        <div className="td-label">HIIT — roeien</div>
        <div className="ti-rij">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="cro-werk">Werkduur (sec)</label>
            <input
              id="cro-werk" type="number" className="ti-veld" min="10" max="180" step="5"
              value={instellingen.hiitWerkSec} onChange={veld('hiitWerkSec', (v) => parseInt(v) || 30)}
            />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="cro-rust">Rustduur (sec)</label>
            <input
              id="cro-rust" type="number" className="ti-veld" min="10" max="180" step="5"
              value={instellingen.hiitRustSec} onChange={veld('hiitRustSec', (v) => parseInt(v) || 30)}
            />
          </div>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="cro-rondes">Aantal rondes</label>
          <input
            id="cro-rondes" type="number" className="ti-veld" min="2" max="20" step="1"
            value={instellingen.hiitRondes} onChange={veld('hiitRondes', (v) => parseInt(v) || 8)}
          />
        </div>
        <p className="ti-hint">
          Inclusief vaste warming-up (5 min) en cooling-down (5 min). Bij {instellingen.hiitWerkSec}s werk /{' '}
          {instellingen.hiitRustSec}s rust × {instellingen.hiitRondes} rondes duurt de sessie in totaal ongeveer{' '}
          {Math.round(10 + (instellingen.hiitWerkSec * instellingen.hiitRondes + instellingen.hiitRustSec * (instellingen.hiitRondes - 1)) / 60)} min.
        </p>
      </div>
    </div>
  );
}
