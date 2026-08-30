# CustomSneaks GH

Static shop with a real admin at `/admin`. No server, no database, no Node.
Cloudflare Pages serves the files; the admin writes changes straight back into
this repository and Cloudflare redeploys.

```
index.html              the shop
admin/                  the admin portal (Sveltia CMS)
data/products.json      every pair — written by the admin
data/settings.json      contact, drop, front-page copy — written by the admin
assets/img/             product photos — uploaded through the admin
assets/css/site.css     styling
assets/js/shop.js       cart, filters, WhatsApp links
_headers                Cloudflare caching rules
```

You edit **nothing by hand** once this is set up. Everything goes through
`customsneaksgh.urbanstudioz.com/admin`.

---

## Part 1 — repo and site (do this first)

1. **GitHub** → new repository named `customsneaks`, public, no README.
   Then **uploading an existing file** and drag in everything from this folder,
   folders included. Commit.

2. **Cloudflare → Workers & Pages → Create application → Pages → Connect to Git**,
   pick `customsneaks`.

   | Field | Value |
   |---|---|
   | Framework preset | None |
   | Build command | *leave empty* |
   | Build output directory | `/` |

3. **Save and Deploy.** Check the `.pages.dev` URL shows the shop.

4. **Custom domains → Set up a custom domain →** `customsneaksgh.urbanstudioz.com`
   → Activate. Cloudflare adds the DNS record itself.

The shop is now live. The admin needs three more steps, once.

---

## Part 2 — turning on the admin

The admin runs entirely in your browser, but signing in with GitHub needs a tiny
relay in the middle. Cloudflare runs it free. You do this once and never again.

### 2a. Deploy the sign-in Worker

Open **https://github.com/sveltia/sveltia-cms-auth** and click the
**Deploy to Cloudflare Workers** button in the README. Sign in, accept the
defaults.

When it finishes, copy the Worker's URL. It looks like:

```
https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev
```

### 2b. Register a GitHub OAuth app

Go to **https://github.com/settings/applications/new**

| Field | Value |
|---|---|
| Application name | `CustomSneaks Admin` |
| Homepage URL | `https://customsneaksgh.urbanstudioz.com` |
| Authorization callback URL | `<your Worker URL>/callback` |

The callback URL must end in `/callback`. Register, then copy the **Client ID**,
and click **Generate a new client secret** and copy that too. The secret is shown
once — if you lose it, generate another.

### 2c. Give the Worker the keys

Cloudflare → **Workers & Pages** → the `sveltia-cms-auth` worker →
**Settings → Variables and Secrets**. Add:

| Name | Value | Type |
|---|---|---|
| `GITHUB_CLIENT_ID` | your Client ID | Text |
| `GITHUB_CLIENT_SECRET` | your client secret | **Secret / encrypted** |
| `ALLOWED_DOMAINS` | `customsneaksgh.urbanstudioz.com` | Text |

Save and deploy.

`ALLOWED_DOMAINS` matters — without it, anyone who finds your Worker URL can use
it to start a sign-in flow. With it, only your own site can.

### 2d. Point the admin at both

Edit `admin/config.yml` in your repo (pencil icon on GitHub) and fix the two
lines marked `CHANGE ME`:

```yaml
backend:
  name: github
  repo: manassehafenyah/customsneaks                              # your repo
  branch: main
  base_url: https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev   # your Worker
```

Commit. Wait for the deploy, then open
**customsneaksgh.urbanstudioz.com/admin** and click **Sign in with GitHub**.

---

## Using the admin

**Products → The vault** is the list of every pair. Click one to open it, or
**Add pair** at the top. Drag rows to reorder — top of the list shows first on
the shop.

Per pair: model, colorway, photo, price, sizes, category, style code, year,
condition, badge, and a **Show on the shop** switch for hiding a pair without
deleting it.

- **Price** is cedis, digits only. The shop adds the GH₵ and the comma.
- **Sizes** is one row per US size. Delete a row when that size sells.
- **Photo** — drag it in. It uploads to `assets/img/` and is committed with your
  change. Shrink anything over about 1 MB first ([squoosh.app](https://squoosh.app),
  quality 80) — big photos are slow on mobile data. Landscape crops best.

**Shop settings** holds your WhatsApp number, phone, the front-page headline and
intro, the next drop and its countdown, the delivery note, and the ticker lines.

Every save is a commit to this repo, so Cloudflare rebuilds automatically —
about 30 seconds, then refresh the shop. Nothing is ever lost: GitHub keeps the
full history, and any change can be reverted from the repo's **History**.

---

## Who can get in

Anyone with **write access to the GitHub repository**. That's you, and anyone
you explicitly add under **Settings → Collaborators**. The `/admin` page itself
is public — that's fine and normal, because it's an empty shell until GitHub
authenticates you. Without repo write access, signing in gets you nowhere.

To hand access to someone, add them as a collaborator on the repo. To take it
away, remove them.

---

## Editing by hand, if you ever need to

The admin is a friendlier face on two plain files: `data/products.json` and
`data/settings.json`. You can edit either directly on GitHub if the admin is
ever unavailable. If a hand edit breaks the JSON the shop will go blank — open
the file's **History** and revert.

---

## Still to do

Prices in `data/products.json` are estimates, not yours. Check every one.
