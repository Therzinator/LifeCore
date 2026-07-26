import { useCallback, useEffect, useRef, useState } from 'react';

const BREEDTE = 300;
const HOOGTE = 150;

function pipOndersteund() {
  return typeof document !== 'undefined'
    && Boolean(document.pictureInPictureEnabled)
    && typeof HTMLVideoElement !== 'undefined'
    && 'requestPictureInPicture' in HTMLVideoElement.prototype;
}

function tekenFrame(ctx, resterend, totaal, label) {
  ctx.fillStyle = '#0A0A0B';
  ctx.fillRect(0, 0, BREEDTE, HOOGTE);
  const minuten = Math.floor(resterend / 60);
  const seconden = resterend % 60;
  ctx.fillStyle = '#C8FF47';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${minuten}:${seconden < 10 ? '0' : ''}${seconden}`, BREEDTE / 2, HOOGTE / 2 - 8);
  ctx.fillStyle = '#F0F0F4';
  ctx.font = '18px sans-serif';
  ctx.fillText(label, BREEDTE / 2, HOOGTE / 2 + 42);
  if (totaal) {
    const pct = Math.max(0, Math.min(1, (totaal - resterend) / totaal));
    ctx.fillStyle = '#1E1E24';
    ctx.fillRect(20, HOOGTE - 16, BREEDTE - 40, 6);
    ctx.fillStyle = '#C8FF47';
    ctx.fillRect(20, HOOGTE - 16, (BREEDTE - 40) * pct, 6);
  }
}

// Video-element Picture-in-Picture is de enige webtechniek die een écht
// systeem-eigen zwevend venster geeft dat over andere apps/het startscherm
// heen blijft staan (op Android; op een geïnstalleerde iOS-PWA blokkeert
// WebKit requestPictureInPicture() met een fout — daarom hard afhankelijk
// van pipOndersteund() i.p.v. een blind aanroepen-en-hopen). De truc: een
// <canvas> met de countdown wordt via captureStream() als 'videobron'
// aangeboden aan een verborgen <video>, waarna PiP daarop wordt aangevraagd.
// activeer() MOET binnen een echte user-gesture (klik/tik) aangeroepen
// worden — de Picture-in-Picture-API weigert 'm anders stilzwijgend.
export function usePipTimer(resterend, totaal, label) {
  const [actief, setActief] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  function elementen() {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = BREEDTE;
      canvas.height = HOOGTE;
      canvasRef.current = canvas;
    }
    if (!videoRef.current) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.addEventListener('leavepictureinpicture', () => setActief(false));
      videoRef.current = video;
    }
    return { canvas: canvasRef.current, video: videoRef.current };
  }

  const activeer = useCallback(() => {
    if (!pipOndersteund()) return;
    const { canvas, video } = elementen();
    tekenFrame(canvas.getContext('2d'), resterend, totaal, label);
    if (!video.srcObject) video.srcObject = canvas.captureStream(1);
    video.play()
      .then(() => video.requestPictureInPicture())
      .then(() => setActief(true))
      .catch(() => setActief(false));
  }, [resterend, totaal, label]);

  const sluiten = useCallback(() => {
    if (document.pictureInPictureElement === videoRef.current) document.exitPictureInPicture().catch(() => {});
  }, []);

  // Zolang het PiP-venster open staat, elke wijziging van de countdown
  // opnieuw op het canvas tekenen — de video-stream neemt die frames vanzelf
  // over (captureStream houdt de laatst getekende inhoud vast).
  useEffect(() => {
    if (!actief || !canvasRef.current) return;
    tekenFrame(canvasRef.current.getContext('2d'), resterend, totaal, label);
  }, [actief, resterend, totaal, label]);

  useEffect(() => () => {
    if (document.pictureInPictureElement === videoRef.current) document.exitPictureInPicture().catch(() => {});
  }, []);

  return { ondersteund: pipOndersteund(), actief, activeer, sluiten };
}
