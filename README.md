# Rooted

Website voor Rooted: stekstations en muurvaasjes. Gewone HTML-site, geen build nodig.

## Bestanden
- `index.html` — de hele website, inclusief alle foto's (niets anders nodig)
- `stock.json` — lijst met uitverkochte producten, bv. `{ "soldOut": ["stekstation-hout"] }`

## Uitverkocht markeren
1. Open de site met `#admin` achter het adres en vul de admincode in (`ADMIN_CODE` in `index.html`).
2. Markeer producten en klik "Download stock.json".
3. Vervang `stock.json` in de repository. De site is binnen een minuut bijgewerkt.

## Instellingen in index.html
`ORDER_EMAIL`, `ORDER_ENDPOINT`, `BANK_IBAN`, `SHIPPING`, `FREE_SHIPPING_FROM`, `ADMIN_CODE`, `SOLD_OUT_DEFAULT`.
