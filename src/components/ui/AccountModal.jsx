import { useState } from 'react';
import Modal from './Modal.jsx';
import './AccountModal.css';

export default function AccountModal({ auth, onClose }) {
  const [email, setEmail] = useState(auth.user?.email ?? '');
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState(null);
  const [gelukt, setGelukt] = useState(null);

  async function opslaan(e) {
    e.preventDefault();

    const patch = {};
    if (email && email !== auth.user?.email) patch.email = email;
    if (nieuwWachtwoord) patch.password = nieuwWachtwoord;
    if (Object.keys(patch).length === 0) return;

    setBezig(true);
    setFout(null);
    setGelukt(null);
    const { error } = await auth.bijwerkenAccount(patch);
    setBezig(false);
    if (error) {
      setFout(error);
      return;
    }
    setNieuwWachtwoord('');
    setGelukt(
      patch.email
        ? 'Bevestig de wijziging via de link die naar je nieuwe e-mailadres is gestuurd.'
        : 'Wachtwoord bijgewerkt.',
    );
  }

  function uitloggen() {
    onClose();
    auth.logout();
  }

  return (
    <Modal titel="Account" onClose={onClose}>
      <form onSubmit={opslaan}>
        <label className="ti-lbl" htmlFor="am-email">E-mailadres</label>
        <input
          id="am-email"
          className="is-veld"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="ti-lbl" htmlFor="am-wachtwoord">Nieuw wachtwoord</label>
        <input
          id="am-wachtwoord"
          className="is-veld"
          type="password"
          value={nieuwWachtwoord}
          onChange={(e) => setNieuwWachtwoord(e.target.value)}
          placeholder="Laat leeg om ongewijzigd te laten"
          minLength={6}
        />

        {fout && <p className="is-fout">{fout}</p>}
        {gelukt && <p className="am-gelukt">{gelukt}</p>}

        <button className="btn btn-p btn-full" type="submit" disabled={bezig}>
          {bezig ? 'Bezig...' : 'Wijzigingen opslaan'}
        </button>
      </form>

      <button type="button" className="am-uitloggen" onClick={uitloggen}>Uitloggen</button>
    </Modal>
  );
}
