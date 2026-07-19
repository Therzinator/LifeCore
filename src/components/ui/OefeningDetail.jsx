import './OefeningDetail.css';

const LABELS = ['Start', 'Eind'];

export default function OefeningDetail({ oefening }) {
  const afbeeldingen = oefening.afbeeldingen?.length ? oefening.afbeeldingen : [oefening.afbeelding];

  return (
    <>
      {afbeeldingen.length > 1 ? (
        <div className="oe-afbeeldingen-grid">
          {afbeeldingen.slice(0, 2).map((src, i) => (
            <div className="oe-afbeelding-cel" key={src}>
              <img src={src} alt={`${oefening.naam} — ${LABELS[i]}`} className="oe-afbeelding" loading="lazy" />
              <span className="oe-afbeelding-lbl">{LABELS[i]}</span>
            </div>
          ))}
        </div>
      ) : (
        <img src={oefening.afbeelding} alt={oefening.naam} className="oe-afbeelding" loading="lazy" />
      )}
      <p className="oe-uitleg">{oefening.uitleg}</p>
      {oefening.equipment && <p className="oe-equipment">Materiaal: {oefening.equipment}</p>}
    </>
  );
}
