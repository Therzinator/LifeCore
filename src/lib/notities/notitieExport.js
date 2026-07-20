import { MODULES } from '../nav/modules.js';

const MODULE_LABEL_FALLBACK = { snelkeuze: 'Snelkeuze' };

function moduleLabel(moduleId) {
  return MODULES[moduleId]?.label ?? MODULE_LABEL_FALLBACK[moduleId] ?? moduleId ?? 'Algemeen';
}

// Groepeert de platte notitielijst per module, in de volgorde waarin elke
// module voor het eerst voorkomt — bij een newest-first lijst (zie
// useNotities.js) betekent dat: de module met de meest recente notitie
// eerst. Gebruikt door zowel de export-opmaak hieronder als NotitiesKnop.jsx
// om de UI in dezelfde groepen/volgorde te tonen als de export.
export function groepeerPerModule(notities) {
  const perModule = new Map();
  notities.forEach((n) => {
    const key = n.moduleId ?? 'algemeen';
    if (!perModule.has(key)) perModule.set(key, []);
    perModule.get(key).push(n);
  });
  return Array.from(perModule.entries()).map(([moduleId, lijst]) => ({ moduleId, notities: lijst }));
}

function formatteerModuleBlok(moduleId, lijst) {
  const regels = [`## ${moduleLabel(moduleId)}`];
  lijst
    .slice()
    .sort((a, b) => a.aangemaaktOp.localeCompare(b.aangemaaktOp))
    .forEach((n) => {
      const datum = new Date(n.aangemaaktOp).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
      const prefix = n.substap ? `${n.substap}: ` : '';
      regels.push(`- (${datum}) ${prefix}${n.tekst}`);
    });
  return regels.join('\n');
}

// Vormt de platte notitielijst om naar leesbare Markdown, gegroepeerd per
// module en chronologisch binnen elke groep — bedoeld om te kopiëren/
// plakken in een Claude Code-sessie voor verwerking, dus leesbaar voor een
// mens én bruikbaar als los stuk tekst (geen JSON).
export function formatteerNotitiesVoorExport(notities) {
  if (notities.length === 0) return '';

  const regels = ['# LifeCore-notities', ''];
  groepeerPerModule(notities).forEach(({ moduleId, notities: lijst }) => {
    regels.push(formatteerModuleBlok(moduleId, lijst));
    regels.push('');
  });

  return regels.join('\n').trim();
}

// Zelfde opmaak als hierboven, maar voor één module — behoudt de
// "# LifeCore-notities"-kop zodat een toekomstige Claude Code-sessie de dump
// nog steeds herkent, ook als er maar één module gekopieerd wordt.
export function formatteerModuleVoorExport(moduleId, lijst) {
  if (!lijst.length) return '';
  return ['# LifeCore-notities', '', formatteerModuleBlok(moduleId, lijst)].join('\n').trim();
}
