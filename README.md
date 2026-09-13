# WeHaveIt

Chrome extension that warns you if you already bought the item, on most shopping sites.

## Chrome Web Store package

Upload `store/wehaveit.zip` in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole). Copy-paste fields from `store/LISTING.txt`.

Privacy policy (after GitHub Pages is on): https://thensanity.github.io/wehaveit/privacy.html

## Run the site

```powershell
python -m http.server 4173
```

Open http://127.0.0.1:4173/website/index.html and http://127.0.0.1:4173/website/demo.html

## Paddle Pro (SGD 15/month)

The site overlay checkout is in `website/index.html`. After payment, `website/success.html` plus the extension unlock unlimited items.

Sandbox catalog is connected (`website/paddle-config.js` uses a `test_` token). Test with [Paddle sandbox cards](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-cards) — not a real card.

When you are ready to take real money:

1. Finish Paddle seller verification on live (identity + website).
2. Recreate the same product/price in the live dashboard, then a `live_` client-side token.
3. Set `environment: "live"` and paste the live token + `pri_…` into `website/paddle-config.js`.
4. Approve checkout domain `thensanity.github.io` on live as well.

Sandbox IDs already in config:

- Product: `pro_01m2dmytjefvpk87hg8w70etch`
- Price: `pri_01m2dn94dgskw7tas08ap34eyj` (SGD 15.00 / month)
- Default payment link: `https://thensanity.github.io/wehaveit/website/success.html`

Push GitHub Pages after changing config so Buy Pro works on the public site. Local checkout at `http://127.0.0.1:4173/website/` also needs `localhost` / `127.0.0.1` approved in Paddle Website Approval.

## Load the extension

1. Chrome → `chrome://extensions`
2. Developer mode on
3. Load unpacked → select the `extension` folder
4. Open a Shopee product, or use the demo shop first
