/* ------------------------------------------------------------------
   shop.js — the storefront.

   Products and settings are loaded from data/products.json and
   data/settings.json, which the admin at /admin writes for you.
   You shouldn't need to edit this file.
------------------------------------------------------------------- */

const [SETTINGS, CATALOGUE] = await Promise.all([
  fetch("data/settings.json?v=" + Date.now()).then(r => r.json()),
  fetch("data/products.json?v="  + Date.now()).then(r => r.json())
]);

const SHOP = {
  name: SETTINGS.shopName,
  whatsapp: SETTINGS.whatsapp,
  phone: SETTINGS.phone
};

const CATEGORY_LABELS = {
  sneakers: "Sneakers", shoes: "Shoes", slippers: "Slippers & slides",
  caps: "Caps", headwear: "Headwear", jackets: "Jackets",
  apparel: "Apparel", accessories: "Accessories", customs: "Customs", other: "Other",
  // categories from the earlier sneaker-only setup, so old entries still show
  custom: "Customs", af1: "Air Force 1", jordan: "Jordan", dunk: "Dunk", airmax: "Air Max"
};

const slug = t => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const strip = u => String(u || "").replace(/^\//, "");
// a CMS list can arrive as ["a","b"] or [{src:"a"},{line:"b"}] — take either
const flat = v => (Array.isArray(v) ? v : [])
  .map(x => (x && typeof x === "object") ? (x.src ?? x.line ?? x.size ?? Object.values(x)[0]) : x)
  .filter(x => x !== undefined && x !== null && x !== "")
  .map(String);

const PRODUCTS = (CATALOGUE.products || [])
  .filter(p => p.visible !== false)
  .map((p, i) => {
    const d = p.details || {};
    const images = flat(p.images).map(strip).filter(Boolean);
    return {
      id: slug(p.name + "-" + (p.colorway || "")) || "pair-" + i,
      family: p.category || "other",
      fam: CATEGORY_LABELS[p.category] || "Other",
      name: p.name || "",
      sub: p.colorway || "",
      code: d.styleCode || "",
      year: d.year || "",
      cond: d.condition || "",
      price: Number(p.price) || 0,
      flag: p.badge || "",
      images,
      image: images[0] || "",
      video: strip(p.video),
      // footwear and clothing sizes come from separate tick-lists;
      // `sizes` is the older single list, kept so nothing breaks
      sizes: [...flat(p.shoeSizes), ...flat(p.apparelSizes), ...flat(p.sizes)]
    };
  });

const DATA = { drop_at: SETTINGS.dropAt || "", ticker: flat(SETTINGS.ticker) };

/* settings-driven text on the page */
document.title = SETTINGS.shopName + (SETTINGS.tagline ? " — " + SETTINGS.tagline : "");
document.querySelectorAll("[data-s]").forEach(el => {
  const v = SETTINGS[el.dataset.s];
  if (v !== undefined) el.textContent = v;
});
document.getElementById("footLine").textContent =
  "★ Built in Accra · © " + new Date().getFullYear() + " " + SETTINGS.shopName + " · " + SETTINGS.footerNote;

/* home page clip — silent, looping, behind the headline */
(() => {
  const src = strip(SETTINGS.heroVideo);
  if (!src) return;                                  // no clip, keep the plain background
  const hero = document.querySelector(".hero");
  const star = document.querySelector(".star-mark");
  const still = strip(SETTINGS.heroPoster);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const v = document.createElement("video");
  v.className = "hero__clip";
  v.muted = true;                                    // required for autoplay everywhere
  v.defaultMuted = true;
  v.loop = true;
  v.playsInline = true;
  v.setAttribute("playsinline", "");
  v.setAttribute("aria-hidden", "true");
  v.preload = "metadata";
  if (still) v.poster = still;

  // if the device asks for reduced motion and we have a still, show that instead
  const holdStill = calm && still;
  if (!holdStill) { v.autoplay = true; v.src = src; }

  hero.classList.add("hero--clip");
  if (star) star.remove();
  hero.insertBefore(v, hero.firstChild);
  if (!holdStill) v.play().catch(() => {});           // a refused autoplay just leaves the poster
})();

/* category filter buttons, for categories that have stock */
(() => {
  const bar = document.getElementById("filters");
  const seen = new Map();
  PRODUCTS.forEach(p => seen.set(p.family, p.fam));
  [...seen].reverse().forEach(([slug, label]) => {
    const b = document.createElement("button");
    b.className = "filter";
    b.dataset.family = slug;
    b.setAttribute("aria-pressed", "false");
    b.textContent = label;
    bar.insertBefore(b, bar.firstElementChild.nextSibling);
  });
})();

const money = n => "GH₵" + n.toLocaleString("en-GH");
const $ = s => document.querySelector(s);
const sizeLabel = z => /^one size$/i.test(z) ? "One size" : "Size " + z;

/* ---------- whatsapp + call ---------- */
const waLink = msg => "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent(msg);
const telLink = "tel:" + SHOP.phone.replace(/[^\d+]/g, "");
const generalMsg = "Hi " + SHOP.name + " — I have a question about an item.";
$("#waFloat").href = waLink(generalMsg);
$("#footWa").href = waLink(generalMsg);
$("#footCall").href = telLink;
$("#callBtn").href = telLink;

/* ---------- ticker ---------- */
const items = DATA.ticker.length ? DATA.ticker : ["Order on WhatsApp or call"];
$("#ticker").innerHTML = [...items, ...items].map(t => "<span>" + t + "</span>").join("");

/* ---------- countdown to next Friday 12:00 ---------- */
function nextFriday(){
  const d = new Date();
  d.setHours(12,0,0,0);
  let add = (5 - d.getDay() + 7) % 7;
  if (add === 0 && Date.now() > d.getTime()) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}
function dropTarget(){
  if (DATA.drop_at){
    const d = new Date(DATA.drop_at);
    if (!isNaN(d) && d > Date.now()) return d;
  }
  return nextFriday();
}
let target = dropTarget();
function tick(){
  let ms = target - Date.now();
  if (ms <= 0){ target = dropTarget(); ms = target - Date.now(); }
  const s = Math.floor(ms/1000);
  const p = n => String(n).padStart(2,"0");
  $("#cd").textContent = p(Math.floor(s/86400));
  $("#ch").textContent = p(Math.floor(s%86400/3600));
  $("#cm").textContent = p(Math.floor(s%3600/60));
  $("#cs").textContent = p(s%60);
}
tick(); setInterval(tick, 1000);

/* ---------- grid ---------- */
let filter = "all", sort = "new";
function shotHTML(p){
  if (p.image) return '<img src="' + p.image + '" alt="' + p.name + ' ' + p.sub + '" loading="lazy">';
  return '<div class="slot"><em>photo coming soon</em></div>';
}
function mediaHTML(p){
  const slides = [
    ...p.images.map(src => '<img class="slide" src="' + src + '" alt="' + p.name + ' ' + p.sub + '">'),
    ...(p.video ? ['<video class="slide" src="' + p.video + '" controls playsinline preload="metadata"></video>'] : [])
  ];
  if (!slides.length) return '<div class="slot"><em>photo coming soon</em></div>';

  const many = slides.length > 1;
  const isClip = i => p.video && i === slides.length - 1;

  const arrows = many
    ? '<button class="navarrow navarrow--prev" data-step="-1" aria-label="Previous photo">‹</button>' +
      '<button class="navarrow navarrow--next" data-step="1" aria-label="Next photo">›</button>'
    : "";

  const dots = many
    ? '<div class="dots">' + slides.map((_, i) =>
        '<button class="dot' + (i === 0 ? ' on' : '') + '" data-slide="' + i + '" aria-label="Photo ' + (i+1) + '"></button>'
      ).join("") + '</div>'
    : "";

  const thumbs = many
    ? '<div class="thumbs">' + slides.map((_, i) =>
        '<button class="thumb' + (i === 0 ? ' on' : '') + '" data-slide="' + i + '" aria-label="View ' +
        (isClip(i) ? 'clip' : 'photo ' + (i + 1)) + '">' +
        (isClip(i) ? '<span class="thumb__play">▶</span>' : '<img src="' + p.images[i] + '" alt="">') +
        '</button>').join("") + '</div>'
    : "";

  return '<div class="slides">' +
    slides.map((html, i) => '<div class="slide-wrap' + (i === 0 ? ' on' : '') + '">' + html + '</div>').join("") +
    arrows + dots + '</div>' + thumbs;
}

/* ---------- gallery navigation ---------- */
let slideAt = 0;

function showSlide(i){
  const shot = $("#modalShot");
  const wraps = shot.querySelectorAll(".slide-wrap");
  if (!wraps.length) return;
  slideAt = (i + wraps.length) % wraps.length;
  wraps.forEach((w, n) => w.classList.toggle("on", n === slideAt));
  shot.querySelectorAll(".thumb").forEach((b, n) => b.classList.toggle("on", n === slideAt));
  shot.querySelectorAll(".dot").forEach((b, n) => b.classList.toggle("on", n === slideAt));
  const v = shot.querySelector("video");
  if (v && !v.paused) v.pause();
}

const stepSlide = d => showSlide(slideAt + d);


function render(){
  let list = PRODUCTS
    .filter(p => p.visible !== false)                       // hide without deleting
    .filter(p => filter === "all" || p.family === filter);
  if (sort === "low") list = [...list].sort((a,b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a,b) => b.price - a.price);
  const grid = $("#grid");
  if (!list.length){ grid.innerHTML = PRODUCTS.length
      ? '<p class="empty">Nothing in that category right now.</p>'
      : '<p class="empty">The vault is being restocked. New stock lands here shortly — message us on WhatsApp for what\'s in hand today.</p>';
    return; }
  grid.innerHTML = list.map(p => `
    <article class="card" data-open="${p.id}" tabindex="0" role="button"
             aria-label="View ${p.name} ${p.sub}">
      <div class="card__shot">
        ${p.flag ? '<span class="chip card__flag">' + p.flag + '</span>' : ''}
        ${(p.images.length > 1 || p.video) ? '<span class="card__more">' + (p.video ? '▶ ' : '') + (p.images.length || 1) + '</span>' : ''}
        ${shotHTML(p)}
      </div>
      <div class="card__body">
        <div class="card__code"><span>${p.code}</span><span>${p.cond}</span></div>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__sub">${p.sub}</p>
        <div class="sizes">${p.sizes.slice(0,6).map(s => '<span class="size">' + s + '</span>').join("")}${p.sizes.length > 6 ? '<span class="size">+' + (p.sizes.length-6) + '</span>' : ''}</div>
        <div class="card__foot">
          <span class="price">${money(p.price)}</span>
          <span class="link-btn">Select size</span>
        </div>
      </div>
    </article>`).join("");
}
render();

$("#filters").addEventListener("click", e => {
  const b = e.target.closest(".filter");
  if (!b) return;
  if (b.id === "sortBtn"){
    sort = sort === "new" ? "low" : sort === "low" ? "high" : "new";
    b.textContent = "Sort: " + (sort === "new" ? "Newest" : sort === "low" ? "Price ↑" : "Price ↓");
    b.setAttribute("aria-pressed", sort !== "new");
    render(); return;
  }
  filter = b.dataset.family;
  document.querySelectorAll("#filters .filter[data-family]").forEach(f => f.setAttribute("aria-pressed", f === b));
  render();
});

/* ---------- quick view ---------- */
let current = null, pickedSize = null, lastFocus = null;
function openModal(id){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  current = p; pickedSize = null; lastFocus = document.activeElement;
  $("#modalShot").innerHTML = mediaHTML(p);
  slideAt = 0;
  $("#modalFamily").textContent = p.fam;
  $("#modalName").textContent = p.name;
  $("#modalSub").textContent = p.sub;
  const spec = (el, value) => {
    $(el).textContent = value || "";
    $(el).closest(".spec").hidden = !value;      // no value, no row
  };
  spec("#modalCode", p.code);
  spec("#modalCond", p.cond);
  spec("#modalYear", p.year);
  $("#modalPrice").textContent = money(p.price);
  $("#modalSizes").innerHTML = p.sizes.map(s => '<button class="size size--pick" data-size="' + s + '" aria-pressed="false">' + s + '</button>').join("");
  $("#modalAdd").disabled = true;
  $("#modalAsk").href = waLink("Hi " + SHOP.name + ", is the " + p.name + " \"" + p.sub + "\" (" + p.code + ") still available? Sizes I need: ");
  $("#modal").classList.add("on");
  $("#scrim").classList.add("on");
  $("#closeModal").focus();
}
$("#grid").addEventListener("click", e => {
  const b = e.target.closest("[data-open]");
  if (b) openModal(b.dataset.open);
});
$("#grid").addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const b = e.target.closest("[data-open]");
  if (!b) return;
  e.preventDefault();
  openModal(b.dataset.open);
});
$("#modalSizes").addEventListener("click", e => {
  const b = e.target.closest(".size--pick");
  if (!b) return;
  pickedSize = b.dataset.size;
  document.querySelectorAll("#modalSizes .size--pick").forEach(s => s.setAttribute("aria-pressed", s === b));
  $("#modalAdd").disabled = false;
});
function closeModal(){
  const v = $("#modalShot").querySelector("video");
  if (v) v.pause();
  $("#modal").classList.remove("on");
  if (!$("#drawer").classList.contains("on")) $("#scrim").classList.remove("on");
  if (lastFocus) lastFocus.focus();
}
$("#modalShot").addEventListener("click", e => {
  const arrow = e.target.closest("[data-step]");
  if (arrow) return stepSlide(Number(arrow.dataset.step));
  const pick = e.target.closest("[data-slide]");
  if (pick) showSlide(Number(pick.dataset.slide));
});

/* swipe on touch, ignoring the video so its controls still work */
(() => {
  let x0 = null;
  const shot = $("#modalShot");
  shot.addEventListener("touchstart", e => {
    x0 = e.target.closest("video") ? null : e.changedTouches[0].clientX;
  }, { passive: true });
  shot.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) stepSlide(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
})();

$("#closeModal").addEventListener("click", closeModal);

/* ---------- cart ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("customsneaks-cart") || "[]"); } catch (e) { cart = []; }
function save(){ try { localStorage.setItem("customsneaks-cart", JSON.stringify(cart)); } catch (e) {} }

function drawCart(){
  const body = $("#cartBody");
  $("#cartCount").textContent = cart.length;
  if (!cart.length){
    body.innerHTML = '<p class="empty" style="padding:2rem 0">Your cart is empty. Pick a pair from the vault.</p>';
  } else {
    body.innerHTML = cart.map((c,i) => {
      const p = PRODUCTS.find(x => x.id === c.id);
      return `<div class="line">
        <div class="line__thumb">${p.image ? '<img src="' + p.image + '" alt="">' : ''}</div>
        <div>
          <div class="line__name">${p.name}</div>
          <div class="line__meta">${p.sub} · ${sizeLabel(c.size)}</div>
          <button class="remove" data-remove="${i}">Remove</button>
        </div>
        <div class="line__price">${money(p.price)}</div>
      </div>`;
    }).join("");
  }
  const sum = cart.reduce((t,c) => t + PRODUCTS.find(x => x.id === c.id).price, 0);
  $("#subtotal").textContent = money(sum);

  const btn = $("#checkout");
  if (cart.length){
    const lines = cart.map((c,i) => {
      const p = PRODUCTS.find(x => x.id === c.id);
      return (i+1) + ". " + p.name + " \"" + p.sub + "\" — " + sizeLabel(c.size) + " — " + money(p.price) + (p.code ? " [" + p.code + "]" : "");
    });
    btn.textContent = "Order on WhatsApp";
    btn.href = waLink("Hi " + SHOP.name + ", I'd like to order:\n\n" + lines.join("\n") + "\n\nTotal: " + money(sum) + "\n\nName:\nDelivery area:");
  } else {
    btn.textContent = "Ask on WhatsApp";
    btn.href = waLink(generalMsg);
  }
  save();
}
drawCart();

$("#cartBody").addEventListener("click", e => {
  const b = e.target.closest("[data-remove]");
  if (!b) return;
  cart.splice(Number(b.dataset.remove), 1);
  drawCart();
});

let toastTimer;
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2400);
}

$("#modalAdd").addEventListener("click", () => {
  if (!current || !pickedSize) return;
  cart.push({ id: current.id, size: pickedSize });
  drawCart();
  toast(current.name + " · " + sizeLabel(pickedSize).toLowerCase() + " added");
  closeModal();
});

function openCart(){
  $("#drawer").classList.add("on");
  $("#scrim").classList.add("on");
  $("#closeCart").focus();
}
function closeCart(){
  $("#drawer").classList.remove("on");
  if (!$("#modal").classList.contains("on")) $("#scrim").classList.remove("on");
  $("#cartBtn").focus();
}
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#scrim").addEventListener("click", () => { closeModal(); closeCart(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape"){ closeModal(); closeCart(); return; }
  if (!$("#modal").classList.contains("on")) return;
  if (e.key === "ArrowLeft")  stepSlide(-1);
  if (e.key === "ArrowRight") stepSlide(1);
});


$("#listForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#listEmail").value.trim();
  if (!v) return;
  $("#listNote").textContent = "You're on the list — the raffle link lands 30 minutes early.";
  $("#listEmail").value = "";
});
