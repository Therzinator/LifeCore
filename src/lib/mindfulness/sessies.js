const KORT_MAX_SECONDEN = 5 * 60;

// Lengte-categorie wordt afgeleid van duur_seconden i.p.v. apart opgeslagen —
// één bron van waarheid, geen risico dat categorie en duur uit elkaar lopen.
export function lengteCategorie(duurSeconden) {
  return duurSeconden <= KORT_MAX_SECONDEN ? 'kort' : 'gemiddeld';
}

export function filterSessies(sessies, { themaId, lengte } = {}) {
  return sessies.filter((s) => {
    if (themaId && s.thema_id !== themaId) return false;
    if (lengte && lengteCategorie(s.duur_seconden) !== lengte) return false;
    return true;
  });
}

function maandagVan(datumIso) {
  const d = new Date(datumIso);
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return d.toISOString().slice(0, 10);
}

// Voortgangsstatistieken voor de Progressie-tab: sessies per week en totale
// minuten, gebaseerd op daadwerkelijk geluisterde tijd (niet alleen volledig
// afgeronde sessies) — een half beluisterde sessie telt ook mee.
export function voortgangsStats(gebruikRecords, weken = 12) {
  const perWeek = {};
  gebruikRecords.forEach((r) => {
    const key = maandagVan(r.gestart_op);
    if (!perWeek[key]) perWeek[key] = { sessies: 0, minuten: 0 };
    perWeek[key].sessies += 1;
    perWeek[key].minuten += r.geluisterd_seconden / 60;
  });

  const labels = Object.keys(perWeek).sort().slice(-weken);
  const sessiesPerWeek = labels.map((k) => perWeek[k].sessies);
  const minutenPerWeek = labels.map((k) => Math.round(perWeek[k].minuten));

  const totaalSessies = gebruikRecords.length;
  const totaalMinuten = Math.round(gebruikRecords.reduce((som, r) => som + r.geluisterd_seconden, 0) / 60);

  return { labels, sessiesPerWeek, minutenPerWeek, totaalSessies, totaalMinuten };
}
