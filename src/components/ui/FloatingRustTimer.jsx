import { useRef, useState } from 'react';
import './FloatingRustTimer.css';

const RAND_MARGE = 12;
const SLEEP_DREMPEL = 6; // px — onderscheidt een tik (navigeren) van slepen

function klemPositie(x, y, breedte, hoogte) {
  const maxX = window.innerWidth - breedte - RAND_MARGE;
  const maxY = window.innerHeight - hoogte - RAND_MARGE;
  return { x: Math.min(Math.max(x, RAND_MARGE), Math.max(maxX, RAND_MARGE)), y: Math.min(Math.max(y, RAND_MARGE), Math.max(maxY, RAND_MARGE)) };
}

// Versleepbare, sluitbare widget die een lopende rusttimer zichtbaar houdt
// terwijl je door de rest van de app navigeert — de timer zelf leeft in
// RustTimerContext (boven de paginawissel-logica), dit is puur de UI ervoor.
// Een tik (zonder te slepen) navigeert terug naar de trainingspagina; de
// aparte sluitknop stopt de timer zonder te navigeren.
const BOX_BREEDTE = 168;
const BOX_HOOGTE = 168;

export default function FloatingRustTimer({ timer, onNavigeerNaarTraining, verborgen }) {
  const [positie, setPositie] = useState(() => klemPositie(window.innerWidth - BOX_BREEDTE - 12, window.innerHeight - BOX_HOOGTE - 132, BOX_BREEDTE, BOX_HOOGTE));
  const sleepRef = useRef(null);

  if (!timer.actief || verborgen) return null;

  const minuten = Math.floor(timer.resterend / 60);
  const seconden = timer.resterend % 60;
  const pct = timer.totaal ? Math.round(((timer.totaal - timer.resterend) / timer.totaal) * 100) : 0;

  function opPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    sleepRef.current = { startX: e.clientX, startY: e.clientY, origX: positie.x, origY: positie.y, verplaatst: false };
  }

  function opPointerMove(e) {
    if (!sleepRef.current) return;
    const dx = e.clientX - sleepRef.current.startX;
    const dy = e.clientY - sleepRef.current.startY;
    if (Math.abs(dx) > SLEEP_DREMPEL || Math.abs(dy) > SLEEP_DREMPEL) sleepRef.current.verplaatst = true;
    setPositie(klemPositie(sleepRef.current.origX + dx, sleepRef.current.origY + dy, BOX_BREEDTE, BOX_HOOGTE));
  }

  function opPointerUp() {
    const verplaatst = sleepRef.current?.verplaatst;
    sleepRef.current = null;
    if (!verplaatst) onNavigeerNaarTraining?.();
  }

  // Knoppen binnen de widget mogen het slepen/tikken van de omringende box
  // niet triggeren. stopPropagation() op alléén de click-handler is niet
  // genoeg: de drag/tik-navigatie hierboven luistert op pointerdown/-up, dus
  // zonder ook dáár te blokkeren bubbelt een pointerup vanaf de knop alsnog
  // naar opPointerUp() — dat ziet dan geen sleepRef (want pointerdown werd
  // al gestopt) en navigeert dus alsnog naar Training, boven op de eigenlijke
  // knopactie. Beide pointer-events blokkeren voorkomt dat.
  const blokkeerSlepen = { onPointerDown: (e) => e.stopPropagation(), onPointerUp: (e) => e.stopPropagation() };

  return (
    <div
      className="frt-box"
      role="timer"
      aria-live="polite"
      style={{ left: positie.x, top: positie.y }}
      onPointerDown={opPointerDown}
      onPointerMove={opPointerMove}
      onPointerUp={opPointerUp}
    >
      <button type="button" className="frt-sluit" aria-label="Timer sluiten" {...blokkeerSlepen} onClick={timer.stop}>
        ✕
      </button>
      <div className="frt-ring" style={{ '--frt-pct': `${pct}%` }}>
        <span className="frt-val">{minuten}:{seconden < 10 ? '0' : ''}{seconden}</span>
      </div>
      <div className="frt-lbl">Rust</div>
      <div className="frt-acts">
        <button type="button" className="btn btn-g btn-sm" {...blokkeerSlepen} onClick={timer.stop}>Stop</button>
        <button type="button" className="btn btn-g btn-sm" {...blokkeerSlepen} onClick={() => timer.plus(30)}>+30s</button>
      </div>
      {timer.pip.ondersteund && (
        <button
          type="button"
          className="btn btn-g btn-sm frt-pip"
          {...blokkeerSlepen}
          onClick={timer.pip.actief ? timer.pip.sluiten : timer.pip.activeer}
        >
          {timer.pip.actief ? 'Zwevend venster actief ✓' : '⧉ Open als zwevend venster'}
        </button>
      )}
    </div>
  );
}
