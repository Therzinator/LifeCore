import { MODULES } from '../nav/modules.js';

const MODULE_LABEL_FALLBACK = { snelkeuze: 'Snelkeuze' };

function moduleLabel(moduleId) {
  return MODULES[moduleId]?.label ?? MODULE_LABEL_FALLBACK[moduleId] ?? moduleId ?? 'Algemeen';
}

// Vormt de platte notitielijst om naar leesbare Markdown, gegroepeerd per
// module en chronologisch binnen elke groep — bedoeld om te kopiëren/
// plakken in een Claude Code-sessie voor verwerking, dus leesbaar voor een
// mens én bruikbaar als los stuk tekst (geen JSON).
export function formatteerNotitiesVoorExport(notities) {
  if (notities.length === 0) return '';

  const perModule = new Map();
  notities.forEach((n) => {
    const key = n.moduleId ?? 'algemeen';
    if (!perModule.has(key)) perModule.set(key, []);
    perModule.get(key).push(n);
  });

  const regels = ['# LifeCore-notities', ''];
  perModule.forEach((lijst, moduleId) => {
    regels.push(`## ${moduleLabel(moduleId)}`);
    lijst
      .slice()
      .sort((a, b) => a.aangemaaktOp.localeCompare(b.aangemaaktOp))
      .forEach((n) => {
        const datum = new Date(n.aangemaaktOp).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
        const prefix = n.substap ? `${n.substap}: ` : '';
        regels.push(`- (${datum}) ${prefix}${n.tekst}`);
      });
    regels.push('');
  });

  return regels.join('\n').trim();
}
