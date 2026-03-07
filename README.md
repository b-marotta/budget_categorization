# Budget Categorization

## PWA

Il progetto è configurato come Progressive Web App con:

- manifest in `app/manifest.ts`
- service worker in `public/sw.js`
- registrazione service worker in `components/pwa/service-worker-register.tsx`
- fallback offline in `app/offline/page.tsx`
- icone PWA in `public/icons`

### Verifica rapida

1. Avvia in produzione:

```bash
npm run build
npm run start
```

2. Apri `http://localhost:3000` in Chrome.
3. DevTools → Application:
    - controlla `Manifest`
    - controlla `Service Workers` (attivo)
4. Simula offline dal tab Network e ricarica una pagina: dovresti vedere la pagina `/offline` se la risorsa non è in cache.

### Nota sicurezza dati

Le chiamate a `/api/*` sono impostate in modalità network-only nel service worker per evitare cache persistente di dati finanziari sensibili.

### Lighthouse (checklist veloce)

1. Avvia app in produzione (`npm run build && npm run start`).
2. Apri Chrome DevTools → Lighthouse.
3. Seleziona almeno categoria `PWA` (puoi includere anche `Performance` e `Best Practices`).
4. Esegui audit su `/` e su una pagina protetta (es. `/home`).

Controlli attesi:

- Web app manifest valido
- Service worker registrato e controllante la pagina
- Pagina offline raggiungibile quando la rete non è disponibile
- Icone app presenti (192 e 512)
- Applicazione installabile da browser compatibili
