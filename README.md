# Rooted

Webshop voor Rooted. `index.html` is de hele website (inclusief foto's). De map `api/` bevat de beveiligde betaalfuncties (Mollie) en draait op Vercel.

## Bestanden (alles moet in de hoofdmap van de repository staan)
- `index.html` — de website
- `api/create-payment.js`, `api/payment-status.js`, `api/health.js`, `api/_shared.js` — betaalfuncties
- `stock.json` — uitverkochte producten
- `package.json` — nodig voor Vercel

## Controleren of de betaling werkt
Open `https://JOUW-SITE.vercel.app/api/health`
- Je ziet `{"functionsDeployed":true, "mollieKeyConfigured":true ...}` → alles staat goed.
- `mollieKeyConfigured:false` → voeg `MOLLIE_API_KEY` toe bij Vercel > Settings > Environment Variables en klik Redeploy.
- Pagina niet gevonden (404) → de map `api` staat niet in de repository.

## Mollie
Zet de sleutel NOOIT in een bestand. Zet Bancontact aan in het Mollie-dashboard (Instellingen > Betaalmethoden).

## Verzendtarieven aanpassen
Op twee plaatsen, met dezelfde cijfers: `SHIP` in `index.html` (toont de prijs) en `SHIPPING` in `api/_shared.js` (rekent het echte bedrag).
