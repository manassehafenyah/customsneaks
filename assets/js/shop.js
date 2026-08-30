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

const PRODUCTS = (CATALOGUE.products || [])
  .filter(p => p.visible !== false)
  .map(p => ({
    id: p.id,
    family: p.category,
    fam: p.categoryLabel,
    name: p.name,
    sub: p.colorway,
    code: p.styleCode,
    year: p.year,
    cond: p.condition,
    price: Number(p.price) || 0,
    flag: p.badge || "",
    image: (p.image || "").replace(/^\//, ""),
    sizes: (p.sizes || []).map(us => ({ us: String(us), sold_out: false }))
  }));

const DATA = { drop_at: SETTINGS.dropAt || "", ticker: SETTINGS.ticker || [] };

/* settings-driven text on the page */
document.title = SETTINGS.shopName + (SETTINGS.tagline ? " — " + SETTINGS.tagline : "");
document.querySelectorAll("[data-s]").forEach(el => {
  const v = SETTINGS[el.dataset.s];
  if (v !== undefined) el.textContent = v;
});
document.getElementById("footLine").textContent =
  "★ Built in Accra · © " + new Date().getFullYear() + " " + SETTINGS.shopName + " · " + SETTINGS.footerNote;

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

/* ---------- whatsapp + call ---------- */
const waLink = msg => "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent(msg);
const telLink = "tel:" + SHOP.phone.replace(/[^\d+]/g, "");
const generalMsg = "Hi " + SHOP.name + " — I have a question about a pair.";
$("#waFloat").href = waLink(generalMsg);
$("#footWa").href = waLink(generalMsg);
$("#footCall").href = telLink;
$("#callBtn").href = telLink;

/* ---------- ticker ---------- */
const items = ["Jordan 1 Low OG \"Floral Denim\" — Friday 12:00 GMT","Same-day delivery in Accra & Tema","MTN MoMo · Telecel Cash · AT Money · bank transfer","Free delivery nationwide over GH₵5,000","Every pair checked in Osu before it ships","Cash on delivery inside Accra","14-day returns, unworn"];
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
let target = nextFriday();
function tick(){
  let ms = target - Date.now();
  if (ms <= 0){ target = nextFriday(); ms = target - Date.now(); }
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
  if (p.image) return '<img src="' + p.image + '" alt="' + p.name + ' ' + p.sub + '">';
  return '<div class="slot"><code>image: "' + p.id + '"</code><em>drop your photo here</em></div>';
}
function render(){
  let list = PRODUCTS
    .filter(p => p.visible !== false)                       // hide without deleting
    .filter(p => filter === "all" || p.family === filter);
  if (sort === "low") list = [...list].sort((a,b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a,b) => b.price - a.price);
  const grid = $("#grid");
  if (!list.length){ grid.innerHTML = '<p class="empty">Nothing in that category right now — check back after Friday\'s drop.</p>'; return; }
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="card__shot">
        ${p.flag ? '<span class="chip card__flag">' + p.flag + '</span>' : ''}
        ${shotHTML(p)}
      </div>
      <div class="card__body">
        <div class="card__code"><span>${p.code}</span><span>${p.cond}</span></div>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__sub">${p.sub}</p>
        <div class="sizes">${p.sizes.slice(0,6).map(s => '<span class="size">' + s + '</span>').join("")}${p.sizes.length > 6 ? '<span class="size">+' + (p.sizes.length-6) + '</span>' : ''}</div>
        <div class="card__foot">
          <span class="price">${money(p.price)}</span>
          <button class="link-btn" data-open="${p.id}">Select size</button>
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
  $("#modalShot").innerHTML = shotHTML(p);
  $("#modalFamily").textContent = p.fam;
  $("#modalName").textContent = p.name;
  $("#modalSub").textContent = p.sub;
  $("#modalCode").textContent = p.code;
  $("#modalCond").textContent = p.cond;
  $("#modalYear").textContent = p.year;
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
$("#modalSizes").addEventListener("click", e => {
  const b = e.target.closest(".size--pick");
  if (!b) return;
  pickedSize = b.dataset.size;
  document.querySelectorAll("#modalSizes .size--pick").forEach(s => s.setAttribute("aria-pressed", s === b));
  $("#modalAdd").disabled = false;
});
function closeModal(){
  $("#modal").classList.remove("on");
  if (!$("#drawer").classList.contains("on")) $("#scrim").classList.remove("on");
  if (lastFocus) lastFocus.focus();
}
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
          <div class="line__meta">${p.sub} · US ${c.size}</div>
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
      return (i+1) + ". " + p.name + " \"" + p.sub + "\" — US " + c.size + " — " + money(p.price) + " [" + p.code + "]";
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
  toast(current.name + " · US " + pickedSize + " added");
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
  if (e.key === "Escape"){ closeModal(); closeCart(); }
});


$("#listForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#listEmail").value.trim();
  if (!v) return;
  $("#listNote").textContent = "You're on the list — the raffle link lands 30 minutes early.";
  $("#listEmail").value = "";
});
