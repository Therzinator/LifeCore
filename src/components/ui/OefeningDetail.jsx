import './OefeningDetail.css';

export default function OefeningDetail({ oefening }) {
  return (
    <>
      <img src={oefening.afbeelding} alt={oefening.naam} className="oe-afbeelding" loading="lazy" />
      <p className="oe-uitleg">{oefening.uitleg}</p>
      {oefening.equipment && <p className="oe-equipment">Materiaal: {oefening.equipment}</p>}
    </>
  );
}
