import { sbClient } from './client.js';

const AUDIO_BUCKET = 'mindfulness-audio';

export async function haalThemas() {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb.from('mindfulness_themas').select('*').order('volgorde');
  if (error) {
    console.error('Kon mindfulness-thema\'s niet ophalen', error);
    return [];
  }
  return data;
}

export async function haalSessies() {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('mindfulness_sessies')
    .select('*')
    .eq('actief', true)
    .order('volgorde');

  if (error) {
    console.error('Kon mindfulness-sessies niet ophalen', error);
    return [];
  }
  return data;
}

export function audioUrl(pad) {
  const sb = sbClient();
  if (!sb || !pad) return null;
  return sb.storage.from(AUDIO_BUCKET).getPublicUrl(pad).data.publicUrl;
}

export async function logGebruik(userId, sessieId, geluisterdSeconden, voltooid) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('mindfulness_gebruik').insert({
    user_id: userId,
    sessie_id: sessieId,
    geluisterd_seconden: geluisterdSeconden,
    voltooid,
  });

  if (error) {
    console.error('Kon mindfulness-gebruik niet loggen', error);
    return false;
  }
  return true;
}

export async function haalGebruik(userId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('mindfulness_gebruik')
    .select('gestart_op, geluisterd_seconden, voltooid, sessie_id')
    .eq('user_id', userId)
    .order('gestart_op', { ascending: false });

  if (error) {
    console.error('Kon mindfulness-gebruik niet ophalen', error);
    return [];
  }
  return data;
}
