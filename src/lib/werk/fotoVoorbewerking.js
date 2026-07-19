// Client-side voorverwerking vóór upload: her-encoderen via canvas strip
// EXIF/GPS-metadata (privacy) en schaalt grote camera-foto's terug — een
// canvas-toBlob-cyclus behoudt geen EXIF, dat is precies het mechanisme,
// geen aparte EXIF-parser nodig.
const MAX_AFMETING = 1600;

export function verwerkFoto(bestand) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(bestand);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_AFMETING || height > MAX_AFMETING) {
        const schaal = MAX_AFMETING / Math.max(width, height);
        width = Math.round(width * schaal);
        height = Math.round(height * schaal);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error('Kon foto niet verwerken')); return; }
        resolve(new File([blob], bestand.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Kon foto niet laden')); };
    img.src = url;
  });
}
