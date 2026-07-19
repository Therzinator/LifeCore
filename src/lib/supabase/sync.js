import { sbClient } from './client.js';
import { PREFIX } from '../storage/lokaal.js';

const NIET_SYNCEN = ['actieve_pagina', 'training_actief'];

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

  for (const sleutel of lokaleSleutels()) {
    let lokaleData;
    try {
      lokaleData = JSON.parse(localStorage.getItem(PREFIX + sleutel));
    } catch {
      continue;
    }
    if (!lokaleData) continue;

    const remote = await pullSleutel(userId, sleutel);

    if (!remote) {
      gelukt = (await pushSleutel(userId, sleutel, lokaleData)) && gelukt;
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
