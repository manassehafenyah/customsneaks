/* ==================================================================
   THIS IS THE ONLY FILE YOU EDIT DAY TO DAY.

   To change a price          → edit the price number
   To mark a pair sold out    → delete it, or set visible:false
   To add a pair              → copy a line, change the details
   To add a photo             → upload it to assets/img/ on GitHub,
                                then set image:"assets/img/yourfile.jpg"

   Save the file on GitHub and Cloudflare rebuilds the site in about
   half a minute. Keep the commas and quotes exactly where they are.
   ================================================================== */
/* ------------------------------------------------------------------
   SHOP DETAILS — put your real numbers here.
   `whatsapp` must be digits only, with the country code, no + or spaces.
   e.g. 233201234567
------------------------------------------------------------------- */
const SHOP = {
  name: "CustomSneaks GH",
  whatsapp: "233000000000",
  phone: "+233 00 000 0000"
};


const PRODUCTS = [
  { id:"aj1-floral", family:"custom", fam:"Customs",     name:"Air Jordan 1 Low OG",   sub:"Floral Denim — hand-embroidered", code:"CSGH-001", year:"2026", cond:"Custom · new", price:9500, sizes:[7,8,9,9.5,10,11],  flag:"1 of 1", image:"assets/img/floral.jpg" },
  { id:"af1-chrome", family:"custom", fam:"Customs",     name:"Air Force 1 '07",       sub:"Chrome Link — silver lace hardware", code:"CSGH-002", year:"2026", cond:"Custom · new", price:4200, sizes:[8,9,10,11],     flag:"Custom", image:"assets/img/chrome.jpg" },
  { id:"af1-script", family:"custom", fam:"Customs",     name:"Air Force 1 '07",       sub:"Script Sole — embossed midsole",  code:"CSGH-003", year:"2026", cond:"Custom · new", price:3800, sizes:[7,8,9,10,11,12],  flag:"Custom", image:"assets/img/script.jpg" },
  { id:"af1-white",  family:"af1",    fam:"Air Force 1", name:"Air Force 1 '07",       sub:"Triple White",          code:"CW2288-111", year:"2021", cond:"Deadstock", price:2250, sizes:[7,8,8.5,9,10,11,12], flag:"", image:"" },
  { id:"aj1-chicago",family:"jordan", fam:"Jordan",      name:"Air Jordan 1 High OG",  sub:"Chicago Reimagined",    code:"DZ5485-612", year:"2022", cond:"Deadstock", price:8000, sizes:[8,9,9.5,10,11],      flag:"Drop", image:"" },
  { id:"aj4-bred",   family:"jordan", fam:"Jordan",      name:"Air Jordan 4 Retro",    sub:"Bred Reimagined",       code:"FV5029-006", year:"2024", cond:"Deadstock", price:5250, sizes:[7.5,8,9,10,10.5,11,12], flag:"", image:"" },
  { id:"dunk-panda", family:"dunk",   fam:"Dunk",        name:"Dunk Low Retro",        sub:"Black & White",         code:"DD1391-100", year:"2021", cond:"Deadstock", price:2650, sizes:[6,7,8,9,10,11],      flag:"", image:"" },
  { id:"aj3-cement", family:"jordan", fam:"Jordan",      name:"Air Jordan 3 Retro",    sub:"White Cement Reimagined",code:"DN3707-100",year:"2023", cond:"Deadstock", price:4900, sizes:[8,9,10,11,12],       flag:"", image:"" },
  { id:"am1-patta",  family:"airmax", fam:"Air Max",     name:"Air Max 1",             sub:"Patta Waves Noise Aqua",code:"DH1348-004", year:"2021", cond:"Used · 9/10", price:6500, sizes:[8.5,9,10],         flag:"Rare", image:"" },
  { id:"af1-shadow", family:"af1",    fam:"Air Force 1", name:"Air Force 1 Shadow",    sub:"Sail / Pale Ivory",     code:"CI0919-118", year:"2023", cond:"Deadstock", price:2450, sizes:[6,6.5,7,8,9],        flag:"", image:"" },
  { id:"aj11-conc",  family:"jordan", fam:"Jordan",      name:"Air Jordan 11 Retro",   sub:"Concord",               code:"378037-100", year:"2018", cond:"Deadstock", price:7250, sizes:[9,10,11,12,13],      flag:"Grail", image:"" },
  { id:"dunk-uni",   family:"dunk",   fam:"Dunk",        name:"Dunk Low Retro",        sub:"University Blue",       code:"DD1391-102", year:"2021", cond:"Deadstock", price:3300, sizes:[7,8,9,10],           flag:"", image:"" }
];
