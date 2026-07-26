import GeluidKiezer from '../ui/GeluidKiezer.jsx';
import GetalVeld from '../ui/GetalVeld.jsx';

export default function CardioInstellingen({ instellingen, bewaar }) {
  return (
    <div>
      <p className="of-stap-tekst">Intervalvoorkeuren voor de HIIT-variant van het roeiprogramma.</p>

      <div className="card">
        <div className="td-label">HIIT — roeien</div>
        <div className="ti-rij">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="cro-werk">Werkduur (sec)</label>
            <GetalVeld
              id="cro-werk" className="ti-veld" min={10} max={180} step={5} fallback={30}
              value={instellingen.hiitWerkSec} onCommit={(v) => bewaar({ hiitWerkSec: v })}
            />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="cro-rust">Rustduur (sec)</label>
            <GetalVeld
              id="cro-rust" className="ti-veld" min={10} max={180} step={5} fallback={30}
              value={instellingen.hiitRustSec} onCommit={(v) => bewaar({ hiitRustSec: v })}
            />
          </div>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="cro-rondes">Aantal rondes</label>
          <GetalVeld
            id="cro-rondes" className="ti-veld" min={2} max={20} step={1} fallback={8}
            value={instellingen.hiitRondes} onCommit={(v) => bewaar({ hiitRondes: v })}
          />
        </div>
        <p className="ti-hint">
          Inclusief vaste warming-up (5 min) en cooling-down (5 min). Bij {instellingen.hiitWerkSec}s werk /{' '}
          {instellingen.hiitRustSec}s rust × {instellingen.hiitRondes} rondes duurt de sessie in totaal ongeveer{' '}
          {Math.round(10 + (instellingen.hiitWerkSec * instellingen.hiitRondes + instellingen.hiitRustSec * (instellingen.hiitRondes - 1)) / 60)} min.
        </p>
        <GeluidKiezer
          label="Geluid bij faseovergang"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
      </div>
    </div>
  );
}
