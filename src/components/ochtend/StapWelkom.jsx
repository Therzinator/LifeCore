export default function StapWelkom({ volgende }) {
  return (
    <div>
      <div className="of-stap-titel">Goedemorgen</div>
      <p className="of-stap-tekst">
        Een paar korte stappen om je hoofd leeg te maken voordat de dag begint.
        Alles is overslaanbaar — er is geen verkeerde manier om dit te doen.
      </p>
      <div className="of-acties">
        <button className="btn btn-p btn-full" onClick={volgende}>
          Laten we beginnen
        </button>
      </div>
    </div>
  );
}
