# Rooted

Webshop voor Rooted. `index.html` is de hele website (inclusief foto's). De map `api/` bevat de beveiligde betaalfuncties (Mollie) en draait op Vercel.

## Bestanden (alles moet in de hoofdmap van de repository staan)
- `index.html` — de website
- `api/create-payment.js`, `api/payment-status.js`, `api/health.js`, `api/_shared.js` — betaalfuncties
- `stock.json` — uitverkochte producten
- `package.json` en `vercel.json` — nodig voor Vercel (`vercel.json` laat de build duidelijk mislukken als de map `api` ontbreekt, in plaats van stil een 404 te geven)

## Controleren of de betaling werkt
Open `https://JOUW-SITE.vercel.app/api/health`
- Je ziet `{"functionsDeployed":true, "mollieKeyConfigured":true ...}` → alles staat goed.
- `mollieKeyConfigured:false` → voeg `MOLLIE_API_KEY` toe bij Vercel > Settings > Environment Variables en klik Redeploy.
- Pagina niet gevonden (404) → de map `api` staat niet in de repository.

## Mollie
Zet de sleutel NOOIT in een bestand. Zet Bancontact aan in het Mollie-dashboard (Instellingen > Betaalmethoden).

## Verzendtarieven aanpassen
Op twee plaatsen, met dezelfde cijfers: `SHIP` in `index.html` (toont de prijs) en `SHIPPING` in `api/_shared.js` (rekent het echte bedrag).

## Kortingscodes

Je maakt ze aan in Vercel: Settings > Environment Variables > naam `DISCOUNT_CODES`.
Formaat (gescheiden door komma's): `CODE=type:waarde`

- `TESTPAY=total:0.01` : de HELE bestelling (producten + verzending) kost 0,01 euro
- `WELCOME10=percent:10` : 10% korting op de producten
- `FIVEOFF=off:5` : 5 euro korting op de producten

Voorbeeld van de waarde: `TESTPAY=total:0.01,WELCOME10=percent:10`
Na het opslaan: Deployments > Redeploy. Hoofdletters maken niet uit. De codes staan niet in GitHub.
