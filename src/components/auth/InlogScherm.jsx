import { useState } from 'react';
import './InlogScherm.css';

export default function InlogScherm({ login, signup }) {
  const [modus, setModus] = useState('login');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState(null);
  const [bezig, setBezig] = useState(false);

  async function verzend(e) {
    e.preventDefault();
    setBezig(true);
    setFout(null);
    const actie = modus === 'login' ? login : signup;
    const { error } = await actie(email, wachtwoord);
    setBezig(false);
    if (error) setFout(error);
  }

  return (
    <div className="is-wrap">
      <div className="is-titel">{modus === 'login' ? 'Welkom terug' : 'Account maken'}</div>
      <p className="is-tekst">
        {modus === 'login'
          ? 'Log in om je gegevens te synchroniseren tussen apparaten.'
          : 'Maak een account om je gegevens veilig te synchroniseren.'}
      </p>

      {fout && <div className="is-fout">{fout}</div>}

      <form onSubmit={verzend}>
        <input
          className="is-veld"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          required
        />
        <input
          className="is-veld"
          type="password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          placeholder="Wachtwoord"
          required
          minLength={6}
        />
        <button className="btn btn-p btn-full" type="submit" disabled={bezig}>
          {bezig ? 'Bezig...' : modus === 'login' ? 'Inloggen' : 'Account maken'}
        </button>
      </form>

      <button className="is-wissel" onClick={() => setModus(modus === 'login' ? 'signup' : 'login')}>
        {modus === 'login' ? 'Nog geen account? Maak er een aan' : 'Al een account? Log in'}
      </button>
    </div>
  );
}
