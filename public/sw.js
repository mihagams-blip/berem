/**
 * Service worker — da igra teče tudi brez omrežja.
 *
 * NAMENOMA brez vnaprejšnjega seznama datotek. V prejšnjem projektu je bil prav
 * ročno vzdrževan seznam vir napak: manjkalo je sedemnajst modulov in nihče ni
 * opazil, ker manjkajoča datoteka odpove tiho. Tu se shrani tisto, kar je otrok
 * res odprl — po prvi igri je predpomnjeno vse, kar potrebuje, prvi obisk pa ne
 * povleče štirih megabajtov zvoka vnaprej.
 */

const CACHE = 'berem-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Ogrodje in seznam posnetkov najprej z omrežja, da nova objava pride do
  // otroka. Seznam posnetkov zato, ker se ob vsaki novi vsebini razširi — stara
  // različica bi pomenila, da novi zlogi tiho odpadejo.
  const networkFirst = req.mode === 'navigate' || url.pathname.endsWith('/audio/manifest.json');

  e.respondWith(
    (async () => {
      if (networkFirst) {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone());
          return fresh;
        } catch {
          return (await caches.match(req)) || (await caches.match('index.html')) || Response.error();
        }
      }

      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        // Odgovora, ki ni v redu, NE shranimo. Enkrat se je 404 za seznam
        // posnetkov zapekel v predpomnilnik in govor je trajno utihnil.
        if (res.ok && res.type === 'basic') (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch {
        return Response.error();
      }
    })()
  );
});
