# Rooted

Website voor Rooted: stekstations en muurvaasjes. Gewone HTML-site, geen build nodig.

## Bestanden
- `index.html` — de hele website (instellingen staan bovenaan het script)
- `img/` — alle productfoto's
- `stock.json` — lijst met uitverkochte producten, bv. `{ "soldOut": ["muurvaasjes-mix"] }`

## Publiceren met GitHub Pages
1. Zet deze bestanden in een GitHub-repository.
2. Ga naar Settings > Pages, kies "Deploy from a branch", branch `main`, map `/ (root)`, en Save.
3. Na ongeveer een minuut staat de site op `https://<gebruikersnaam>.github.io/<repo>/`.

## Producten als uitverkocht markeren
1. Open de site met `#admin` achter het adres en vul de admincode in (`ADMIN_CODE` in `index.html`).
2. Markeer producten en klik "Download stock.json".
3. Vervang `stock.json` in de repository (Add file > Upload files). De site is binnen een minuut bijgewerkt.

## Instellingen in index.html
`ORDER_EMAIL`, `ORDER_ENDPOINT`, `BANK_IBAN`, `SHIPPING`, `FREE_SHIPPING_FROM`, `ADMIN_CODE`.
