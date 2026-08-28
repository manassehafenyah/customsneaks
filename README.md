# CustomSneaks GH

The shop. Plain HTML, CSS and JavaScript — no build step, no framework, nothing
to install. Cloudflare Pages serves these files exactly as they are.

```
index.html              the page
favicon.svg             the tab icon
_headers                caching rules for Cloudflare
assets/css/site.css     all the styling
assets/js/products.js   ← the only file you edit day to day
assets/js/shop.js       cart, filters, quick view, WhatsApp links
assets/img/             product photos
```

---

## Part 1 — put it on GitHub

You only do this once.

1. Sign up at [github.com](https://github.com) if you haven't.
2. Click **+** (top right) → **New repository**. Name it `customsneaks`. Leave it
   **Public** (Cloudflare's free plan works either way, public is simpler).
   Don't tick "Add a README" — this folder already has one.
3. On the empty repository page, click **uploading an existing file**.
4. Drag in **everything from this folder**, keeping the folder structure —
   `index.html`, `favicon.svg`, `_headers`, and the whole `assets` folder.
   GitHub keeps the folders as long as you drag the folders themselves rather
   than opening them first.
5. Click **Commit changes**.

## Part 2 — connect Cloudflare

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) — you likely
   already have an account, since your DNS is there.
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab →
   **Connect to Git**.
3. Authorise GitHub, pick the `customsneaks` repository, click **Begin setup**.
4. Build settings — this is the part people get wrong:

   | Field | Value |
   |---|---|
   | Framework preset | **None** |
   | Build command | **leave completely empty** |
   | Build output directory | **/** (just a slash) |

   There's no build step. If you put anything in the build command it will fail.
5. **Save and Deploy.** About a minute later you get a live URL like
   `customsneaks.pages.dev`. Open it and check the shop looks right.

## Part 3 — put it on your own domain

1. In your new Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `customsneaks.urbanstudioz.com` → **Continue** → **Activate domain**.

Because `urbanstudioz.com` is already on Cloudflare, it adds the DNS record and
issues the certificate itself. Nothing to do at your registrar, and nothing on
cPanel changes — `urbanstudioz.com` stays exactly where it is. Give it a few
minutes, then visit `https://customsneaks.urbanstudioz.com`.

---

## Updating the shop

This is the part you'll do often, and it's all on github.com — no software on
your computer.

### Change a price, or add a pair

1. Go to your repository → `assets` → `js` → **products.js**
2. Click the **pencil icon** (top right of the file)
3. Edit the line you want
4. Scroll down, click **Commit changes**

Cloudflare rebuilds automatically. Refresh the shop about 30 seconds later.

Each pair is one line. To add one, copy an existing line, paste it below, and
change the details:

```js
{ id:"aj1-unc", family:"jordan", fam:"Jordan", name:"Air Jordan 1 High OG",
  sub:"University Blue", code:"555088-134", year:"2021", cond:"Deadstock",
  price:6800, sizes:[8,9,10,11], flag:"", image:"assets/img/unc.jpg" },
```

- **price** is in cedis, no commas, no GH₵ — just `6800`
- **sizes** is the list of US sizes you have; remove one when it sells
- **flag** is the corner badge — `"Grail"`, `"1 of 1"`, `""` for none
- **image** points at a file in `assets/img/`. Leave it `""` and the card shows
  a labelled placeholder instead
- **family** and **fam** control the filter buttons. Reuse an existing pair's
  values to file it under the same category, or invent a new one and a new
  filter button appears by itself

Keep every comma and quote mark exactly where it is. If the shop goes blank
after an edit, you removed one — undo by opening the file's **History** and
reverting the last commit.

### Add a photo

1. Repository → `assets` → `img` → **Add file** → **Upload files**
2. Drag the photo in, click **Commit changes**
3. Edit `products.js` and point the pair at it:
   `image:"assets/img/whatever-you-named-it.jpg"`

Shrink big photos first — anything over about 1 MB slows the shop down badly on
mobile data. [squoosh.app](https://squoosh.app) does it in the browser: drop the
photo in, drag quality to about 80, download. Landscape shots crop best.

### Change your WhatsApp number, or the words on the page

Top of `products.js` for the number and phone. The headline, intro and the three
authentication steps are in `index.html` — same pencil-icon routine.

---

## What still needs doing

The `SHOP` block at the top of `products.js` has a **placeholder WhatsApp
number**. Until you change it, the order button opens a chat with nobody.

```js
const SHOP = {
  name: "CustomSneaks GH",
  whatsapp: "233000000000",   // digits only, country code, no + or spaces
  phone: "+233 00 000 0000"
};
```

Prices are my estimates, not yours. Check every one.
