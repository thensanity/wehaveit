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

## Load the extension

1. Chrome → `chrome://extensions`
2. Developer mode on
3. Load unpacked → select the `extension` folder
4. Open a Shopee product, or use the demo shop first
