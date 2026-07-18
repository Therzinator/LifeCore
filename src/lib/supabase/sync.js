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

export async function synchroniseerAlles(userId) {
  const sb = sbClient();
  if (!sb) return { ok: false };

  let gelukt = true;

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

    const lokaleTijd = lokaleData.bijgewerkt_op ?? 0;
    const remoteTijd = new Date(remote.updated_at).getTime();

    if (lokaleTijd >= remoteTijd) {
      gelukt = (await pushSleutel(userId, sleutel, lokaleData)) && gelukt;
    } else {
      localStorage.setItem(PREFIX + sleutel, JSON.stringify(remote.data));
    }
  }

  return { ok: gelukt };
}
