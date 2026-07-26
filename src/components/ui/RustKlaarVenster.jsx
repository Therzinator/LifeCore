import Modal from './Modal.jsx';

// Verschijnt zodra een rustperiode afliep terwijl het zwevende PiP-venster
// actief was (zie RustTimerContext.jsx) — de gebruiker zat dus ergens anders
// en heeft het eindsignaal niet per se gezien. Staat al klaar tegen de tijd
// dat de app weer in beeld komt, i.p.v. dat er verder niets op het scherm
// verandert. Alternatief voor de 'terugNaarApp'-instelling, die dit venster
// juist overslaat door het PiP-venster automatisch te sluiten.
export default function RustKlaarVenster({ klaarInfo, onSluiten, onNaarTraining }) {
  if (!klaarInfo) return null;

  return (
    <Modal titel="Rust voorbij" onClose={onSluiten}>
      <p>
        Begin volgende set{klaarInfo.label ? <> — <strong>{klaarInfo.label}</strong></> : null}.
      </p>
      <button type="button" className="btn btn-p btn-full" onClick={onNaarTraining}>Naar training</button>
    </Modal>
  );
}
