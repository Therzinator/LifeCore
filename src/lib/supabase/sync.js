import { sbClient } from './client.js';
import { PREFIX } from '../storage/lokaal.js';

// 'actieve_pagina' is pure UI-navigatiestate (welk scherm nu open staat) —
// hoort nooit tussen apparaten te synchroniseren. 'training_actief' stond
// hier voorheen ook in, maar dat is echte trainingsvoortgang (welke oefening,
// gewichten, welke sets al gedaan) die een gebruiker wél tussen apparaten
// wil meenemen (bv. plannen op desktop, uitvoeren op mobiel in de gym).
const NIET_SYNCEN = ['actieve_pagina'];

function lokaleSleutels() {
  const sleutels = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      const sleutel = key.slice(PREFIX.length);
      if (!NIET_SYNCEN.includes(sleutel)) sleutels.push(sleutel);
    }
  }
  return sleutels;
}

// Alle sleutels die deze gebruiker ooit vanaf een willekeurig apparaat heeft
// gesynchroniseerd — nodig naast lokaleSleutels() zodat een sleutel die op
// DIT apparaat nog nooit lokaal bestaan heeft (bv. een module die hier nog
// nooit geopend is, of een gloednieuw tweede apparaat) toch wordt opgehaald
// i.p.v. simpelweg overgeslagen te worden.
async function cloudSleutels(userId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb.from('lifecore_data').select('sleutel').eq('user_id', userId);
  if (error) {
    console.error('Kon cloud-sleutellijst niet ophalen', error);
    return [];
  }
  return data.map((r) => r.sleutel).filter((s) => !NIET_SYNCEN.includes(s));
}

export async function pushSleutel(userId, sleutel, data) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb
    .from('lifecore_data')
    .upsert(
      { user_id: userId, sleutel, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,sleutel' },
    );

  if (error) {
    console.error(`Kon "${sleutel}" niet synchroniseren`, error);
    return false;
  }
  return true;
}

export async function pullSleutel(userId, sleutel) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('lifecore_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .eq('sleutel', sleutel)
    .maybeSingle();

  if (error) {
    console.error(`Kon "${sleutel}" niet ophalen`, error);
    return null;
  }
  return data;
}

// gewijzigd geeft aan of er lokaal data is overschreven met een nieuwere
// cloud-versie (bv. van een ander apparaat) — de aanroeper (useSync) herlaadt
// dan de pagina, want elke feature-hook leest localStorage alleen bij mount
// en zou anders de overgenomen cloud-data niet tonen.
export async function synchroniseerAlles(userId) {
  const sb = sbClient();
  if (!sb) return { ok: false, gewijzigd: false };

  let gelukt = true;
  let gewijzigd = false;

  const alleSleutels = new Set([...lokaleSleutels(), ...(await cloudSleutels(userId))]);

  for (const sleutel of alleSleutels) {
    let lokaleData = null;
    try {
      const ruw = localStorage.getItem(PREFIX + sleutel);
      lokaleData = ruw ? JSON.parse(ruw) : null;
    } catch {
      lokaleData = null;
    }

    const remote = await pullSleutel(userId, sleutel);

    if (!remote) {
      if (lokaleData) gelukt = (await pushSleutel(userId, sleutel, lokaleData)) && gelukt;
      continue;
    }

    // Sleutel bestaat alleen in de cloud (nog nooit lokaal op dit apparaat
    // aangeraakt, bv. een module die hier nog nooit geopend is, of een
    // gloednieuw apparaat) — gewoon overnemen, niets om te vergelijken.
    if (!lokaleData) {
      localStorage.setItem(PREFIX + sleutel, JSON.stringify(remote.data));
      gewijzigd = true;
      continue;
    }

    // Vergelijk tegen het bewerktijdstip DAT IN DE DATA ZELF zit
    // (bijgewerkt_op), niet tegen remote.updated_at (de rij-schrijftijd van
    // Supabase). Die laatste wordt bij elke push opnieuw op 'nu' gezet, dus
    // is na een push altijd later dan het (oudere) lokale bewerktijdstip —
    // wat de eerstvolgende sync ten onrechte liet denken dat de cloud
    // nieuwer was, wat weer een pull + herlaad triggerde: een oneindige
    // sync/herlaad-lus (zie useSync.js).
    const lokaleTijd = lokaleData.bijgewerkt_op ?? 0;
    const remoteTijd = remote.data?.bijgewerkt_op ?? 0;

    if (lokaleTijd >= remoteTijd) {
      gelukt = (await pushSleutel(userId, sleutel, lokaleData)) && gelukt;
    } else {
      localStorage.setItem(PREFIX + sleutel, JSON.stringify(remote.data));
      gewijzigd = true;
    }
  }

  return { ok: gelukt, gewijzigd };
}
