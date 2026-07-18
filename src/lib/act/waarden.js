export const WAARDEN = [
  { id: 'relaties', label: 'Relaties & familie', omschrijving: 'Hoe je aanwezig wilt zijn voor de mensen die dicht bij je staan.' },
  { id: 'vriendschap', label: 'Vriendschap & sociaal contact', omschrijving: 'Verbinding met anderen buiten je naaste kring.' },
  { id: 'werk', label: 'Werk & vakmanschap', omschrijving: 'Wat je wilt bijdragen of opbouwen in je werk.' },
  { id: 'groei', label: 'Leren & persoonlijke groei', omschrijving: 'Jezelf blijven ontwikkelen, nieuwsgierig blijven.' },
  { id: 'gezondheid', label: 'Gezondheid & lichaam', omschrijving: 'Hoe je voor je lichaam en energie wilt zorgen.' },
  { id: 'rust', label: 'Rust & ontspanning', omschrijving: 'Ruimte nemen zonder dat er iets moet.' },
  { id: 'plezier', label: 'Plezier & speelsheid', omschrijving: 'Dingen doen omdat ze leuk zijn, niet omdat ze moeten.' },
  { id: 'zorgzaamheid', label: 'Zorgzaamheid', omschrijving: 'Er zijn voor anderen, op jouw manier.' },
  { id: 'avontuur', label: 'Avontuur & nieuwe ervaringen', omschrijving: 'Nieuwe dingen opzoeken, buiten je comfortzone.' },
  { id: 'betekenis', label: 'Betekenis & zingeving', omschrijving: 'Waar jij het gevoel van bijdragen aan iets groters vandaan haalt.' },
  { id: 'omgeving', label: 'Omgeving & natuur', omschrijving: 'Je relatie met je fysieke omgeving en de natuur.' },
];

export function waardeById(id) {
  return WAARDEN.find((w) => w.id === id) ?? null;
}
