# Rooted

Webshop voor Rooted. `index.html` is de hele website (inclusief foto's). De map `api/` bevat de beveiligde betaalfuncties (Mollie) en draait op Vercel.

## Bestanden
- `index.html` — de website
- `api/create-payment.js` — maakt de Mollie-betaling (Bancontact QR-code) aan. Prijzen en verzendkosten worden hier op de server berekend.
- `api/payment-status.js` — controleert of er betaald is
- `api/_shared.js` — prijzen en verzendtarieven (server)
- `stock.json` — uitverkochte producten
- `package.json` — nodig voor Vercel

## Mollie instellen (eenmalig)
1. Vercel > je project > Settings > Environment Variables
2. Naam: `MOLLIE_API_KEY`, waarde: je (nieuwe) Mollie API-sleutel. Zet de sleutel NOOIT in een bestand in deze repository.
3. Vercel > Deployments > Redeploy.
4. Mollie-dashboard: zet **Bancontact** aan onder Instellingen > Betaalmethoden.

## Verzendtarieven aanpassen
Op twee plaatsen, met dezelfde cijfers: `SHIP` in `index.html` (toont de prijs) en `SHIPPING` in `api/_shared.js` (rekent het echte bedrag).

## Uitverkocht markeren
Open de site met `#admin` achter het adres, markeer producten, download `stock.json` en vervang dat bestand in de repository.
