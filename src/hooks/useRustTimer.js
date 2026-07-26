import { useCallback, useEffect, useRef, useState } from 'react';
import { speelFragment } from '../lib/geluid/fragmenten.js';

const MAX_SECONDEN = 600;

// navigator.vibrate bestaat alleen op Chrome/Android — stilletjes een no-op
// op iOS Safari (nooit ondersteund, ook niet als geïnstalleerde PWA).
function trilBijEindeTimer() {
  navigator.vibrate?.([200, 100, 200]);
}

// Wake Lock houdt het scherm aan zolang een rusttimer loopt — de meest
// voorkomende reden dat het eindgeluid gemist wordt is niet dat de gebruiker
// de app verlaat, maar dat het scherm vanzelf vergrendelt tijdens de rust
// tussen sets. Geen harde vereiste (oudere browsers/iOS < 16.4 hebben de API
// niet) — degradeert dan stil naar het oude gedrag.
async function vraagWakeLock() {
  try {
    return (await navigator.wakeLock?.request('screen')) ?? null;
  } catch {
    return null;
  }
}

// Permissie moet vanuit een user-gesture aangevraagd worden — start() wordt
// altijd door een tik op 'Timer starten' aangeroepen, dus dat is het juiste
// moment. Bij 'default' (nog nooit gevraagd) vragen, bij 'granted'/'denied'
// niets doen (denied respecteren, granted is al gedekt).
function vraagNotificatiePermissie() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
}

// Systeemnotificatie als vangnet voor als het geluid/de trilling gemist wordt
// omdat het scherm uit staat of een andere app op de voorgrond staat — dat is
// de situatie waarin een custom in-app UI (draggable widget e.d.) niet kan
// verschijnen; een OS-notificatie kan dat wel. Via de service worker i.p.v.
// de kale `Notification`-constructor: dat werkt ook op iOS (16.4+) als
// geïnstalleerde PWA, waar `new Notification()` altijd een fout geeft.
async function toonEindNotificatie() {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return;
    const registratie = await navigator.serviceWorker?.ready;
    await registratie?.showNotification('Rust voorbij', {
      body: 'Tijd voor de volgende set.',
      tag: 'lifecore-rust-timer',
      icon: '/icons/icon-192.png',
    });
  } catch {
    // Notificaties niet beschikbaar — geluid/trilling blijven de primaire signalen.
  }
}

export function useRustTimer(geluidFragment) {
  const [resterend, setResterend] = useState(0);
  const [totaal, setTotaal] = useState(0);
  const [actief, setActief] = useState(false);
  const intervalRef = useRef(null);
  // Wandklok-eindtijdstip (ms) i.p.v. alleen een teller die elke tick met 1
  // afneemt — op de achtergrond (scherm uit, andere app op voorgrond) wordt
  // setInterval door de browser zwaar gethrottled of soms een tijd helemaal
  // niet aangeroepen, waardoor 'resterend - 1 per tick' achter gaat lopen en
  // het eindsignaal te laat (of pas bij toeval) afgaat. Door terug te rekenen
  // vanaf een vast eindtijdstip klopt de teller altijd zodra er weer een tick
  // — of een visibilitychange — doorkomt, ook na een gemiste periode.
  const eindtijdRef = useRef(null);
  const tussensignaalRef = useRef(null);
  const tussenGespeeldRef = useRef(false);
  const wakeLockRef = useRef(null);
  const geluidFragmentRef = useRef(geluidFragment);
  geluidFragmentRef.current = geluidFragment;

  const laatWakeLockLos = useCallback(() => {
    wakeLockRef.current?.release?.().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    eindtijdRef.current = null;
    setActief(false);
    laatWakeLockLos();
  }, [laatWakeLockLos]);

  const tik = useCallback(() => {
    if (!eindtijdRef.current) return;
    const over = Math.max(0, Math.round((eindtijdRef.current - Date.now()) / 1000));
    const tussen = tussensignaalRef.current;
    if (tussen && !tussenGespeeldRef.current && over <= tussen.bijResterend) {
      tussenGespeeldRef.current = true;
      speelFragment(tussen.geluidFragment);
    }
    setResterend(over);
    if (over <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      eindtijdRef.current = null;
      setActief(false);
      speelFragment(geluidFragmentRef.current);
      trilBijEindeTimer();
      toonEindNotificatie();
      laatWakeLockLos();
    }
  }, [laatWakeLockLos]);

  // tussensignaal (optioneel): { bijResterend, geluidFragment } — speelt één
  // keer een eigen, los van het eindgeluid instelbaar fragment zodra de
  // timer dat aantal seconden resterend bereikt (bv. kin-naar-borst: signaal
  // bij 10s resterend van een 35s-timer = 25s erin).
  const start = useCallback((seconden, tussensignaal) => {
    clearInterval(intervalRef.current);
    setTotaal(seconden);
    setResterend(seconden);
    setActief(true);
    eindtijdRef.current = Date.now() + seconden * 1000;
    tussensignaalRef.current = tussensignaal ?? null;
    tussenGespeeldRef.current = false;
    vraagWakeLock().then((lock) => { wakeLockRef.current = lock; });
    vraagNotificatiePermissie();
    intervalRef.current = setInterval(tik, 1000);
  }, [tik]);

  const plus = useCallback((n) => {
    if (!eindtijdRef.current) return;
    const overNu = Math.max(0, (eindtijdRef.current - Date.now()) / 1000);
    const nieuweOver = Math.round(Math.min(overNu + n, MAX_SECONDEN));
    eindtijdRef.current = Date.now() + nieuweOver * 1000;
    setResterend(nieuweOver);
    setTotaal((t) => Math.max(t, nieuweOver));
  }, []);

  // Bij terugkeer naar de voorgrond direct bijwerken i.p.v. te wachten op de
  // volgende (mogelijk pas na seconden achterstallige) interval-tick — zo
  // mist de gebruiker het eindsignaal niet als de timer al afliep terwijl
  // het scherm uit stond. Ook de Wake Lock opnieuw aanvragen: browsers geven
  // 'm automatisch vrij zodra het tabblad verborgen raakt.
  useEffect(() => {
    function opZichtbaarheidWissel() {
      if (document.visibilityState !== 'visible' || !eindtijdRef.current) return;
      tik();
      if (!wakeLockRef.current) vraagWakeLock().then((lock) => { wakeLockRef.current = lock; });
    }
    document.addEventListener('visibilitychange', opZichtbaarheidWissel);
    return () => document.removeEventListener('visibilitychange', opZichtbaarheidWissel);
  }, [tik]);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    laatWakeLockLos();
  }, [laatWakeLockLos]);

  return { resterend, totaal, actief, start, stop, plus };
}
