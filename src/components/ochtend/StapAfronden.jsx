import { useEffect } from 'react';

export default function StapAfronden({ dagdata, toonToast }) {
  useEffect(() => {
    if (!dagdata.dag.afgerond) {
      dagdata.setAfgerond();
      toonToast('Fijne dag verder', 'ok');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="of-stap-titel">Klaar voor vandaag</div>
      <p className="of-stap-tekst">
        Je hoofd is leger, je dag heeft een richting. Dat is genoeg. Tot morgen.
      </p>
    </div>
  );
}
