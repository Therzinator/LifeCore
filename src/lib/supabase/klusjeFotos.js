import { sbClient } from './client.js';

const BUCKET = 'klusje-fotos';
// Vers opgehaald bij elke weergave i.p.v. een langdurige/permanente link
// opgeslagen — 1 uur is ruim genoeg om een sessie lang te bekijken zonder
// een onnodig lang-geldige, potentieel lekbare URL te bewaren.
const SIGNED_URL_TTL = 60 * 60;

export async function uploadFoto(userId, klusjeId, bestand) {
  const sb = sbClient();
  if (!sb) return null;

  const pad = `${userId}/${klusjeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await sb.storage.from(BUCKET).upload(pad, bestand, { contentType: 'image/jpeg' });

  if (error) {
    console.error('Kon foto niet uploaden', error);
    return null;
  }
  return pad;
}

export async function haalFotoUrl(pad) {
  const sb = sbClient();
  if (!sb || !pad) return null;

  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(pad, SIGNED_URL_TTL);
  if (error) {
    console.error('Kon foto-URL niet ophalen', error);
    return null;
  }
  return data.signedUrl;
}

export async function verwijderFoto(pad) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.storage.from(BUCKET).remove([pad]);
  if (error) {
    console.error('Kon foto niet verwijderen', error);
    return false;
  }
  return true;
}
