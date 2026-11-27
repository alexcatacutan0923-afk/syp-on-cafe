"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const LOGO_URL = "/IMG_5996.jpeg";
const QR_TARGET = "https://www.facebook.com/SypOnCafe";
const MEMBERSHIP_QR_TARGET = "https://syponcafe.shop/member-register";

const MENU = [
  // ICED COFFEE — 16oz / 22oz
  ["Americano","16oz",69,"Iced Coffee"],["Americano","22oz",79,"Iced Coffee"],
  ["Oreo Latte","16oz",79,"Iced Coffee"],["Oreo Latte","22oz",99,"Iced Coffee"],
  ["Iced Milo Latte","16oz",79,"Iced Coffee"],["Iced Milo Latte","22oz",99,"Iced Coffee"],
  ["Spanish Latte","16oz",89,"Iced Coffee"],["Spanish Latte","22oz",109,"Iced Coffee"],
  ["Salted Caramel Latte","16oz",89,"Iced Coffee"],["Salted Caramel Latte","22oz",109,"Iced Coffee"],
  ["Vanilla Latte","16oz",89,"Iced Coffee"],["Vanilla Latte","22oz",109,"Iced Coffee"],
  ["French Vanilla Latte","16oz",89,"Iced Coffee"],["French Vanilla Latte","22oz",109,"Iced Coffee"],
  ["Roasted Almond Latte","16oz",99,"Iced Coffee"],["Roasted Almond Latte","22oz",119,"Iced Coffee"],
  ["Biscoff Latte","16oz",99,"Iced Coffee"],["Biscoff Latte","22oz",119,"Iced Coffee"],
  // HOT COFFEE — 8oz / 12oz
  ["Hot Americano","8oz",49,"Hot Coffee"],["Hot Americano","12oz",69,"Hot Coffee"],
  ["Hot Oreo Latte","8oz",59,"Hot Coffee"],["Hot Oreo Latte","12oz",79,"Hot Coffee"],
  ["Hot Milo Latte","8oz",59,"Hot Coffee"],["Hot Milo Latte","12oz",79,"Hot Coffee"],
  ["Hot Spanish Latte","8oz",59,"Hot Coffee"],["Hot Spanish Latte","12oz",79,"Hot Coffee"],
  ["Hot Salted Caramel","8oz",69,"Hot Coffee"],["Hot Salted Caramel","12oz",89,"Hot Coffee"],
  ["Hot Mocha","8oz",69,"Hot Coffee"],["Hot Mocha","12oz",89,"Hot Coffee"],
  ["Hot White Mocha","8oz",69,"Hot Coffee"],["Hot White Mocha","12oz",89,"Hot Coffee"],
  ["Hot Roasted Almond Latte","8oz",79,"Hot Coffee"],["Hot Roasted Almond Latte","12oz",99,"Hot Coffee"],
  ["Hot Biscoff Latte","8oz",79,"Hot Coffee"],["Hot Biscoff Latte","12oz",99,"Hot Coffee"],
  // ICED MILKY — 16oz / 22oz
  ["Milo Dino","16oz",79,"Iced Milky"],["Milo Dino","22oz",99,"Iced Milky"],
  ["Oreo Milky","16oz",79,"Iced Milky"],["Oreo Milky","22oz",99,"Iced Milky"],
  ["Caramel Macchiato","16oz",99,"Iced Milky"],["Caramel Macchiato","22oz",119,"Iced Milky"],
  ["Milky White Choco","16oz",99,"Iced Milky"],["Milky White Choco","22oz",119,"Iced Milky"],
  ["Milky Choco","16oz",99,"Iced Milky"],["Milky Choco","22oz",119,"Iced Milky"],
  // HOT MILKY — 8oz / 12oz
  ["Hot Milo Dino","8oz",59,"Hot Milky"],["Hot Milo Dino","12oz",79,"Hot Milky"],
  ["Hot Oreo Milky","8oz",59,"Hot Milky"],["Hot Oreo Milky","12oz",79,"Hot Milky"],
  ["Hot Caramel Macchiato","8oz",69,"Hot Milky"],["Hot Caramel Macchiato","12oz",89,"Hot Milky"],
  ["Hot Milky White Choco","8oz",69,"Hot Milky"],["Hot Milky White Choco","12oz",89,"Hot Milky"],
  ["Hot Milky Choco","8oz",69,"Hot Milky"],["Hot Milky Choco","12oz",89,"Hot Milky"],
  // ICED SIGNATURE — 16oz / 22oz
  ["SYP Choco Boom (Mocha)","16oz",99,"Iced Signature"],["SYP Choco Boom (Mocha)","22oz",119,"Iced Signature"],
  ["SYP White Rush (White Mocha)","16oz",99,"Iced Signature"],["SYP White Rush (White Mocha)","22oz",119,"Iced Signature"],
  // ICED MATCHA — 16oz / 22oz
  ["Matcha Latte","16oz",109,"Matcha"],["Matcha Latte","22oz",129,"Matcha"],
  ["Dirty Matcha","16oz",109,"Matcha"],["Dirty Matcha","22oz",129,"Matcha"],
  ["Mango Matcha","16oz",109,"Matcha"],["Mango Matcha","22oz",129,"Matcha"],
  ["Blueberry Matcha","16oz",109,"Matcha"],["Blueberry Matcha","22oz",129,"Matcha"],
  ["Strawberry Matcha","16oz",109,"Matcha"],["Strawberry Matcha","22oz",129,"Matcha"],
  ["Biscoff Matcha","16oz",119,"Matcha"],["Biscoff Matcha","22oz",139,"Matcha"],
  // HOT MATCHA — 8oz / 12oz
  ["Hot Matcha Latte","8oz",69,"Hot Matcha"],["Hot Matcha Latte","12oz",89,"Hot Matcha"],
  ["Hot Dirty Matcha","8oz",69,"Hot Matcha"],["Hot Dirty Matcha","12oz",89,"Hot Matcha"],
  ["Hot Mango Matcha","8oz",69,"Hot Matcha"],["Hot Mango Matcha","12oz",89,"Hot Matcha"],
  ["Hot Blueberry Matcha","8oz",69,"Hot Matcha"],["Hot Blueberry Matcha","12oz",89,"Hot Matcha"],
  ["Hot Strawberry Matcha","8oz",69,"Hot Matcha"],["Hot Strawberry Matcha","12oz",89,"Hot Matcha"],
  ["Hot Biscoff Matcha","8oz",79,"Hot Matcha"],["Hot Biscoff Matcha","12oz",99,"Hot Matcha"],
  // SODA — 16oz / 22oz
  ["Green Apple","16oz",39,"Soda"],["Green Apple","22oz",49,"Soda"],
  ["Mango","16oz",39,"Soda"],["Mango","22oz",49,"Soda"],
  ["Orange","16oz",39,"Soda"],["Orange","22oz",49,"Soda"],
  ["Strawberry","16oz",39,"Soda"],["Strawberry","22oz",49,"Soda"],
  ["Watermelon","16oz",39,"Soda"],["Watermelon","22oz",49,"Soda"],
  ["Blueberry","16oz",39,"Soda"],["Blueberry","22oz",49,"Soda"],
  ["Peach","16oz",39,"Soda"],["Peach","22oz",49,"Soda"],
  // FRIES
  ["Syp Bites (Small)","Small",49,"Fries"],["Syp Cravings (Medium)","Medium",79,"Fries"],["Syp Overload (Barkada)","Barkada",119,"Fries"],
  // WAFFLE
  ["Syp Waffle","1 pc",69,"Waffle"],["Syp Cheesy Waffle","1 pc",79,"Waffle"],["Syp Hotdog Waffle","1 pc",79,"Waffle"],["Syp Chocolate Waffle","1 pc",89,"Waffle"],
] as const;

const expandQuotes = (lines:string[]) => lines.flatMap(line=>[line,"POV: "+line,"Real talk: "+line,"Current mood: "+line,"Not me: "+line,"Plot twist: "+line]);

const QUOTES: Record<string,string[]> = {
  Coffee:expandQuotes([
    "Kape muna. Wala pa akong patience today.","Hindi ako late, dramatic entrance lang.","My salary disappears faster than my coffee.","Gising ang katawan, tulog ang motivation.","May deadline ako, pero may kape rin ako.","Adulting is just saying 'next sweldo na'.","Kung kaya ng kape, kaya pang ngumiti.","Busy ako. Nag-iisip kung anong kakainin.","My love language is someone buying me coffee.","Hindi lahat ng problema kailangan sagutin ngayon. May kape muna.","I need a break, not another group chat.","Puyat na naman. At least consistent ako.","Coffee: dahil hindi pa option ang mag-resign.","Sana all may assurance. Ako, caffeine lang.","Walang tulugan kung may bills na naghihintay.","I came. I saw. I needed coffee.","Minsan kailangan mo lang ng tahimik at iced coffee.","Hindi ako masungit. Low coffee lang.","Work hard, sip harder.","Kung hindi ako nag-reply, baka nagre-recharge ako.","One coffee away from being productive.","Kape ang witness sa lahat ng desisyon ko.","My budget said no, but my coffee said yes.","Hindi lahat ng strong, emotionally available.","Kape muna bago magpanggap na okay."
  ]),
  Matcha:expandQuotes([
    "Green flag ang matcha. Yung iba, seen zone.","Matcha first. Red flags later.","At least itong green, hindi mixed signals.","Soft life, strong matcha.","Hindi ako bitter. Matcha lang 'to.","If it's not giving peace, let it go.","Green drink, clear mind. Sana all.","Matcha ang pinili ko. Sana siya rin ako.","No bad vibes, just matcha sips.","Hindi lahat ng green ay good sign. Itong matcha, oo.","My standards are high. My matcha is higher.","Stay sweet, kahit hindi siya nag-stay.","Matcha muna bago mag-overthink.","I like my matcha like my peace: worth it.","Dear self, piliin mo naman ang sarili mo.","Matcha date? At least sure akong darating.","Green flag spotted. Nasa cup lang pala.","No chasing. Just sipping.","Hindi ako naghihintay. Nag-e-enjoy lang ako.","May peace of mind sa bawat sip. Sana all.","Matcha is my kind of commitment.","Kung mixed signals, pass. Kung matcha, yes.","Less drama, more matcha.","You deserve better. At least better matcha.","Walang bitterness kung matcha ang kasama."
  ]),
  Soda:expandQuotes([
    "Fizz happens. Drink anyway.","Chill ka lang, hindi ka naman deadline.","Bubbly outside, pagod inside.","Too cool to be stressed. Medyo lang.","Good vibes lang, wala tayong budget sa drama.","Sana lahat ng problema, kayang i-refill.","Pop the top, drop the stress.","Mainit ang panahon, malamig dapat ang ulo.","Energy level: soda na may extra ice.","Kung magulo ang life, dagdagan ang fizz.","Stay fizzy, not busy.","Walang ambag ang stress sa bayarin.","Sip happens. Move on.","Ice cold drink, hot chika.","Hindi ako hyper. Carbonated lang ang energy.","Relax. Hindi lahat kailangan patulan.","Mas okay pang maubusan ng yelo kaysa pasensya.","Keep calm and add ice.","Buhay ay short. Order ka na ng soda.","Less overthinking, more overflowing bubbles.","Sana all may spark tulad ng soda.","Kung may issue, palamigin muna natin.","Today’s forecast: 100% chance of refreshments.","Fresh ka dapat kahit sabog ang schedule.","Bubbles up, worries down."
  ]),
  Milky:expandQuotes([
    "Sweet tooth, strong attitude.","Creamy comfort, zero judgment.","Soft drink para sa hard days.","Deserve ko 'to. Wala nang meeting.","Sweet lang ako kapag busog.","A little sweetness never hurt.","Milk mood: soft pero may boundaries.","Hindi ako clingy. Creamy lang ang order.","Comfort in a cup. Huwag na magtanong.","Kung walang lambing, at least may milky drink.","Sweet ka sana, hindi confusing.","Extra creamy, extra confident.","One sip closer to a better mood.","Ang buhay mapait minsan. Kaya milky tayo.","Love yourself. Treat yourself. Sip slowly.","Soft heart, strong cravings.","Hindi lahat ng sweet, red flag.","Araw-araw akong nagtitipid. Except today.","Creamy ang drink, complicated ang feelings.","Sweet escape muna sa adulting.","May good days, may milky days.","I deserve a treat, and that's final.","Less drama, more creamy goodness.","Hindi ako maarte. Alam ko lang ang gusto ko.","Sana all smooth, tulad ng first sip."
  ]),
  Signature:expandQuotes([
    "Ordinary day? Make it a signature one.","Main character energy, kahit extra lang ang budget.","One of a kind. No explanation needed.","Special ka. Huwag mong kalimutan.","Not basic. Never was.","A little extra looks good on you.","Make today worth remembering.","Confidence served cold.","Good taste is a personality trait.","Hindi lahat kayang maging original.","Your vibe deserves a signature sip.","Be bold. Order what you love.","Limited edition? Ikaw na 'yon.","Stay iconic, stay hydrated.","Big mood in a small moment.","The best choice you made today? This one.","Own your moment. Enjoy your drink.","Hindi kailangan ng dahilan para mag-treat yourself.","Extraordinary starts with one good sip.","Be the plot twist, not the problem.","Keep it classy, keep it tasty.","A signature kind of day.","You do you. Sip by sip.","Hindi ito ordinaryong craving.","Make room for something special."
  ]),
  Fries:expandQuotes([
    "Fries before guys. Always.","Share your fries? That's a trust issue.","Diet starts tomorrow. Sabi ko na last week.","Crunch muna bago chika.","Walang forever, pero may extra fries.","If you love me, huwag mong kunin fries ko.","Small fries, big feelings.","Stress eating? More like stress healing.","Hindi ako galit. Gutom lang talaga.","My type? Someone who buys extra fries.","Barkada rule: bayad muna bago kuha.","One more bite. Last na talaga. Promise.","Fries are cheaper than therapy. Usually.","Huwag mong bilangin ang fries ko.","Good friends share. Best friends order their own.","Ang tunay na betrayal: huling piraso, kinuha mo.","Crunch time, best time.","No fries left behind.","Kahit broken, basta may fries.","My happiness is deep-fried.","Walang problema na hindi gumagaan sa fries.","If lost, follow the smell of fries.","Hindi ako selfish. Fries ko 'to.","Order extra. Future you will say thanks.","Less talk, more crunch."
  ])
};

const UNIVERSAL_QUOTES=[
  "Dahan-dahan lang. Hindi karera ang buhay.",
  "Pahinga rin. Hindi ka robot, kahit minsan mukha ka na.",
  "Small progress is still progress. Kahit kape muna ang ambag.",
  "Choose kindness. Libre lang, unlike extra shots.",
  "Hindi kailangang perfect. Kailangan lang magsimula.",
  "Be proud of how far you've come. Kahit naka-tsinelas.",
  "Your pace is valid. Basta huwag lang sa pila sumingit.",
  "Hindi lahat ng bagay kontrolado mo. Yung next sip, oo.",
  "Save your energy for what matters. At sa pagbuhat ng cravings.",
  "Maging mabait sa sarili. Hindi ka laging kailangang strong.",
  "Learn to rest, not to quit. At mag-refill kung kailangan.",
  "One bad day doesn't mean a bad life. Bawi sa next sip.",
  "Choose peace over proving a point. Mas mura rin.",
  "Hindi ka nahuhuli. May sarili kang timing.",
  "Do your best today. Tapos kain at pahinga.",
  "Be the reason someone smiles. O kaya magdala ng fries.",
  "Less pressure, more progress. Less drama, more coffee.",
  "May bukas pa. Pero itong drink, tikman mo na ngayon.",
  "You deserve good things. Hindi puro add-to-cart.",
  "Keep going. Kahit low battery, basta may charger."
];
for(const group of Object.keys(QUOTES)) QUOTES[group].push(...UNIVERSAL_QUOTES);

QUOTES.Coffee.push("Kape ang sagot. Kahit hindi ko pa alam ang tanong.","Nagtipid ako today. Sa ibang araw na lang.","Hindi ako tamad, naka power-saving mode lang.","May plano ako sa buhay. Naglo-loading pa.","Kung may problema ka, upuan mo muna. Kape tayo.","Ang alarm ko, suggestion lang talaga.","Hindi ako lutang. Limited edition lang ang focus.","Status: financially available, emotionally buffering.","Sana may loyalty card din ang sweldo.","My brain has too many tabs open.","Hindi ako overthinker. Advance mag-isip lang.","Gusto ko ng peaceful life at maraming extra shot.","Monday na naman? Sino nag-approve nito?","Ang tunay na rich, tulog nang walong oras.","Kung may plot twist, sana may free coffee.");
QUOTES.Matcha.push("Matcha ang green flag na hindi nang-iiwan sa ere.","Hindi ako healing era. Matcha era muna.","Green ang drink, pero hindi ibig sabihing magaling na ako sa life.","Kung hindi sure, matcha muna. Desisyon later.","My relationship status: committed sa matcha.","Walang mixed signals, puro matcha layers.","Nag-move on na ako. Sa next cup na.","Matcha: dahil mahal ang peace of mind.","Hindi ako maarte, may standards lang ang taste buds.","Kung may exam sa pagiging chill, absent ako.","Green tea, red flags? Pass.","Sana all consistent, hindi lang kulay ng matcha.");
QUOTES.Soda.push("Carbonated ang drink, pero flat ang bank account.","Bubbles sa baso, problema sa inbox.","Chill lang. Hindi tayo hinahabol ng baso.","May fizz pa ako kahit ubos na ang energy.","Soda muna bago sumabog sa group chat.","Hindi ako high maintenance, extra ice lang.","Ang bilis ng araw, parang ubos na yelo.","Bubbly personality, sleepy body.","Wag mo akong i-pressure, hindi ako soft drink bottle.");
QUOTES.Milky.push("Creamy ang drink, pero dry ang love life.","Sweet ako ngayon. Sulitin mo na.","Hindi ako baby, gusto ko lang ng extra creamy.","Ang soft ko lang kapag may milky drink.","Kung walang lambing, dagdagan ang toppings.","Life is short. Piliin ang may extra cream.","Hindi ako needy. Gusto ko lang ng refill.","May feelings ako. Mostly cravings.","Cute ako, pero mas cute ang drink ko.");
QUOTES.Signature.push("Premium ang drink, budget meal ang lifestyle.","Main character ako, pero supporting role ang savings.","Signature drink, unsigned resignation letter.","Special edition ako. Limited patience.","Hindi ako extra. Signature flavor lang.","Big dreams, small remaining balance.","Classy ang order, kalat ang camera roll.","Iconic sana, kaso gutom lang pala.","Special ka. Huwag lang special mention sa utang.");
QUOTES.Fries.push("Ang fries ko, parang trust. Huwag mong gagalawin.","Sharing is caring. Pero bili ka sarili mo.","Hindi ako madamot. May boundaries lang ang fries.","One fry lang daw. Tapos kalahati nawala.","Fries ang tunay na ride or die.","Masakit ang betrayal, lalo na pag huling fries.","Calories don't count kapag masaya.","Barkada kayo? Ambagan muna bago kuha.","May feelings ako. At lahat sila gutom.","Huwag kang magtanong kung ilan kinain ko.");

type Sticker = { id:number; customer:string; drink:string; size:string; price:number; category:string; sugar:string; ice:string; note:string; quote:string; createdAt:string; orderNo:string; salePending?:boolean };
const QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=1&data="+encodeURIComponent(QR_TARGET);
const WIFI_QR_TARGET = "WIFI:T:WPA;S:Syp On Café;P:spanishlatte;;";
const WIFI_QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=4&data="+encodeURIComponent(WIFI_QR_TARGET);
const MEMBERSHIP_QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=4&data="+encodeURIComponent(MEMBERSHIP_QR_TARGET);
const stamp = () => new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",dateStyle:"medium",timeStyle:"short"}).format(new Date());

function menuCategory(group:string){if(group.includes("Coffee")||group.includes("Signature"))return "Coffee";if(group.includes("Milky"))return "Milky";if(group.includes("Matcha"))return "Matcha";return group;}

export default function StickerStudioPage() {
  const [search,setSearch]=useState("");
  const [cashier,setCashier]=useState<string>("");
  const [printerGateDone,setPrinterGateDone]=useState(false);
  const [salesReportOpen,setSalesReportOpen]=useState(false);
  const [unpaidOrdersOpen,setUnpaidOrdersOpen]=useState(false);
  const [reprintHistoryOpen,setReprintHistoryOpen]=useState(false);
  const [studioPage,setStudioPage]=useState<"pos"|"history"|"reports"|"settings">("pos");
  const [orderType,setOrderType]=useState<"Dine-in"|"Takeaway"|"Delivery">("Takeaway");
  const [activeCategory,setActiveCategory]=useState("Coffee");
  const [selected,setSelected]=useState(0);
  const [customer,setCustomer]=useState("");
  const [sugar,setSugar]=useState("Regular sugar");
  const [ice,setIce]=useState("Regular ice");
  const [note,setNote]=useState("");
  const [orderNo,setOrderNo]=useState("001");
  const [quantity,setQuantity]=useState(1);
  const [customDrinkName,setCustomDrinkName]=useState("");
  const [customDrinkSize,setCustomDrinkSize]=useState("16oz");
  const [customDrinkPrice,setCustomDrinkPrice]=useState("");
  const [cashReceived,setCashReceived]=useState("");
  const [paymentMethod,setPaymentMethod]=useState<"Cash"|"GCash"|"Maya"|"Bank Transfer">("Cash");
  const [paymentConfirmed,setPaymentConfirmed]=useState(false);
  const [deliveryEnabled,setDeliveryEnabled]=useState(false);
  const [deliveryFee,setDeliveryFee]=useState("30");
  const [extraCharges,setExtraCharges]=useState<{id:number;name:string;amount:string}[]>([]);
  const [discountType,setDiscountType]=useState<"amount"|"percent">("amount");
  const [discountValue,setDiscountValue]=useState("0");
  const [nextChargeId,setNextChargeId]=useState(1);
  const [quote,setQuote]=useState(QUOTES.Coffee[0]);
  const [queue,setQueue]=useState<Sticker[]>([]);
  const [printItems,setPrintItems]=useState<Sticker[]>([]);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const [previewOpen,setPreviewOpen]=useState(false);
  const [printMode,setPrintMode]=useState<"both"|"stickers"|"receipt">("both");
  const [qzStatus,setQzStatus]=useState("Not connected");
  const [qzPrinters,setQzPrinters]=useState<string[]>([]);
  const [stickerWidth,setStickerWidth]=useState(50);
  const [stickerHeight,setStickerHeight]=useState(80);
  const [receiptWidth,setReceiptWidth]=useState(80);
  const [printScale,setPrintScale]=useState<"actual"|"fit">("actual");
  const [settingsLoaded,setSettingsLoaded]=useState(false);
  useEffect(()=>{try{const raw=localStorage.getItem("syp-printer-paper-settings");if(raw){const v=JSON.parse(raw);if((v.stickerWidth===80&&v.stickerHeight===50)||(v.stickerWidth===50&&v.stickerHeight===70)||(v.stickerWidth===70&&v.stickerHeight===50)){setStickerWidth(50);setStickerHeight(80);}else{if(Number.isFinite(v.stickerWidth)&&v.stickerWidth>=30&&v.stickerWidth<=120)setStickerWidth(v.stickerWidth);if(Number.isFinite(v.stickerHeight)&&v.stickerHeight>=30&&v.stickerHeight<=150)setStickerHeight(v.stickerHeight);}if(Number.isFinite(v.receiptWidth)&&v.receiptWidth>=40&&v.receiptWidth<=100)setReceiptWidth(v.receiptWidth);if(v.printScale==="fit"||v.printScale==="actual")setPrintScale(v.printScale);}}catch{}setSettingsLoaded(true);},[]);
  useEffect(()=>{if(settingsLoaded){try{localStorage.setItem("syp-printer-paper-settings",JSON.stringify({stickerWidth,stickerHeight,receiptWidth,printScale}));}catch{}}},[settingsLoaded,stickerWidth,stickerHeight,receiptWidth,printScale]);
  const stickerOrientation=stickerWidth<=stickerHeight?"Portrait":"Landscape";
  const stickerInnerWidth=Math.max(10,stickerWidth-4);
  const stickerInnerHeight=Math.max(10,stickerHeight-4);
  const receiptInnerWidth=Math.max(30,receiptWidth-2);
  async function connectQz(){
    setQzStatus("Loading QZ Tray…");
    try{
      const w=window as any;
      if(!w.qz){
        await new Promise<void>((resolve,reject)=>{
          const existing=document.getElementById("qz-tray-script") as HTMLScriptElement|null;
          if(existing){existing.addEventListener("load",()=>resolve(),{once:true});existing.addEventListener("error",()=>reject(new Error("Hindi ma-load ang QZ Tray library.")),{once:true});if(w.qz)resolve();return;}
          const script=document.createElement("script");
          script.id="qz-tray-script";
          script.src="https://cdn.jsdelivr.net/npm/qz-tray@2.2.5/qz-tray.js";
          script.async=true;
          script.onload=()=>resolve();
          script.onerror=()=>reject(new Error("Hindi ma-load ang QZ Tray library. Check internet connection."));
          document.head.appendChild(script);
        });
      }
      if(!w.qz)throw new Error("QZ Tray library not available.");
      w.qz.security.setCertificatePromise((resolve:(value:string)=>void,reject:(reason:any)=>void)=>{
        fetch("/api/qz/certificate",{cache:"no-store"}).then(async response=>{const value=await response.text();if(response.ok)resolve(value);else reject(value);}).catch(reject);
      });
      w.qz.security.setSignatureAlgorithm("SHA512");
      w.qz.security.setSignaturePromise((toSign:string)=>(resolve:(value:string)=>void,reject:(reason:any)=>void)=>{
        fetch("/api/qz/sign",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({request:toSign})})
          .then(async response=>{const value=await response.text();if(response.ok)resolve(value);else reject(value);}).catch(reject);
      });
      if(!w.qz.websocket.isActive())await w.qz.websocket.connect();
      const found=await w.qz.printers.find();
      const list=Array.isArray(found)?found:[found];
      setQzPrinters(list.filter(Boolean));
      setQzStatus("Connected · "+list.length+" printer(s) found");
      localStorage.setItem("syp-qz-auto-connect","1");
      setNotice("QZ Tray connected. Check that TP870 S and EPSON TM-T88IV Receipt are listed below.");
      return true;
    }catch(error){
      setQzStatus("Connection failed");
      setNotice("QZ Tray error: "+((error as any)?.message||String(error)));
      return false;
    }
  }

  useEffect(()=>{try{if(localStorage.getItem("syp-qz-auto-connect")==="1"){void connectQz().then(connected=>{if(connected)setPrinterGateDone(true);});}}catch{}},[]);

  async function testPrintBoth(){
    const w=window as any;
    if(!w.qz||!w.qz.websocket.isActive()){setNotice("Connect muna sa QZ Tray bago mag-test.");return;}
    const stickerPrinter=qzPrinters.find(name=>name.trim()==="TP870 S");
    const receiptPrinter=qzPrinters.find(name=>name.trim()==="EPSON TM-T88IV Receipt");
    if(!stickerPrinter||!receiptPrinter){setNotice("Hindi makita ang parehong printer. Pindutin muna ang Reconnect / Find Printers.");return;}
    if(!window.confirm("Magpi-print ng TEST sticker ("+stickerWidth+"×"+stickerHeight+"mm) at TEST receipt ("+receiptWidth+"mm). Walang sale o queue na gagalawin. Ituloy?"))return;
    setNotice("Sending test jobs to both printers…");
    const stickerHtml='<!doctype html><html><head><meta charset="utf-8"><style>@page{size:'+stickerWidth+'mm '+stickerHeight+'mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:'+stickerWidth+'mm;height:'+stickerHeight+'mm;font-family:Arial,sans-serif;color:#000}body{padding:4mm;border:1px solid #000;text-align:center;display:flex;flex-direction:column;justify-content:center}h1{font-size:17pt;margin:0 0 3mm;font-weight:900}p{font-size:9pt;margin:1mm 0}.line{border-top:1px dashed #000;margin:3mm 0}</style></head><body><h1>SYP ON CAFÉ</h1><p>STREET • ICED • BREWED</p><div class="line"></div><h1>STICKER TEST</h1><p>'+stickerWidth+' × '+stickerHeight+' mm · TP870 S</p><p>NO SALE CREATED</p></body></html>';
    const receiptHtml='<!doctype html><html><head><meta charset="utf-8"><style>@page{size:'+receiptWidth+'mm 60mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:'+receiptWidth+'mm;font-family:monospace;color:#000}body{padding:4mm}h1{text-align:center;font-family:Arial,sans-serif;font-size:16pt;margin:0 0 2mm}p{font-size:9pt;margin:2mm 0}.rule{border-top:1px dashed #000;margin:3mm 0}.total{font-size:13pt;font-weight:bold;text-align:center}</style></head><body><h1>SYP ON CAFÉ</h1><p style="text-align:center">STREET • ICED • BREWED</p><div class="rule"></div><p>QZ TRAY PRINTER TEST</p><p>Printer: EPSON TM-T88IV Receipt</p><p>Paper: '+receiptWidth+' mm</p><div class="rule"></div><p class="total">TEST ONLY · ₱0.00</p><p style="text-align:center">NO SALE CREATED · THANK YOU, KASYP!</p></body></html>';
    const stickerConfig=w.qz.configs.create(stickerPrinter,{units:"mm",size:{width:stickerWidth,height:stickerHeight},orientation:stickerWidth===stickerHeight?null:stickerWidth<stickerHeight?"portrait":"landscape",rotation:0,margins:0,scaleContent:printScale==="fit",jobName:"SYP Sticker Test"});
    const receiptConfig=w.qz.configs.create(receiptPrinter,{units:"mm",size:{width:receiptWidth,height:60},margins:0,scaleContent:printScale==="fit",jobName:"SYP Receipt Test"});
    const stickerJob=w.qz.print(stickerConfig,[{type:"pixel",format:"html",flavor:"plain",data:stickerHtml}]);
    const receiptJob=w.qz.print(receiptConfig,[{type:"pixel",format:"html",flavor:"plain",data:receiptHtml}]);
    const results=await Promise.allSettled([stickerJob,receiptJob]);
    const stickerOk=results[0].status==="fulfilled";
    const receiptOk=results[1].status==="fulfilled";
    if(stickerOk&&receiptOk){setNotice("QZ accepted both test print jobs. Check TP870 S sticker and Epson receipt output. Walang sale o queue na binago.");}
    else{const detail=results.map((result,index)=>result.status==="rejected"?(index===0?"TP870 S: ":"Epson: ")+String((result.reason as any)?.message||result.reason):"").filter(Boolean).join(" · ");setNotice("Partial/failed test submission. "+detail+" Check printer queues and output; no sale or queue was changed.");}
  }

  async function sendQzMarkup(printer:string,markup:string,width:number,height:number,jobName:string){
    const w=window as any;
    const isSticker=printer.trim()==="TP870 S";
    const config=w.qz.configs.create(printer,{units:"mm",size:{width,height},orientation:isSticker?(width===height?null:width<height?"portrait":"landscape"):null,rotation:0,margins:0,scaleContent:printScale==="fit",jobName});
    return w.qz.print(config,[{type:"pixel",format:"html",flavor:"plain",data:markup}]);
  }

  async function printSelectedWithQz(items:Sticker[],mode:"both"|"stickers"|"receipt"){
    const w=window as any;
    const needsReceipt=mode==="both"||mode==="receipt";
    const needsSticker=mode==="both"||mode==="stickers";
    if(needsReceipt&&(!w.qz||!w.qz.websocket.isActive()))throw new Error("QZ Tray is disconnected. Reconnect muna bago mag-print ng receipt.");
    const receiptPrinter=qzPrinters.find(name=>name.trim()==="EPSON TM-T88IV Receipt");
    if(needsReceipt&&!receiptPrinter)throw new Error("Hindi makita ang EPSON TM-T88IV Receipt printer.");

    setPrintItems(items);
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    const receiptNode=document.querySelector(".receipt-sheet") as HTMLElement|null;

    // Sticker printing now follows the exact browser Web Print route used by Reprint.
    // This preserves the browser's paper-size, orientation, scaling and printer settings.
    if(needsSticker){
      const stickerNodes=Array.from(document.querySelectorAll(".print-sheet")) as HTMLElement[];
      if(stickerNodes.length!==items.length)throw new Error("Hindi pa handa ang sticker preview. Subukan ulit.");
      await Promise.all(stickerNodes.flatMap(node=>Array.from(node.querySelectorAll("img")).map(img=>img.complete?Promise.resolve():new Promise<void>(resolve=>{img.onload=()=>resolve();img.onerror=()=>resolve();setTimeout(resolve,5000);}))));
      const hideReceipt=document.createElement("style");
      hideReceipt.setAttribute("data-syp-sticker-webprint","true");
      hideReceipt.textContent="@media print{.receipt-sheet{display:none!important;visibility:hidden!important}}";
      document.head.appendChild(hideReceipt);
      try{
        await new Promise<void>(resolve=>window.setTimeout(resolve,350));
        window.print();
      }finally{
        hideReceipt.remove();
      }
    }

    if(needsReceipt){
      if(!receiptNode)throw new Error("Hindi pa handa ang receipt preview. Subukan ulit.");
      await Promise.all(Array.from(receiptNode.querySelectorAll("img")).map(img=>img.complete?Promise.resolve():new Promise<void>(resolve=>{img.onload=()=>resolve();img.onerror=()=>resolve();setTimeout(resolve,5000);})));
      const receiptMain=receiptNode.querySelector(".receipt") as HTMLElement|null;
      if(!receiptMain)throw new Error("Hindi makita ang receipt content.");
      const receiptHeight=Math.max(75,Math.ceil(Math.max(receiptMain.scrollHeight,receiptMain.getBoundingClientRect().height)*25.4/96*1.28)+10);
      const receiptCss=`.receipt{display:block!important;width:${receiptInnerWidth}mm!important;max-width:${receiptInnerWidth}mm!important;box-sizing:border-box!important;margin:0!important;padding:3mm 2.5mm!important;background:#fff!important;color:#000!important;font-family:Arial,Helvetica,sans-serif!important;font-size:8pt!important;line-height:1.25!important;overflow:visible!important;height:auto!important;max-height:none!important}.receipt *{box-sizing:border-box!important;color:#000!important}.receipt-head{font-size:17pt!important;font-weight:900!important;text-align:center!important}.receipt-sub,.receipt-address,.receipt-foot,.receipt-site{text-align:center!important}.receipt-meta{font-size:7pt!important;gap:.8mm!important;display:grid!important;grid-template-columns:1fr!important}.receipt-row{font-size:7.5pt!important;line-height:1.25!important;margin:1mm 0!important}.receipt-total{font-size:12pt!important;padding:1.5mm 0!important}.receipt-change{font-size:9pt!important}.receipt-item{margin:1.5mm 0!important}.receipt-item-main{font-size:7.5pt!important}.receipt-item small{font-size:6.5pt!important}.receipt-note{font-size:7pt!important}`;
      const receiptMarkup='<!doctype html><html><head><meta charset="utf-8"><style>@page{size:'+receiptWidth+'mm '+receiptHeight+'mm;margin:0}*{box-sizing:border-box}html,body{display:block!important;width:'+receiptWidth+'mm!important;min-width:'+receiptWidth+'mm!important;max-width:'+receiptWidth+'mm!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important;color:#000!important}body{padding:0!important}'+receiptCss+'</style></head><body>'+receiptMain.outerHTML+'</body></html>';
      await sendQzMarkup(receiptPrinter!,receiptMarkup,receiptWidth,receiptHeight,"SYP Receipt Order "+(items[0]?.orderNo||""));
    }
    return (needsSticker?1:0)+(needsReceipt?1:0);
  }

  const drinksTotal=queue.reduce((sum,item)=>sum+Number(item.price||0),0);
  const chargesTotal=(deliveryEnabled?Math.max(0,Number(deliveryFee)||0):0)+extraCharges.reduce((sum,item)=>sum+Math.max(0,Number(item.amount)||0),0);
  const queueTotal=drinksTotal+chargesTotal;
  const rawDiscount=Math.max(0,Number(discountValue)||0);
  const discountAmount=Math.min(queueTotal,discountType==="percent"?queueTotal*Math.min(100,rawDiscount)/100:rawDiscount);
  const finalTotal=Math.max(0,queueTotal-discountAmount);
  const receiptCharges=[...(deliveryEnabled&&Number(deliveryFee)>0?[{name:"Delivery fee",amount:Number(deliveryFee)}]:[]),...extraCharges.filter(item=>item.name.trim()&&Number(item.amount)>0).map(item=>({name:item.name.trim(),amount:Number(item.amount)}))];
  const cashAmount=Number(cashReceived);
  const cashValid=cashReceived.trim()!==""&&Number.isFinite(cashAmount)&&cashAmount>=0;
  const liveChange=cashValid?cashAmount-finalTotal:0;
  const [history,setHistory]=useState<Sticker[]>([]);
  const [nextId,setNextId]=useState(1);
  const [ready,setReady]=useState(false);
  const [notice,setNotice]=useState("");
  const [dailyOrders,setDailyOrders]=useState(0);
  const [dailySales,setDailySales]=useState(0);
  const [monthlySales,setMonthlySales]=useState(0);
  const [salesLoading,setSalesLoading]=useState(true);
  const [unpaidOrders,setUnpaidOrders]=useState<any[]>([]);
  const [salesRows,setSalesRows]=useState<any[]>([]);
  const [salesError,setSalesError]=useState("");
  async function refreshDailySales(){
    if(!isSupabaseConfigured){setSalesError("Supabase is not configured.");setSalesLoading(false);return;}
    setSalesLoading(true);
    const counterKey="2000-01-01";
    const monthStart=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit"}).format(new Date())+"-01";
    const {data:resetData,error:resetError}=await supabase.from("sticker_studio_daily_counters").select("cash_reset_at,orders_reset_at,monthly_reset_at").eq("business_date",counterKey).maybeSingle();
    if(resetError){setSalesError(resetError.message);setSalesLoading(false);return;}
    const {data,error}=await supabase.from("sticker_studio_sales").select("id,total_amount,created_at,business_date,payment_status,payment_method,items,order_number,customer_name,cashier_name,subtotal_amount,additional_charges,discount_amount,cash_received,change_amount");
    if(error){setSalesError(error.message);setSalesLoading(false);return;}
    const allRows=data||[];
    setSalesRows(allRows);
    const paidRows=allRows.filter(row=>row.payment_status!=="unpaid");
    const {data:unpaidData}=await supabase.from("sticker_studio_sales").select("id,order_number,customer_name,total_amount,amount_paid,payment_method,created_at").eq("payment_status","unpaid").order("created_at",{ascending:false});
    setUnpaidOrders(unpaidData||[]);
    const orderRows=resetData?.orders_reset_at?allRows.filter(row=>new Date(row.created_at)>=new Date(resetData.orders_reset_at)):allRows;
    const cashRows=resetData?.cash_reset_at?paidRows.filter(row=>new Date(row.created_at)>=new Date(resetData.cash_reset_at)):paidRows;
    const monthRows=paidRows.filter(row=>row.business_date>=monthStart&&(!resetData?.monthly_reset_at||new Date(row.created_at)>=new Date(resetData.monthly_reset_at)));
    setDailyOrders(orderRows.length);
    setDailySales(cashRows.reduce((sum,row)=>sum+Number(row.total_amount||0),0));
    setMonthlySales(monthRows.reduce((sum,row)=>sum+Number(row.total_amount||0),0));
    setSalesError("");setSalesLoading(false);
  }
  async function refreshNextOrderNumber(){
    if(!isSupabaseConfigured)return;
    const {data,error}=await supabase.rpc("syp_sticker_peek_order_number");
    if(!error&&data)setOrderNo(String(data));
  }

  useEffect(()=>{try{const savedCashier=localStorage.getItem("syp-studio-cashier");if(savedCashier&&["Jojo","Carl","Alex"].includes(savedCashier))setCashier(savedCashier);const q=localStorage.getItem("syp-signature-queue");const h=localStorage.getItem("syp-signature-history");const n=localStorage.getItem("syp-signature-id");if(q)setQueue(JSON.parse(q));if(h)setHistory(JSON.parse(h));if(n)setNextId(Number(n)||1);}catch{}setReady(true);void refreshDailySales();void refreshNextOrderNumber();},[]);
  useEffect(()=>{if(!ready)return;localStorage.setItem("syp-signature-queue",JSON.stringify(queue));localStorage.setItem("syp-signature-history",JSON.stringify(history));localStorage.setItem("syp-signature-id",String(nextId));localStorage.setItem("syp-signature-order-no",orderNo);},[queue,history,nextId,orderNo,ready]);

  const categories=["Coffee","Milky","Matcha","Soda","Fries","Waffle"];
  const categoryIcons:Record<string,string>={Coffee:"☕",Milky:"🥛",Matcha:"🍵",Soda:"🥤",Fries:"🍟",Waffle:"🧇"};
  const filtered=useMemo(()=>MENU.map((m,i)=>({m,i})).filter(({m})=>menuCategory(String(m[3]))===activeCategory&&(m[0].toLowerCase().includes(search.toLowerCase())||m[3].toLowerCase().includes(search.toLowerCase()))),[search,activeCategory]);
  const product=MENU[selected] ?? MENU[0];
  function quoteGroup(category:string){return category.includes("Matcha")?"Matcha":category.includes("Soda")?"Soda":category.includes("Milky")?"Milky":category.includes("Signature")?"Signature":category==="Fries"?"Fries":"Coffee";}
  function pickUniqueQuote(category:string,used:string[]=[]){
    const list=QUOTES[quoteGroup(category)]||QUOTES.Coffee;
    const available=list.filter(line=>!used.includes(line));
    const choices=available.length?available:list;
    return choices[Math.floor(Math.random()*choices.length)];
  }
  function randomQuote(category:string){
    const group=quoteGroup(category);
    const used=[...queue.filter(item=>quoteGroup(item.category)===group).map(item=>item.quote),...history.slice(0,40).filter(item=>quoteGroup(item.category)===group).map(item=>item.quote),quote];
    const nextQuote=pickUniqueQuote(category,used);
    setQuote(nextQuote);
    setQueue(rows=>rows.map(item=>({...item,quote:nextQuote})));
  }
  async function add(productIndex:number=selected){
    if(!isSupabaseConfigured){setNotice("Hindi naka-configure ang database. Hindi muna mase-save ang sale.");return;}
    const chosen=MENU[productIndex]??MENU[0];
    const count=Math.max(1,Math.min(100,quantity));
    const activeOrder=[...queue].reverse().find(item=>item.salePending);
    let allocatedNo=activeOrder?.orderNo;
    if(!allocatedNo){const {data:allocated,error:counterError}=await supabase.rpc("syp_sticker_next_order_number");if(counterError||!allocated){setNotice("Hindi makakuha ng order number: "+(counterError?.message||"Please try again."));return;}allocatedNo=String(allocated);}
    const group=quoteGroup(chosen[3]);
    const used=[...queue.filter(item=>quoteGroup(item.category)===group).map(item=>item.quote),...history.slice(0,40).filter(item=>quoteGroup(item.category)===group).map(item=>item.quote),quote];
    const made=Array.from({length:count},(_,i)=>{
      const itemQuote=pickUniqueQuote(chosen[3],used);
      used.push(itemQuote);
      return {id:nextId+i,customer:customer.trim(),drink:chosen[0],size:chosen[1],price:chosen[2],category:chosen[3],sugar,ice,note:note.trim(),quote:itemQuote,createdAt:stamp(),orderNo:allocatedNo!,salePending:true};
    });
    setSelected(productIndex);setQuote(pickUniqueQuote(chosen[3],used));
    setQueue(q=>[...q,...made]);setNextId(n=>n+count);
    setNotice(chosen[0]+" "+chosen[1]+" × "+count+" added · Order #"+allocatedNo+". Sales record kapag pinindot ang Print.");
    void refreshNextOrderNumber();
  }
  async function addCustomDrink(){
    const name=customDrinkName.trim();
    const price=Number(customDrinkPrice);
    if(!name){setNotice("Ilagay muna ang pangalan ng customized drink.");return;}
    if(customDrinkPrice.trim()===""||!Number.isFinite(price)||price<0){setNotice("Ilagay ang valid na presyo ng customized drink.");return;}
    if(!isSupabaseConfigured){setNotice("Hindi naka-configure ang database. Hindi muna mase-save ang sale.");return;}
    const count=Math.max(1,Math.min(100,quantity));
    const activeOrder=[...queue].reverse().find(item=>item.salePending);
    let allocatedNo=activeOrder?.orderNo;
    if(!allocatedNo){const {data:allocated,error:counterError}=await supabase.rpc("syp_sticker_next_order_number");if(counterError||!allocated){setNotice("Hindi makakuha ng order number: "+(counterError?.message||"Please try again."));return;}allocatedNo=String(allocated);}
    const customUsed=[...queue.filter(item=>item.orderNo===allocatedNo).map(item=>item.quote),...history.slice(0,40).map(item=>item.quote)];
    const item:Sticker={id:nextId,customer:customer.trim(),drink:name,size:customDrinkSize.trim()||"Custom",price,category:"Custom",sugar,ice,note:note.trim(),quote:"",createdAt:stamp(),orderNo:allocatedNo,salePending:true};
    const made=Array.from({length:count},(_,i)=>{const itemQuote=pickUniqueQuote("Coffee",customUsed);customUsed.push(itemQuote);return {...item,id:nextId+i,quote:itemQuote};});
    setQueue(q=>[...q,...made]);setNextId(n=>n+count);
    setNotice(name+" "+item.size+" × "+count+" added · ₱"+price.toFixed(2)+" each · Order #"+allocatedNo+".");
    void refreshNextOrderNumber();
    setCustomDrinkName("");setCustomDrinkPrice("");
  }
  async function print(ids?:number[]){const rawSelectedItems=ids?queue.filter(x=>ids.includes(x.id)):queue;if(!rawSelectedItems.length)return;const qz= (window as any).qz;if((printMode==="both"||printMode==="receipt")&&(!qz||!qz.websocket.isActive())){setNotice("Connect muna sa QZ Tray bago mag-print ng Epson receipt.");return;}if((printMode==="both"||printMode==="receipt")&&!qzPrinters.some(name=>name.trim()==="EPSON TM-T88IV Receipt")){setNotice("Hindi makita ang EPSON TM-T88IV Receipt. Pindutin ang Reconnect / Find Printers.");return;}const selectedItems=rawSelectedItems.map(item=>({...item,note:note.trim()||item.note}));if(paymentMethod!=="Cash"&&!paymentConfirmed){setNotice("Please confirm muna na natanggap na ang "+paymentMethod+" payment.");return;}const cashInput=cashReceived.trim()===""?0:Number(cashReceived);if(paymentMethod==="Cash"&&(!Number.isFinite(cashInput)||cashInput<0)){setNotice("Invalid ang cash received. Pakilagay ang tamang halaga.");return;}const paymentStatus=paymentMethod==="Cash"?(cashInput>=finalTotal&&cashInput>0?"paid":"unpaid"):"paid";const amountPaid=paymentStatus==="paid"?finalTotal:0;const pendingItems=selectedItems.filter(x=>x.salePending);if(pendingItems.length){if(!isSupabaseConfigured){setNotice("Hindi naka-configure ang database. Hindi maitatala ang sale.");return;}const groups=Array.from(new Set(pendingItems.map(x=>x.orderNo))).map(order=>pendingItems.filter(x=>x.orderNo===order));const businessDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());let discountRemaining=discountAmount;for(let index=0;index<groups.length;index++){const group=groups[index];const subtotal=group.reduce((sum,item)=>sum+Number(item.price||0),0);const charges=index===0?receiptCharges:[];const extraTotal=charges.reduce((sum,item)=>sum+item.amount,0);const orderDiscount=Math.min(subtotal+extraTotal,discountRemaining);discountRemaining=Math.max(0,discountRemaining-orderDiscount);const saleTotal=Math.max(0,subtotal+extraTotal-orderDiscount);const groupCash=index===0&&paymentMethod==="Cash"?cashInput:0;const sale={id:crypto.randomUUID(),order_number:group[0].orderNo,business_date:businessDate,customer_name:group[0].customer||"Walk-in",cashier_name:cashier,items:group.map(item=>({drink:item.drink,size:item.size,category:item.category,quantity:1,unit_price:Number(item.price),sugar:item.sugar,ice:item.ice,note:item.note,order_type:orderType})),total_quantity:group.length,subtotal_amount:subtotal,additional_charges:charges,discount_amount:orderDiscount,total_amount:saleTotal,payment_status:paymentStatus,amount_paid:paymentStatus==="paid"?saleTotal:0,payment_method:paymentMethod,cash_received:groupCash,change_amount:paymentMethod==="Cash"?Math.max(0,groupCash-saleTotal):0};const {error}=await supabase.from("sticker_studio_sales").insert(sale);if(error){setNotice("Hindi naitala ang sale kaya hindi muna magpi-print: "+error.message);return;}}const pendingIds=new Set(pendingItems.map(x=>x.id));setQueue(q=>q.map(item=>pendingIds.has(item.id)?{...item,salePending:false}:item));await refreshDailySales();}const selectedMode=printMode;setPrintItems(selectedItems);try{setNotice("Sending sticker and receipt to their printers…");await printSelectedWithQz(selectedItems,selectedMode);const nextHistory=[...selectedItems.map(item=>({...item,salePending:false})),...history].slice(0,250);const nextQueue=queue.filter(x=>!selectedItems.some(y=>y.id===x.id));setHistory(nextHistory);setQueue(nextQueue);try{localStorage.setItem("syp-signature-history",JSON.stringify(nextHistory));localStorage.setItem("syp-signature-queue",JSON.stringify(nextQueue));}catch{}setNotice((paymentStatus==="paid"?"PAID":"UNPAID")+". Sticker: browser Web Print (choose TP870 S). Receipt: sent to Epson via QZ Tray. Saved in history.");setPrintItems([]);setCheckoutOpen(false);}catch(error){setNotice("Hindi pa nakumpleto ang printing. Nananatili ang order sa queue para hindi mawala. "+((error as any)?.message||String(error)));}}
  function openPrintPreview(items:Sticker[]){setPrintItems(items.map(item=>({...item,note:note.trim()||item.note})));setPreviewOpen(true);}
  function reprint(s:Sticker){setPrintMode("stickers");setPrintItems([{...s,id:Date.now(),salePending:false}]);setNotice("Preparing sticker reprint for Order #"+s.orderNo+"… QZ Tray connection will stay active.");window.setTimeout(()=>window.print(),350);}

  if(!printerGateDone)return <main style={{minHeight:"100vh",background:"#090a0b",color:"#f3eee7",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Arial,sans-serif"}}><section style={{width:"min(100%,760px)",background:"#151719",border:"1px solid #34383b",borderRadius:28,padding:"clamp(24px,5vw,48px)",textAlign:"center",boxShadow:"0 18px 60px rgba(50,35,20,.12)"}}><img src={LOGO_URL} alt="SYP ON CAFÉ" style={{width:94,height:94,objectFit:"contain",margin:"0 auto 10px"}}/><div style={{fontSize:12,letterSpacing:4,fontWeight:900,color:"#c79a6b"}}>SYP ON CAFÉ</div><h1 style={{fontSize:"clamp(30px,6vw,46px)",margin:"10px 0 8px"}}>STICKER STUDIO</h1><p style={{fontSize:16,color:"#aaa49b",margin:"0 0 22px"}}>Ikonekta muna ang printers bago pumili ng cashier.</p><button type="button" onClick={async()=>{const ok=await connectQz();if(ok)setPrinterGateDone(true);}} style={{width:"100%",minHeight:112,border:0,borderRadius:20,background:"#493321",color:"#fffaf4",fontSize:"clamp(22px,4vw,30px)",fontWeight:900,cursor:"pointer",boxShadow:"0 8px 20px rgba(73,51,33,.2)"}}>🖨️ CONNECT PRINTERS<small style={{display:"block",fontSize:13,fontWeight:600,marginTop:9,opacity:.85}}>Connect QZ Tray · Find TP870 S + EPSON Receipt</small></button><div style={{marginTop:16,padding:14,borderRadius:14,background:"#202326",fontWeight:800,color:qzStatus==="Connection failed"?"#a33":"#72583f"}}>{qzStatus}</div>{qzPrinters.length>0&&<div style={{fontSize:12,color:"#806b58",marginTop:10}}>{qzPrinters.map((p,i)=><div key={p+"-"+i}>✓ {p}</div>)}</div>}{notice&&<p style={{fontSize:12,color:"#a33",margin:"10px 0"}}>{notice}</p>}<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:16,marginTop:22}}><button type="button" onClick={()=>setPrinterGateDone(true)} style={{border:0,background:"transparent",color:"#88745f",fontSize:13,textDecoration:"underline",cursor:"pointer",padding:10}}>Skip for now</button></div><p style={{fontSize:11,color:"#8f8981",margin:"8px 0 0"}}>Kapag successful ang connection, susunod na ang cashier selection. Awtomatikong susubukan ulit sa susunod na pagbukas ng site.</p></section></main>;
  if(!cashier)return <main style={{minHeight:"100vh",background:"#f3ede4",color:"#2e241c",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Arial,sans-serif"}}><section style={{width:"min(100%,720px)",background:"#fffaf4",border:"1px solid #e3d3c2",borderRadius:28,padding:"clamp(24px,5vw,48px)",textAlign:"center",boxShadow:"0 18px 60px rgba(50,35,20,.12)"}}><img src={LOGO_URL} alt="SYP ON CAFÉ" style={{width:100,height:100,objectFit:"contain",margin:"0 auto 12px"}}/><div style={{fontSize:12,letterSpacing:4,fontWeight:900,color:"#8b6b4e"}}>SYP ON CAFÉ</div><h1 style={{fontSize:"clamp(30px,6vw,48px)",margin:"10px 0 8px"}}>STICKER STUDIO</h1><p style={{fontSize:16,color:"#806b58",margin:"0 0 28px"}}>Sino ang cashier ngayon?</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14}}>{["Jojo","Carl","Alex"].map(name=><button key={name} type="button" onClick={()=>{localStorage.setItem("syp-studio-cashier",name);setCashier(name);}} style={{minHeight:150,border:"2px solid #d8c3ad",borderRadius:20,background:"#f7eee4",color:"#39291d",fontSize:26,fontWeight:900,cursor:"pointer"}}>☕<br/>{name}<small style={{display:"block",fontSize:12,fontWeight:600,marginTop:8}}>TAP TO ENTER</small></button>)}</div><p style={{fontSize:12,color:"#aaa49b",margin:"24px 0 0"}}>Piliin ang pangalan para makapasok sa cashier system.</p></section></main>;
  return <main className="studio" data-page={studioPage}>
    <style jsx global>{`
      *{box-sizing:border-box}body{margin:0;background:#f3ede4;color:#2e241c;font-family:Arial,sans-serif}.studio{min-height:100vh;padding:22px}.head,.layout{max-width:1200px;margin:0 auto 18px}.head{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;align-items:center;gap:13px}.brand img{width:58px;height:58px;object-fit:contain;background:#fff;border-radius:12px}.brand h1{font-size:25px;margin:0}.brand p{font-size:10px;letter-spacing:.18em;font-weight:800;color:#876b51;margin:5px 0}.layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(390px,460px);gap:18px;align-items:start}.panel{background:#fffdf9;border:1px solid #e6d8c8;border-radius:16px;padding:18px;min-width:0}.panel h2{font-size:18px;margin:0 0 6px}.muted{font-size:12px;line-height:1.5;color:#897762;margin:0 0 15px}.field{display:grid;gap:6px;margin:0 0 12px}.field label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#80644c}.field input,.field select{width:100%;min-width:0;border:1px solid #ddcbb7;border-radius:9px;background:white;padding:11px;font-size:14px;color:#30251c}.btn{border:0;border-radius:9px;background:#65472f;color:white;padding:11px 14px;font-weight:800;font-size:12px;cursor:pointer}.btn.alt{background:#efe4d6;color:#65472f}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.notice{margin-top:12px;padding:10px;background:#f4e9d9;border-radius:8px;font-size:12px;color:#684a31}.queue{display:grid;gap:12px}.queue-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #eadfD2;border-radius:12px;padding:12px}.preview{width:100%;aspect-ratio:1/1;overflow:hidden;background:white;border:1px dashed #cdbba5}.small{font-size:11px;color:#6b4c33}.queue-buttons{display:flex;flex-direction:column;gap:6px}.smallbtn{border:1px solid #d8c5b0;border-radius:7px;background:#fff;padding:8px;color:#684a31;font-weight:800;font-size:10px;cursor:pointer}.checkout-overlay{position:fixed;inset:0;z-index:1000;background:rgba(30,22,16,.58);display:flex;align-items:center;justify-content:center;padding:14px}.checkout-card{width:min(100%,430px);max-height:min(88vh,720px);overflow:auto;background:#fffdf9;border:1px solid #e6d8c8;border-radius:18px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.28)}.checkout-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.checkout-total{background:#f4eadc;border-radius:13px;padding:13px;margin:12px 0;display:flex;justify-content:space-between;align-items:center}.checkout-total strong{font-size:27px}.checkout-change{background:#e9f4e9;border:1px solid #c7dfc7;border-radius:13px;padding:13px;display:flex;justify-content:space-between;align-items:center;gap:8px;margin:10px 0}.checkout-change strong{font-size:27px;color:#23643b}.checkout-change.short{background:#fff2e5;border-color:#f1d2ad}.checkout-change.short strong{color:#a65312}.checkout-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.checkout-grid .field{margin:0}.checkout-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.checkout-actions .btn{min-height:46px}.checkout-items{max-height:150px;overflow:auto;border:1px solid #eadfD2;border-radius:10px;padding:9px;display:grid;gap:7px}.checkout-item{display:flex;justify-content:space-between;gap:8px;font-size:12px}.checkout-overlay .field input,.checkout-overlay .field select{padding:12px;font-size:16px}.checkout-overlay .small{font-size:11px}.history{margin-top:24px;display:grid;gap:8px}.history-scroll{max-height:clamp(240px,42vh,440px);overflow-y:auto;overscroll-behavior:contain;padding:0 9px 8px 0;scrollbar-width:thin;scrollbar-color:#bda58b #f2e9df}.history-scroll::-webkit-scrollbar{width:7px}.history-scroll::-webkit-scrollbar-thumb{background:#bda58b;border-radius:10px}.history-scroll::-webkit-scrollbar-track{background:#f2e9df;border-radius:10px}.category-tabs{display:flex;gap:7px;overflow-x:auto;padding:3px 1px 8px;scrollbar-width:thin}.category-tab{flex:0 0 auto;border:1px solid #dfcdb9;background:#fff;border-radius:999px;padding:8px 13px;font-size:11px;font-weight:900;color:#76563b;cursor:pointer}.category-tab.active{background:#65472f;color:#fff;border-color:#65472f}.quick-menu{display:grid;gap:12px;margin:10px 0 16px;max-height:clamp(280px,58vh,620px);overflow-y:auto;overscroll-behavior:contain;padding:10px;border:1px solid #eadfD2;border-radius:14px;background:#faf6f0;scrollbar-gutter:stable}.quick-menu::-webkit-scrollbar{width:7px}.quick-menu::-webkit-scrollbar-thumb{background:#cbb69e;border-radius:10px}.quick-menu::-webkit-scrollbar-track{background:#f1e8dc;border-radius:10px}.menu-divider{display:flex;align-items:center;gap:10px;margin:5px 0 0}.menu-divider span{font-size:11px;font-weight:900;letter-spacing:.16em;color:#76563b;white-space:nowrap}.menu-divider i{height:1px;background:#d9c7b3;flex:1}.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.payment-confirm{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid #d7c3aa;border-radius:10px;background:#fff8ef;font-size:12px}.payment-confirm input{width:18px;height:18px;margin:1px 0 0;accent-color:#65472f}.payment-confirm span{display:grid;gap:3px}.payment-confirm small{font-size:10px;color:#806b56;line-height:1.4}.report-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.report-card{padding:12px;border:1px solid #e6d8c8;border-radius:12px;background:#fffaf4;min-width:0}.report-card strong{display:block;font-size:18px;margin-top:5px}.report-line{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #eee3d7;font-size:12px}.report-line:last-child{border:0}.report-scroll{max-height:230px;overflow:auto}.order-summary-bar{position:sticky;top:8px;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin:8px 0 14px;border:1px solid #e3d1bd;border-radius:13px;background:#fbf4eb;box-shadow:0 5px 16px rgba(70,48,29,.08)}.order-summary-bar div{display:grid;gap:2px}.order-summary-bar span{font-size:9px;letter-spacing:.1em;font-weight:900;color:#80644c}.order-summary-bar strong{font-size:23px}.order-summary-bar small{font-size:10px;color:#897762}.order-summary-bar .btn{white-space:nowrap}.queue-edit{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex-wrap:wrap}.queue-edit button{width:30px;height:30px;border:1px solid #d8c5b0;border-radius:8px;background:#fff;color:#65472f;font-weight:900;cursor:pointer}.queue-edit .remove{width:auto;padding:0 9px;font-size:10px}.quick-item{min-width:0;min-height:72px;border:1px solid #e4d4c2;border-radius:11px;background:#fff;padding:10px;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 8px;color:#35281e;cursor:pointer;transition:background .12s,border-color .12s,transform .12s}.quick-item:active{transform:scale(.98);background:#f4eadc}.quick-item strong{font-size:12px;line-height:1.2;overflow-wrap:anywhere}.quick-item span{font-size:10px;color:#8a725b}.quick-item b{grid-column:2;grid-row:1 / span 2;font-size:14px;white-space:nowrap;color:#65472f}.quick-item.selected{border-color:#8c6747;background:#f8f0e6}.history-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;border-bottom:1px solid #eee4d9;padding:11px 0;font-size:12px;min-width:0}.history-info{display:grid;gap:4px;min-width:0}.history-name{font-size:13px;font-weight:900;line-height:1.25;overflow-wrap:anywhere}.history-specs{display:flex;flex-wrap:wrap;align-items:center;gap:5px 9px;font-size:12px;font-weight:800;color:#65472f}.history-meta{font-size:10px;line-height:1.4;color:#897762;overflow-wrap:anywhere}.history-price{font-size:13px;font-weight:900;color:#2e241c;white-space:nowrap}
       .art{width:46mm;height:66mm;box-sizing:border-box;background:white;color:#000;overflow:hidden;margin:2mm 2mm;padding:1.5mm;border:.35mm solid #000;display:flex;flex-direction:column;font-family:Arial,sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}.art-top{display:flex;align-items:center;justify-content:space-between;border-bottom:.5mm solid #000;padding-bottom:1mm;gap:1mm;flex:0 0 auto;min-height:10mm}.art-logo{width:11mm;height:8mm;object-fit:contain}.art-brand{flex:1;text-align:center}.art-brand strong{display:block;font-size:9.5pt;letter-spacing:.035em}.art-brand span{font-size:4pt;font-weight:900;letter-spacing:.12em} .art-qr-row{display:grid;grid-template-columns:1fr 1fr;align-items:stretch;gap:1.5mm;width:100%;margin:1.5mm 0 0;padding:0 .4mm;flex:0 0 auto;min-height:0}.art-qr-card,.art-qr-row>div{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:100%;min-width:0;min-height:20mm;padding:1mm .5mm .8mm;border:.25mm solid #222;border-radius:1mm;gap:.6mm}.art-qr-main,.art-wifi-qr{width:15mm;height:15mm;object-fit:contain;display:block;image-rendering:pixelated;flex:0 0 auto}.art-wifi-box{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:100%;gap:.6mm}.art-wifi-label,.art-qr-label{text-align:center;font-size:4.4pt;font-weight:900;letter-spacing:.025em;line-height:1.05;min-height:2mm}.art-wifi-name{text-align:center;font-size:3.7pt;line-height:1;font-weight:800} .art-quote{grid-column:1 / -1;min-width:0;min-height:7mm;padding:.8mm 1mm;text-align:center;font-size:5.8pt;font-weight:900;line-height:1.12;display:flex;align-items:center;justify-content:center;overflow-wrap:anywhere;word-break:normal;border-top:.25mm solid #000;border-bottom:.25mm solid #000}.art-order{font-size:5pt;font-weight:900;text-align:center;margin-top:.7mm;letter-spacing:.1em;flex:0 0 auto}.art-drink{font-size:13pt;line-height:1.02;text-align:center;font-weight:900;overflow-wrap:anywhere;margin:.8mm 0 .3mm;flex:0 0 auto}.art-meta{display:flex;justify-content:center;gap:1mm;font-size:4.3pt;font-weight:900;margin-top:.4mm;flex-wrap:wrap;flex:0 0 auto}.art-customer{text-align:center;font-size:4.3pt;font-weight:900;margin-top:.4mm;flex:0 0 auto}.art-note{text-align:center;font-size:3.8pt;font-weight:800;margin-top:.3mm;flex:0 0 auto}.art-foot{display:flex;justify-content:space-between;align-items:center;font-size:3.6pt;font-weight:900;padding-top:.5mm;letter-spacing:.04em;flex:0 0 auto}.print-only-container{display:none}.print-sheet{display:none}.receipt-sheet{display:block;width:100%;background:#fff;color:#000}.receipt{width:72mm;max-width:100%;box-sizing:border-box;margin:0 auto;padding:3mm 2.5mm;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:8pt;line-height:1.25;overflow-wrap:anywhere}.receipt-header{text-align:center}.receipt-head{text-align:center;font-weight:900;font-size:17pt;letter-spacing:.02em;line-height:1.1}.receipt-sub{text-align:center;font-size:7pt;font-weight:700;letter-spacing:.08em;margin-top:1mm}.receipt-address{text-align:center;font-size:6.5pt;margin-top:.8mm}.receipt-rule{border-top:.25mm dashed #333;margin:2mm 0}.receipt-meta{display:grid;grid-template-columns:1fr;gap:.8mm;font-size:7pt}.receipt-meta div{display:flex;justify-content:space-between;gap:2mm}.receipt-meta span{color:#333}.receipt-meta strong{text-align:right}.receipt-columns{display:flex;justify-content:space-between;font-size:7pt;font-weight:900;margin-bottom:1mm}.receipt-row{display:flex;justify-content:space-between;gap:2mm;font-size:7.5pt;line-height:1.25;margin:1mm 0}.receipt-total{font-size:12pt;font-weight:900;border-top:.4mm solid #000;border-bottom:.4mm solid #000;padding:1.5mm 0;margin:1.5mm 0}.receipt-change{font-size:9pt;font-weight:900}.receipt-item{margin:1.5mm 0}.receipt-item-main{display:flex;justify-content:space-between;gap:2mm;font-size:7.5pt}.receipt-item small{display:block;font-size:6.5pt;margin-top:.4mm}.receipt-note{border-top:.2mm dashed #777;padding-top:1mm;margin-top:1mm;font-size:7pt}.receipt-foot{text-align:center;font-size:8pt;font-weight:900;margin-top:2mm}.receipt-site{text-align:center;font-size:6pt;margin-top:1mm}.art{width:46mm;height:66mm;box-sizing:border-box;background:#fff;color:#000;overflow:hidden;margin:0;padding:1.5mm;border:.35mm solid #000;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;font-family:Arial,sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}.art-top{height:10mm;min-height:10mm;display:flex;align-items:center;justify-content:flex-start;gap:1mm;border:0;border-bottom:.4mm solid #000;padding:0 0 1mm;position:relative}.art-logo{width:10mm;height:8mm;object-fit:contain;flex:0 0 auto}.art-brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:32mm;text-align:center;white-space:nowrap}.art-brand strong{display:block;font-size:9pt;letter-spacing:.03em}.art-brand span{display:block;font-size:4pt;font-weight:900;letter-spacing:.1em}.art-order{font-size:3.5pt;font-weight:900;letter-spacing:.05em;text-align:center;line-height:1.1;max-height:3mm;overflow:hidden}.art-center{height:34mm;min-height:34mm;display:flex;align-items:center;justify-content:center}.art-center-circle{width:32mm;height:32mm;border:.45mm solid #000;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3mm 2.5mm;text-align:center;overflow:hidden;gap:1mm}.art-drink{font-size:12pt;font-weight:900;line-height:1.02;text-align:center;overflow-wrap:anywhere;margin:0}.art-customer{font-size:4pt;font-weight:900;line-height:1}.art-quote{font-size:5pt;font-weight:900;line-height:1.08;text-align:center;overflow-wrap:anywhere;max-height:8mm;overflow:hidden}.art-meta{display:flex;justify-content:center;gap:.7mm;flex-wrap:wrap;font-size:3.6pt;font-weight:900;line-height:1}.art-qr-row{height:17mm;min-height:17mm;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:1mm;width:100%;margin:0;padding:0}.art-qr-card,.art-qr-row>div{border:0;border-radius:0;min-height:0;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4mm}.art-qr-main,.art-wifi-qr{width:13mm;height:13mm;object-fit:contain;display:block;image-rendering:pixelated}.art-qr-label,.art-wifi-label{font-size:3.5pt;font-weight:900;line-height:1;text-align:center}.art-wifi-name{font-size:3pt;font-weight:800;line-height:1}.art-foot{display:flex;justify-content:space-between;align-items:center;font-size:3pt;font-weight:900;line-height:1;padding-top:.4mm;border-top:.25mm solid #000;letter-spacing:.02em}
      .mobile-checkout-dock{display:none}
      @media(max-width:700px){
        .studio{padding:10px 10px calc(92px + env(safe-area-inset-bottom))!important}
        .head{gap:8px;align-items:center!important}
        .brand{gap:8px;min-width:0}
        .brand img{width:42px!important;height:42px!important;border-radius:9px!important}
        .brand h1{font-size:16px!important;line-height:1.15}
        .brand p{font-size:8px!important;margin:3px 0 0!important}
        .head>div:last-child{gap:5px!important}
        .head .btn{padding:9px 10px!important;font-size:10px!important}
        .panel{padding:13px!important;border-radius:14px!important}
        .layout{gap:10px!important}
        .form-panel h2,.panel h2{font-size:16px!important}
        .category-tabs{gap:6px!important;padding-bottom:7px!important}
        .category-tab{padding:9px 12px!important;font-size:11px!important}
        .quick-menu{max-height:43vh!important;padding:7px!important;gap:9px!important}
        .quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        .quick-item{min-height:64px!important;padding:9px!important;border-radius:10px!important}
        .quick-item strong{font-size:11px!important}
        .quick-item b{font-size:13px!important}
        .field{margin-bottom:10px!important}
        .field input,.field select{min-height:43px!important;font-size:16px!important}
        .btn{min-height:42px}
        .order-summary-bar{top:5px!important;padding:10px!important;margin:5px 0 10px!important}
        .order-summary-bar strong{font-size:20px!important}
        .queue-row{padding:9px!important;gap:8px!important}
        .mobile-checkout-dock{position:fixed;display:flex!important;align-items:center;justify-content:space-between;gap:12px;left:0;right:0;bottom:0;z-index:900;background:rgba(255,253,249,.97);border-top:1px solid #e6d8c8;padding:10px 13px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -5px 22px rgba(46,36,28,.12);backdrop-filter:blur(12px)}
        .mobile-checkout-dock .dock-total{display:grid;gap:2px;min-width:0}
        .mobile-checkout-dock .dock-total span{font-size:9px;letter-spacing:.08em;font-weight:900;color:#80644c}
        .mobile-checkout-dock .dock-total strong{font-size:20px;line-height:1.1;white-space:nowrap}
        .mobile-checkout-dock .dock-total small{font-size:10px;color:#897762}
        .mobile-checkout-dock .btn{min-width:142px;min-height:46px;padding:10px 13px!important;font-size:12px!important}
      }
      /* ROG Ally / handheld landscape touch layout */
      @media (min-width:701px) and (max-width:1100px) and (orientation:landscape){
        .studio{padding:12px!important}
        .head,.layout{max-width:100%!important;margin-bottom:12px!important}
        .head{gap:10px!important}
        .brand img{width:48px!important;height:48px!important}
        .brand h1{font-size:19px!important}
        .layout{grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr)!important;gap:12px!important}
        .panel{padding:14px!important;border-radius:14px!important}
        .panel h2{font-size:17px!important}
        .muted{font-size:12px!important;margin-bottom:10px!important}
        .field{gap:7px!important;margin-bottom:10px!important}
        .field label{font-size:11px!important}
        .field input,.field select{min-height:48px!important;padding:10px 12px!important;font-size:16px!important}
        .btn,.smallbtn,.category-tab{min-height:46px!important;padding:11px 14px!important;font-size:13px!important}
        .category-tabs{gap:7px!important;flex-wrap:wrap!important}
        .quick-menu{max-height:48vh!important;overflow:auto!important}
        .quick-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
        .quick-item{min-height:76px!important;padding:11px!important;border-radius:12px!important;touch-action:manipulation}
        .quick-item strong{font-size:12px!important}
        .quick-item b{font-size:15px!important}
        .queue{gap:9px!important;max-height:42vh;overflow:auto}
        .queue-row{padding:9px!important;gap:9px!important}
        .queue-buttons .smallbtn{min-height:42px!important;padding:8px 10px!important}
        .actions{gap:8px!important}
        button,select,input{touch-action:manipulation}
        button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #b77b3c!important;outline-offset:3px!important}
      }
      @media (min-width:701px) and (max-width:1100px) and (orientation:portrait){
        .studio{padding:12px!important}
        .layout{grid-template-columns:1fr!important;gap:12px!important}
        .quick-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        .quick-item{min-height:72px!important}
        .field input,.field select{min-height:48px!important;font-size:16px!important}
        .btn,.smallbtn,.category-tab{min-height:46px!important}
      }
      @media (hover:none) and (pointer:coarse){
        button,.btn,.smallbtn,.category-tab{ -webkit-tap-highlight-color:transparent; }
        .quick-item:active,.btn:active,.smallbtn:active,.category-tab:active{transform:scale(.98)}
      }
      @media(max-width:380px){.head .btn:first-child{display:none}.mobile-checkout-dock .btn{min-width:128px}.brand h1{font-size:14px!important}}
      @media(max-width:900px){.layout{grid-template-columns:1fr}.studio{padding:13px}.quick-menu{max-height:48vh}}@media(max-width:700px){.studio{padding:10px 10px calc(92px + env(safe-area-inset-bottom))!important}}@media(min-width:901px){.form-panel{position:sticky;top:12px;align-self:start}.layout>section:last-of-type{min-width:0}}@media(max-width:480px){.head{align-items:flex-start}.queue-row{grid-template-columns:1fr}.queue-buttons{flex-direction:row;flex-wrap:wrap}.quick-menu{max-height:46vh;padding:8px}.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @page{size:${stickerWidth}mm ${stickerHeight}mm;margin:0} @page receipt{size:${receiptWidth}mm auto;margin:0} @media print{html,body{width:${stickerWidth}mm!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important}body *{visibility:hidden!important}.studio,.studio .print-only-container,.studio .print-only-container *{visibility:visible!important}.studio{display:block!important;position:static!important;width:${stickerWidth}mm!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;background:#fff!important}.studio>*:not(.print-only-container){display:none!important}.print-only-container{display:block!important;position:static!important;width:${stickerWidth}mm!important;margin:0!important;padding:0!important}.print-sheet{display:block!important;position:relative!important;box-sizing:border-box!important;width:${stickerWidth}mm!important;height:${stickerHeight}mm!important;min-width:${stickerWidth}mm!important;max-width:${stickerWidth}mm!important;min-height:${stickerHeight}mm!important;max-height:${stickerHeight}mm!important;margin:0!important;padding:0!important;overflow:hidden!important;break-inside:avoid!important;page-break-inside:avoid!important;break-after:page!important;page-break-after:always!important}.receipt-sheet{page:receipt!important;display:block!important;position:relative!important;width:${receiptWidth}mm!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;break-inside:avoid!important;page-break-inside:avoid!important;break-after:auto!important;page-break-after:auto!important}.receipt{width:${receiptInnerWidth}mm;height:auto;max-height:none;box-sizing:border-box;margin:0 0 0 1mm;padding:2mm 3mm;color:#000;background:#fff;font-family:Arial,sans-serif;font-size:7pt;line-height:1.2;overflow:visible;break-inside:auto;page-break-inside:auto}.receipt-item,.receipt-row{break-inside:avoid!important;page-break-inside:avoid!important}.receipt-head{text-align:center;font-weight:900;font-size:12pt;letter-spacing:.03em;line-height:1.05}.receipt-sub{text-align:center;font-size:5pt;font-weight:800;letter-spacing:.1em;margin-top:.5mm}.receipt-title{text-align:center;font-size:7pt;font-weight:900;margin:1mm 0}.receipt-rule{border-top:.25mm dashed #000;margin:1mm 0}.receipt-row{display:flex;justify-content:space-between;gap:1.5mm;font-size:6.5pt;line-height:1.2}.receipt-total{font-size:9pt;font-weight:900}.receipt-change{font-size:11pt;font-weight:900}.receipt-item{margin:.6mm 0}.receipt-social{text-align:center;margin:1mm auto .5mm;display:flex;flex-direction:column;align-items:center;gap:.3mm}.receipt-social img{width:8mm;height:8mm;object-fit:contain;display:block}.receipt-social span{font-size:4.5pt;font-weight:900;letter-spacing:.04em}.receipt-foot{text-align:center;font-size:6pt;font-weight:900;margin-top:1mm}.print-sheet .art{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center center!important;display:flex!important;box-sizing:border-box!important;width:${stickerInnerHeight}mm!important;height:${stickerInnerWidth}mm!important;min-height:${stickerInnerWidth}mm!important;max-height:${stickerInnerWidth}mm!important;margin:0!important;padding:1.5mm!important;border:.5mm solid #000!important;border-left:.8mm solid #000!important;overflow:hidden!important;gap:0!important}.art-top{position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;flex:0 0 auto!important;width:100%!important;padding-bottom:1mm!important;min-height:10mm!important}.art-logo{width:11mm!important;height:8mm!important;flex:0 0 auto!important}.art-brand{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:48mm!important;max-width:48mm!important;flex:none!important;text-align:center!important;white-space:nowrap!important}.art-brand strong{font-size:9.5pt!important;line-height:1!important;letter-spacing:.035em!important}.art-brand span{font-size:4pt!important;letter-spacing:.12em!important}.art-date{flex:0 0 auto!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow:hidden!important;white-space:nowrap!important;text-overflow:clip!important;text-align:center!important;font-size:4.2pt!important;line-height:1!important;letter-spacing:.02em!important;margin-top:.6mm!important;padding:0 .5mm!important}.art-drink{flex:0 0 auto!important;font-size:13pt!important;line-height:1.02!important;margin:.8mm 0 .3mm!important}.art-meta,.art-customer,.art-note{flex:0 0 auto!important;font-size:4.3pt!important;margin-top:.4mm!important}.art-qr-row{flex:0 0 auto!important;display:grid!important;grid-template-columns:1fr 1fr!important;align-items:stretch!important;justify-content:stretch!important;width:100%!important;box-sizing:border-box!important;margin:1mm 0 0!important;padding:0 .4mm!important;gap:1.5mm!important}.art-qr-card,.art-qr-row>div{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:20mm!important;flex:initial!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;padding:1mm .5mm .8mm!important;border:.25mm solid #222!important;gap:.6mm!important}.art-qr-main,.art-wifi-qr{width:15mm!important;height:15mm!important;object-fit:contain!important;display:block!important;image-rendering:pixelated!important;flex:0 0 auto!important}.art-wifi-box{width:100%!important;flex:initial!important}.art-qr-label,.art-wifi-label{font-size:4.4pt!important;line-height:1.05!important;min-height:2mm!important}.art-wifi-name{font-size:3.7pt!important}.art-quote{grid-column:1 / -1!important;flex:0 0 auto!important;min-height:7mm!important;margin-top:.5mm!important;padding:.8mm 1mm!important;font-size:5.8pt!important;line-height:1.12!important;overflow-wrap:anywhere!important;border-top:.25mm solid #000!important;border-bottom:.25mm solid #000!important;border-left:0!important;border-right:0!important}.art-foot{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:1mm!important;width:100%!important;min-width:0!important;flex:0 0 auto!important;font-size:4pt!important;line-height:1!important;padding-top:.5mm!important;letter-spacing:.02em!important;white-space:nowrap!important}.art-foot span{display:block!important;min-width:0!important;white-space:nowrap!important}.art-foot span:last-child{justify-self:end!important;text-align:right!important}.print-sheet .art{display:flex!important;position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center center!important;width:${stickerInnerHeight}mm!important;height:${stickerInnerWidth}mm!important;min-height:${stickerInnerWidth}mm!important;max-height:${stickerInnerWidth}mm!important;margin:0!important;padding:1.5mm!important;overflow:hidden!important;justify-content:space-between!important}.art-top{height:10mm!important;min-height:10mm!important}.art-center{height:40mm!important;min-height:40mm!important}.art-center-circle{width:38mm!important;height:38mm!important;border:.45mm solid #000!important;border-radius:50%!important}.art-qr-row{height:20mm!important;min-height:20mm!important;grid-template-columns:1fr 1fr!important;gap:1mm!important}.art-qr-card,.art-qr-row>div{border:0!important;min-height:0!important;padding:0!important}.art-qr-main,.art-wifi-qr{width:15mm!important;height:15mm!important}.art-quote{max-height:8mm!important;overflow:hidden!important}}}}

      /* UNIVERSAL SYP ON CAFE LABEL — reference-matched, monochrome thermal */
      .art.ref-art{position:relative!important;box-sizing:border-box!important;width:46mm!important;height:76mm!important;min-width:46mm!important;min-height:76mm!important;padding:1.4mm!important;border:.75mm double #000!important;border-radius:5mm!important;background:#fff!important;color:#000!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:0!important;overflow:hidden!important;font-family:Arial,Helvetica,sans-serif!important}
      .ref-head{height:23%;flex:0 0 23%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4mm;border-bottom:.35mm solid #000;padding:0 0 1mm;min-height:0}
      .ref-logo{display:block!important;width:11mm!important;height:10mm!important;object-fit:contain!important;object-position:center!important}
      .ref-wordmark{font-size:10pt;font-weight:1000;line-height:1;letter-spacing:-.035em;text-align:center;white-space:nowrap}
      .ref-tagline{font-size:5pt;font-weight:600;line-height:1.1;letter-spacing:.035em;text-align:center;white-space:nowrap}
      .ref-orderline{height:5%;flex:0 0 5%;display:flex;align-items:center;justify-content:flex-start;padding:0 .5mm;font-size:9pt;font-weight:900;letter-spacing:.02em}
      .ref-drinkline{height:8%;flex:0 0 8%;display:flex;align-items:center;justify-content:center;text-align:left;padding:0 .5mm;min-height:0;overflow:hidden}
      .ref-drink{font-family:Georgia,"Times New Roman",serif!important;font-weight:900!important;line-height:1.02!important;letter-spacing:-.025em!important;color:#000!important;max-width:100%;max-height:100%;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
      .ref-detail-line{height:7%;flex:0 0 7%;display:flex;align-items:center;justify-content:flex-start;gap:1.4mm;padding:0 .5mm;font-size:7pt;line-height:1;font-weight:500;white-space:nowrap}
      .ref-detail-line .sparkle{font-size:11pt;line-height:1}
      .ref-detail-line .dot{font-size:9pt;font-weight:900}
      .ref-date-line{height:7%;flex:0 0 7%;display:flex;align-items:center;justify-content:flex-end;padding:0 .5mm;border-bottom:.35mm solid #000;font-size:7pt;font-weight:500;white-space:nowrap}
      .ref-customer-line{height:8%;flex:0 0 8%;display:flex;align-items:center;justify-content:center;padding:.3mm .5mm 0;font-family:Georgia,"Times New Roman",serif;font-size:12pt;font-weight:900;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ref-mood-line{height:24%;flex:0 0 24%;display:flex;align-items:center;justify-content:center;min-height:0;padding:.3mm}
      .ref-mood-circle{width:100%;height:100%;max-width:26mm;max-height:26mm;aspect-ratio:1/1;border:.55mm solid #000;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;text-align:center;padding:1.4mm}
      .ref-mood-circle:after{content:"";position:absolute;inset:1.2mm;border:.25mm solid #000;border-radius:50%;pointer-events:none}
      .ref-mood-title{font-family:Georgia,"Times New Roman",serif;font-size:7pt;font-weight:900;letter-spacing:.06em;line-height:1}
      .ref-mood-sparkle{font-size:6pt;line-height:1;margin:.4mm 0}
      .ref-mood-copy{font-family:Georgia,"Times New Roman",serif;font-size:9pt;font-weight:900;line-height:.96;letter-spacing:-.025em}
      .ref-social-line{height:6%;flex:0 0 6%;display:flex;align-items:center;justify-content:center;gap:1.5mm;font-size:8pt;font-weight:700;white-space:nowrap}
      .ref-social-line .social-icons{display:flex;align-items:center;gap:1mm}.ref-social-line .social-icons svg{width:5mm;height:5mm;display:block;flex:0 0 auto}
      .ref-qr-line{height:12%;flex:0 0 12%;display:flex;align-items:center;justify-content:center;min-height:0}
      .ref-qr-line img{width:10mm;height:10mm;object-fit:contain;image-rendering:pixelated;display:block}
      .print-sheet .art.ref-art{width:${stickerInnerWidth}mm!important;height:${stickerInnerHeight}mm!important;min-width:${stickerInnerWidth}mm!important;max-width:${stickerInnerWidth}mm!important;min-height:${stickerInnerHeight}mm!important;max-height:${stickerInnerHeight}mm!important;margin:0!important;padding:1.4mm!important;transform:translate(-50%,-50%)!important}
      .preview-art{position:absolute;inset:0;container-type:size;overflow:hidden;background:#fff}
      .preview-art .art.ref-art{width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;padding:2.2cqh 2.2cqw!important;border-width:.75cqh!important;border-radius:5cqh!important}
      .preview-art .ref-logo{width:23cqh!important;height:17cqh!important}
      .preview-art .ref-wordmark{font-size:clamp(8px,3.2cqh,20px)!important}
      .preview-art .ref-tagline{font-size:clamp(4px,1.45cqh,9px)!important}
      .preview-art .ref-orderline{font-size:clamp(8px,2.8cqh,17px)!important}
      .preview-art .ref-drink{font-size:clamp(12px,4.3cqh,27px)!important}
      .preview-art .ref-detail-line{font-size:clamp(6px,2.15cqh,13px)!important}
      .preview-art .ref-detail-line .sparkle{font-size:clamp(9px,3cqh,18px)!important}
      .preview-art .ref-date-line{font-size:clamp(6px,2cqh,12px)!important}
      .preview-art .ref-customer-line{font-size:clamp(9px,4cqh,24px)!important}
      .preview-art .ref-mood-circle{max-width:36cqh!important;max-height:36cqh!important;border-width:.55cqh!important}
      .preview-art .ref-mood-circle:after{inset:1.2cqh!important;border-width:.25cqh!important}
      .preview-art .ref-mood-title{font-size:clamp(6px,2.3cqh,14px)!important}
      .preview-art .ref-mood-sparkle{font-size:clamp(5px,1.8cqh,11px)!important}
      .preview-art .ref-mood-copy{font-size:clamp(8px,3.2cqh,19px)!important}
      .preview-art .ref-social-line{font-size:clamp(7px,2.6cqh,16px)!important}
      .preview-art .ref-social-line .social-icons svg{width:4.8cqh!important;height:4.8cqh!important}
      .preview-art .ref-qr-line img{width:18cqh!important;height:18cqh!important}

      /* SYP dark coffee-shop theme */
      body{background:#10100f!important;color:#f5eee5!important;font-family:Georgia,"Palatino Linotype",serif!important}
      .studio{background:#10100f;color:#f5eee5;padding:clamp(12px,2vw,24px)}
      .studio .head h1,.studio .panel h2,.studio h3{font-family:Georgia,"Palatino Linotype",serif;letter-spacing:.02em;color:#f7efe4}
      .studio .brand img{background:#211f1b;border:1px solid #494034}
      .studio .brand p,.studio .muted,.studio .small{color:#b6a895}
      .studio .panel{background:#1b1a18;border:1px solid #39342c;color:#f5eee5;box-shadow:0 10px 30px rgba(0,0,0,.22)}
      .studio .field label{color:#d2ad79}
      .studio .field input,.studio .field select{background:#11110f;border:1px solid #514536;color:#f7efe4;border-radius:11px}
      .studio .field input::placeholder{color:#8f8374}
      .studio .btn{background:#b8874f;color:#17120d;border-radius:11px;font-weight:900}
      .studio .btn.alt,.studio .smallbtn{background:#29251f;color:#e9d3b3;border:1px solid #5a4935}
      .studio .notice{background:#30271d;color:#f2d8b4;border:1px solid #725633}
      .category-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0 18px}
      .category-card{min-width:0;min-height:112px;border:1px solid #514536;border-radius:15px;background:linear-gradient(145deg,#28241f,#191816);color:#f4eadc;padding:12px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;box-shadow:0 5px 14px rgba(0,0,0,.18);transition:transform .12s,border-color .12s,background .12s}
      .category-card:active{transform:scale(.97)}
      .category-card.active{border:2px solid #c99b63;background:linear-gradient(145deg,#493520,#292019);box-shadow:0 0 0 2px rgba(201,155,99,.12)}
      .category-picture{font-family:system-ui,sans-serif;font-size:30px;line-height:1.1;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))}
      .category-card strong{font-family:Georgia,serif;font-size:15px;letter-spacing:.03em}
      .category-card small{font-family:Arial,sans-serif;font-size:9px;color:#b9aa96;text-align:center;line-height:1.25}
      .menu-section-heading{display:flex;justify-content:space-between;align-items:end;gap:10px;margin:8px 2px 10px}
      .menu-section-heading h3{font-size:24px;margin:3px 0 0}
      .menu-eyebrow{font:800 9px Arial,sans-serif;letter-spacing:.2em;color:#c99b63}
      .menu-count{font:700 10px Arial,sans-serif;color:#b9aa96;padding-bottom:4px}
      .quick-menu{background:#141311;border:1px solid #39342c;border-radius:15px;max-height:clamp(300px,58vh,650px);padding:10px}
      .quick-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .quick-item{position:relative;min-height:104px;background:linear-gradient(145deg,#282622,#1d1c19);border:1px solid #484034;border-radius:13px;padding:11px 10px 10px 48px;color:#f5eee5;grid-template-columns:minmax(0,1fr) auto;gap:5px 6px;align-content:center}
      .quick-item strong{font-family:Georgia,"Palatino Linotype",serif;font-size:14px;line-height:1.2;color:#fff7eb}
      .quick-item .menu-product-picture{position:absolute;left:10px;top:50%;transform:translateY(-50%);font:27px system-ui,sans-serif;width:32px;text-align:center}
      .quick-item .menu-product-size{font:800 9px Arial,sans-serif;letter-spacing:.06em;color:#c5a77e}
      .quick-item b{font:900 15px Arial,sans-serif;color:#e0b77f}
      .quick-item.selected{border-color:#c99b63;background:#3a2b1d}
      .quick-item:active{background:#3a2b1d}
      .studio .order-summary-bar,.studio .report-card,.studio .checkout-total,.studio .checkout-change,.studio .queue-row{background:#25221d;border-color:#514536;color:#f5eee5}
      .studio .history-row{border-color:#39342c}
      .studio .history-specs,.studio .history-price{color:#e0b77f}
      .studio .checkout-card{background:#1b1a18;color:#f5eee5;border-color:#514536}
      .studio .checkout-card .field input,.studio .checkout-card .field select{background:#11110f;color:#fff;border-color:#514536}
      .studio .checkout-items{background:#141311;border-color:#514536}
      .studio .payment-confirm{background:#29241d;border-color:#665137;color:#f5eee5}
      .studio .checkout-overlay{background:rgba(0,0,0,.78)}
      .studio .checkout-total .small,.studio .checkout-change .small{color:#c5b49d}
      @media(max-width:560px){.category-cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.category-card{min-height:98px;padding:8px 4px}.category-picture{font-size:26px}.category-card strong{font-size:13px}.category-card small{font-size:8px}.quick-item{min-height:98px;padding-left:42px}.quick-item strong{font-size:12px}.quick-item .menu-product-picture{left:7px;font-size:24px;width:29px}.menu-section-heading h3{font-size:21px}}

      .checkout-order-meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
      .checkout-order-meta .field,.checkout-options .field{margin:0;min-width:0}
      .checkout-options{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:12px;margin:0 0 12px;border:1px solid #514536;border-radius:12px;background:#24211c}
      .checkout-options .field label,.checkout-order-meta .field label{color:#d8b47f}
      .checkout-options .field select,.checkout-options .field input,.checkout-order-meta .field input{width:100%;min-width:0;background:#11110f;color:#f7efe4;border:1px solid #5a4a37;border-radius:9px;padding:11px;font-size:14px}
      .checkout-options .quote-field{grid-column:1/-1}
      .checkout-options .quote-field .btn{margin-top:3px;min-height:38px}
      .checkout-order-meta small{font-size:10px;color:#b6a895}
      .checkout-card{max-height:min(92vh,820px);width:min(100%,500px)}
      @media(max-width:440px){.checkout-order-meta{grid-template-columns:1fr 1fr;gap:7px}.checkout-options{gap:7px;padding:9px}.checkout-order-meta .field input,.checkout-options .field select,.checkout-options .field input{font-size:13px;padding:10px}}
      /* Consistent dark coffee-shop workspace */
      body{background:#090a0b!important;color:#f3eee7!important}
      .studio{background:#090a0b!important;color:#f3eee7!important}
      .panel,.checkout-card,.history,.custom-drink-panel,.report-card{background:#151719!important;color:#f3eee7!important;border-color:#34383b!important}
      .panel h2,.panel h3,.history h2,.custom-drink-panel strong,.checkout-card h2{color:#f5eee5!important}
      .muted,.small,.history-meta,.field label,.history-price{color:#aaa49b!important}
      .field input,.field select,.custom-drink-panel input,.custom-drink-panel select{background:#202326!important;color:#f5eee5!important;border-color:#41474b!important;color-scheme:dark}
      input::placeholder{color:#85817b!important}
      .btn.alt,.smallbtn{background:#292d30!important;color:#f3eee7!important;border-color:#484e52!important}
      .btn{background:#8b6543!important;color:#fff!important}
      .notice{background:#29241e!important;color:#f0d6b8!important;border:1px solid #51402f}
      .queue-row,.history-row,.checkout-items,.checkout-total,.checkout-change,.payment-confirm{background:#1c2022!important;border-color:#3b4145!important;color:#f3eee7!important}
      .checkout-change{background:#1b2921!important}.checkout-change.short{background:#30241b!important}
      .checkout-change strong{color:#a8d7b0!important}.checkout-change.short strong{color:#f0b17a!important}
      .order-summary-bar{background:#171a1c!important;border-color:#3c4145!important;color:#f3eee7!important}
      .order-summary-bar span,.order-summary-bar small{color:#aaa49b!important}
      .quick-item{background:#1b1f21!important;border-color:#3b4145!important;color:#f3eee7!important}
      .quick-item strong,.quick-item b{color:#f4e8d9!important}.quick-item span{color:#aaa49b!important}
      .quick-item.selected{background:#30251d!important;border-color:#a77b50!important}
      .quick-menu::-webkit-scrollbar-track{background:#171a1c!important}.quick-menu::-webkit-scrollbar-thumb{background:#61503f!important}
      .menu-divider span{color:#c79a6b!important}.menu-divider i{background:#41474b!important}
      .report-card,.report-line{border-color:#3b4145!important}.report-line{color:#e7e0d8!important}
      .history-row{border-bottom-color:#353a3e!important}
      .history-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .history-toggle h2{margin:0 0 5px!important}.history-toggle .muted{margin:0!important}
      .history-collapsible{padding:12px;border:1px solid #34383b;border-radius:12px}
      .custom-drink-panel{margin-top:14px;padding:12px;border:1px solid #3b4145;border-radius:12px;display:grid;gap:9px}
      .payment-confirm small{color:#aaa49b!important}
      .checkout-total{background:#25211d!important}
      .checkout-card .small{color:#aaa49b!important}
      @media(max-width:650px){.history-toggle{align-items:flex-start}.history-toggle .btn{width:100%;min-height:42px}}

      .pos-top-nav{max-width:1200px;margin:0 auto 14px;display:flex;gap:8px;flex-wrap:wrap}
      .pos-top-nav button{min-height:44px;padding:10px 18px;border-radius:10px;border:1px solid #34383b;background:#171a1c;color:#ddd5cb;font-weight:900;cursor:pointer}
      .pos-top-nav button.active{background:#8b6543;border-color:#b58b61;color:#fff}
      .studio[data-page="pos"] .sales-report-section,.studio[data-page="pos"] .history-page-section{display:none!important}
      .studio[data-page="pos"] .printer-status-section,.studio[data-page="pos"] .printer-paper-section{display:none!important}
      .studio[data-page="pos"] .layout{grid-template-columns:minmax(0,1fr) minmax(330px,390px);align-items:start}
      .studio[data-page="pos"] .form-panel{grid-column:1;max-height:calc(100vh - 190px);overflow:auto}
      .studio[data-page="pos"] .pos-order-panel{grid-column:2;position:sticky;top:12px;max-height:calc(100vh - 190px);overflow:auto}
      .studio[data-page="history"] .form-panel,.studio[data-page="history"] .pos-order-panel{display:none!important}
      .studio[data-page="reports"] .form-panel,.studio[data-page="reports"] .pos-order-panel,.studio[data-page="reports"] .history-page-section{display:none!important}
      .studio[data-page="reports"] .sales-report-section{display:block!important}
      .studio[data-page="settings"] .form-panel,.studio[data-page="settings"] .pos-order-panel,.studio[data-page="settings"] .sales-report-section,.studio[data-page="settings"] .history-page-section{display:none!important}
      .studio[data-page="settings"] .printer-status-section,.studio[data-page="settings"] .printer-paper-section{display:block!important}
      .studio[data-page="history"] .history-page-section{display:grid!important;gap:12px}
      .pos-cart-list{display:grid;gap:8px;margin:12px 0}
      .pos-cart-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;align-items:center;gap:8px;padding:11px 8px;border-bottom:1px solid #34383b}
      .pos-cart-main{display:grid;gap:4px;min-width:0}.pos-cart-main strong{font-size:13px;overflow-wrap:anywhere}.pos-cart-main small{font-size:11px;color:#aaa49b}
      .pos-cart-qty{display:flex;align-items:center;gap:7px}.pos-cart-qty button{width:30px;height:30px;border:1px solid #555;border-radius:8px;background:#292d30;color:#fff;font-size:18px;font-weight:900}
      .pos-cart-line-total{font-size:12px;white-space:nowrap}.pos-cart-remove{border:0;background:transparent;color:#e18a7b;font-size:22px}
      .order-type-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.order-type-buttons button{padding:10px 4px;border-radius:8px;background:#24282b;color:#ddd;border:1px solid #444;font-weight:800}.order-type-buttons button.active{background:#8b6543;color:#fff;border-color:#c3976b}
      .cash-quick-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:8px}
      .cash-quick-grid button{min-height:38px;border-radius:8px;border:1px solid #555;background:#25292c;color:#eee;font-weight:900}
      .cash-quick-grid .exact-cash{grid-column:span 4;background:#8b6543;color:#fff}
      .studio[data-page="pos"] .mobile-checkout-dock{display:none!important}
      @media(max-width:850px){.studio[data-page="pos"] .layout{grid-template-columns:minmax(0,1fr)!important}.studio[data-page="pos"] .form-panel,.studio[data-page="pos"] .pos-order-panel{grid-column:1;position:static;max-height:none}.studio[data-page="pos"] .pos-order-panel{order:2}}
      @media(max-width:600px){.pos-top-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.pos-top-nav button{padding:9px 6px}.pos-cart-row{grid-template-columns:minmax(0,1fr) auto auto}.pos-cart-line-total{grid-column:1}.pos-cart-remove{grid-column:3;grid-row:1}}

      .pos-order-panel [style*="#f8f1e8"],.pos-order-panel [style*="#f2e7da"],.pos-order-panel [style*="#fffaf4"]{background:#202326!important;color:#f3eee7!important;border-color:#41474b!important}
      .pos-order-panel input,.pos-order-panel select{background:#202326!important;color:#f3eee7!important;border-color:#41474b!important;color-scheme:dark}
      .pos-order-panel [style*="#ddcbb7"]{border-color:#41474b!important}
      .checkout-card{background:#151719!important;color:#f3eee7!important;border-color:#34383b!important}
      .checkout-card input,.checkout-card select{background:#202326!important;color:#f3eee7!important;border-color:#41474b!important;color-scheme:dark}
          /* Simple, high-contrast thermal drink label */
      .art.ref-art.simple-sticker{width:46mm!important;height:76mm!important;min-width:46mm!important;min-height:76mm!important;padding:3mm!important;border:1px solid #000!important;border-radius:0!important;background:#fff!important;color:#000!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:0!important;font-family:Arial,Helvetica,sans-serif!important;overflow:hidden!important}
      .simple-sticker-head{display:flex;flex-direction:column;align-items:center;gap:1mm;padding-bottom:2mm;border-bottom:.35mm solid #000}
      .simple-sticker-head strong{font-size:13pt;font-weight:900;letter-spacing:.02em;line-height:1}
      .simple-sticker-head span{font-size:6pt;letter-spacing:.12em;font-weight:700}
      .simple-sticker-order{font-size:8pt;font-weight:700;text-align:left;margin-top:2.5mm}
      .simple-sticker-drink{font-family:Arial,Helvetica,sans-serif!important;font-weight:900!important;line-height:1.05!important;letter-spacing:0!important;text-align:center!important;overflow-wrap:anywhere!important;display:block!important;margin:auto 0 1mm!important;max-height:25mm!important;color:#000!important}
      .simple-sticker-size{font-size:10pt;font-weight:800;text-align:center;margin-bottom:2mm}
      .simple-sticker-options{display:flex;justify-content:center;gap:2mm;font-size:8pt;font-weight:700;padding:2mm 0;border-top:.3mm dashed #000;border-bottom:.3mm dashed #000}
      .simple-sticker-options i{font-style:normal}
      .simple-sticker-customer{font-size:10pt;font-weight:800;text-align:center;margin-top:3mm;overflow-wrap:anywhere}
      .simple-sticker-date{font-size:6.5pt;text-align:center;margin-top:auto;padding-top:2mm}
      .preview-art .art.ref-art.simple-sticker{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;padding:4cqh 4cqw!important;border-width:.35cqh!important;border-radius:0!important}
      .preview-art .simple-sticker-head strong{font-size:clamp(9px,4cqh,22px)!important}
      .preview-art .simple-sticker-head span{font-size:clamp(5px,1.8cqh,10px)!important}
      .preview-art .simple-sticker-order{font-size:clamp(7px,2.5cqh,14px)!important}
      .preview-art .simple-sticker-size{font-size:clamp(9px,3.5cqh,18px)!important}
      .preview-art .simple-sticker-options{font-size:clamp(7px,2.7cqh,15px)!important}
      .preview-art .simple-sticker-customer{font-size:clamp(8px,3.5cqh,18px)!important}
      .preview-art .simple-sticker-date{font-size:clamp(6px,2.1cqh,12px)!important}
`}

</style>
    <header className="head"><div className="brand"><img src={LOGO_URL} alt="SYP logo"/><div><h1>SYP Signature Sticker Studio</h1><p>STREET • ICED • BREWED</p></div></div><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><button className="btn alt" type="button" onClick={async()=>{let device:any;try{const bt=(navigator as any).bluetooth;if(!bt){alert("Web Bluetooth is not available in this browser.");return;}if(!confirm("Print ONE 50 x 70mm test label?\\nNo sale or sticker queue record will be created."))return;device=await bt.requestDevice({acceptAllDevices:true,optionalServices:["ff00"]});const server=await device.gatt.connect();if(!server.connected)throw new Error("Bluetooth connected state is false.");const service=await server.getPrimaryService("ff00");const characteristic=await service.getCharacteristic("ff02");const payload='SIZE 50 mm,70 mm\\r\\nGAP 2 mm,0 mm\\r\\nDIRECTION 1\\r\\nCLS\\r\\nTEXT 55,75,"3",0,1,1,"SYP BLUETOOTH TEST"\\r\\nPRINT 1,1\\r\\n';const bytes=new TextEncoder().encode(payload);for(let i=0;i<bytes.length;i+=20){await characteristic.writeValueWithoutResponse(bytes.slice(i,i+20));await new Promise(resolve=>setTimeout(resolve,25));}await new Promise(resolve=>setTimeout(resolve,2500));if(!device.gatt.connected)throw new Error("Printer disconnected before the test could be confirmed.");alert("Data transfer finished and Bluetooth stayed connected. Check whether one label printed.");device.gatt.disconnect();}catch(e){try{device?.gatt?.disconnect();}catch{}alert("Test failed: "+((e as any)?.message||String(e))+"\\nIf the printer was not listed, ensure it is ON and not connected to the Grozziie app. No sale was created.");}}}>PRINT TEST LABEL</button><button className="btn" type="button" onClick={connectQz}>CONNECT QZ TRAY</button><a href="/" style={{color:"#65472f",fontSize:12,fontWeight:800}}>← Back</a></div></header>
    <nav className="pos-top-nav" aria-label="POS pages">
      <button type="button" className={studioPage==="pos"?"active":""} onClick={()=>setStudioPage("pos")}>▦ POS</button>
      <button type="button" className={studioPage==="history"?"active":""} onClick={()=>{setStudioPage("history");void refreshDailySales();}}>▤ Sales History</button>
      <button type="button" className={studioPage==="reports"?"active":""} onClick={()=>{setStudioPage("reports");void refreshDailySales();}}>▥ Sales Report</button>
      <button type="button" className={studioPage==="settings"?"active":""} onClick={()=>setStudioPage("settings")}>⚙ Settings & Printers</button>
    </nav>
    <section className="panel printer-status-section" style={{maxWidth:1200,margin:"0 auto 14px",padding:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div><strong style={{fontSize:13}}>QZ TRAY · DUAL PRINTER</strong><div className="small">{qzStatus}</div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="btn" onClick={testPrintBoth} disabled={qzPrinters.length===0}>TEST PRINT BOTH</button><button type="button" className="btn alt" onClick={connectQz}>Reconnect / Find Printers</button></div>
      </div>
      {qzPrinters.length>0&&<div className="small" style={{marginTop:8,display:"grid",gap:4}}>{qzPrinters.map((printer,index)=><div key={printer+"-"+index}>• {printer}</div>)}</div>}
      <div className="small" style={{marginTop:8}}>TEST PRINT BOTH sends one sample to each printer only. Walang sale o queue na babaguhin.</div>
    </section>
    <section className="panel printer-paper-section" style={{maxWidth:1200,margin:"0 auto 14px",padding:14}}>
      <strong style={{fontSize:14}}>PRINTER PAPER SIZE SETTINGS</strong>
      <p className="muted" style={{marginTop:5}}>Magkahiwalay ang settings ng sticker at receipt. Awtomatikong nase-save sa browser na ito.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
        <div className="field"><label>TP870 S · Sticker size</label><select value={[[50,80],[50,70],[70,50],[80,50]].some(([w,h])=>stickerWidth===w&&stickerHeight===h)?stickerWidth+"x"+stickerHeight:"custom"} onChange={e=>{if(e.target.value==="50x80"){setStickerWidth(50);setStickerHeight(80);}else if(e.target.value==="50x70"){setStickerWidth(50);setStickerHeight(70);}else if(e.target.value==="70x50"){setStickerWidth(70);setStickerHeight(50);}else if(e.target.value==="80x50"){setStickerWidth(80);setStickerHeight(50);}}}><option value="50x80">50 × 80 mm · Portrait (Recommended)</option><option value="50x70">50 × 70 mm · Portrait</option><option value="70x50">70 × 50 mm · Landscape</option><option value="80x50">80 × 50 mm · Landscape</option></select><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Custom width (mm)</label><input type="number" min="30" max="120" value={stickerWidth} onChange={e=>setStickerWidth(Math.max(30,Math.min(120,Number(e.target.value)||30)))}/></div><div><label>Custom height (mm)</label><input type="number" min="30" max="150" value={stickerHeight} onChange={e=>setStickerHeight(Math.max(30,Math.min(150,Number(e.target.value)||30)))}/></div></div><small className="small">Current: {stickerWidth} × {stickerHeight} mm · {stickerOrientation}</small></div>
        <div className="field"><label>EPSON TM-T88IV · Receipt paper width</label><select value={receiptWidth===80?"80":receiptWidth===58?"58":"custom"} onChange={e=>{if(e.target.value!=="custom")setReceiptWidth(Number(e.target.value));}}><option value="80">80 mm</option><option value="58">58 mm</option><option value="custom">Custom width</option></select><label>Custom / current width (mm)</label><input type="number" min="40" max="100" value={receiptWidth} onChange={e=>setReceiptWidth(Math.max(40,Math.min(100,Number(e.target.value)||40)))}/><small className="small">Current receipt width: {receiptWidth} mm</small></div>
        <div className="field"><label>Print scaling · QZ direct print</label><select value={printScale} onChange={e=>setPrintScale(e.target.value as "actual"|"fit")}><option value="actual">Actual Size · 100%</option><option value="fit">Fit to selected paper (QZ)</option></select><small className="small">Browser Web Print uses selected page dimensions; confirm Actual Size / 100% in browser print dialog.</small></div>
      </div>
    </section>
    <div className="layout">
      <section className="panel sales-report-section" style={{gridColumn:"1 / -1",padding:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div><strong style={{fontSize:14}}>SALES REPORT</strong><div className="small">{salesReportOpen?"Sales summary, payment breakdown, records at controls":"Nakatago ang sales report para mas maluwag ang sticker workspace."}</div></div>
          <button className="btn alt" type="button" aria-expanded={salesReportOpen} onClick={()=>setSalesReportOpen(open=>!open)}>{salesReportOpen?"▲ Close Sales Report":"▼ Open Sales Report"}</button>
        </div>
        {salesReportOpen&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginTop:14}}>

        <div><div className="small">ORDERS SINCE MANUAL RESET</div><div style={{fontSize:28,fontWeight:900}}>{salesLoading?"…":dailyOrders}</div></div>
        <div><div className="small">TOTAL SALES SINCE CASH RESET</div><div style={{fontSize:28,fontWeight:900}}>₱{salesLoading?"…":dailySales.toLocaleString("en-PH")}</div></div>
        <div><div className="small">THIS MONTH'S SALES</div><div style={{fontSize:28,fontWeight:900}}>₱{salesLoading?"…":monthlySales.toLocaleString("en-PH")}</div></div>
        <div><div className="small">NEXT ORDER NUMBER</div><div style={{fontSize:28,fontWeight:900}}>#{orderNo}</div></div>
        <div style={{gridColumn:"1 / -1",marginTop:10,borderTop:"1px solid #e5d8c9",paddingTop:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><strong>SALES REPORTS</strong><button className="btn alt" type="button" onClick={()=>{const headers=["Order Number","Customer","Cashier","Date","Payment Method","Payment Status","Total Amount","Items"];const quote=(v:any)=>'"'+String(v??"").replace(/"/g,'""')+'"';const lines=[headers.map(quote).join(","),...salesRows.map(r=>[r.order_number,r.customer_name,r.cashier_name||"",r.created_at,r.payment_method,r.payment_status||"paid",r.total_amount,JSON.stringify(r.items||[])].map(quote).join(","))];const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="syp-sticker-studio-sales.csv";a.click();URL.revokeObjectURL(url);}}>↓ Export CSV</button></div>
        <div className="report-grid"><div className="report-card"><span className="small">PAID ORDERS</span><strong>{salesRows.filter(r=>r.payment_status!=="unpaid").length}</strong></div><div className="report-card"><span className="small">UNPAID ORDERS</span><strong>{salesRows.filter(r=>r.payment_status==="unpaid").length}</strong></div><div className="report-card"><span className="small">ALL-TIME COLLECTED</span><strong>₱{salesRows.filter(r=>r.payment_status!=="unpaid").reduce((n,r)=>n+Number(r.total_amount||0),0).toLocaleString("en-PH")}</strong></div></div>
        <div className="report-grid"><div className="report-card"><strong>PAYMENT METHODS</strong>{["Cash","GCash","Maya","Bank Transfer"].map(method=><div className="report-line" key={method}><span>{method}</span><b>₱{salesRows.filter(r=>r.payment_status!=="unpaid"&&r.payment_method===method).reduce((n,r)=>n+Number(r.total_amount||0),0).toFixed(2)}</b></div>)}</div><div className="report-card"><strong>BEST SELLERS</strong><div className="report-scroll">{(()=>{const totals:Record<string,number>={};salesRows.filter(r=>r.payment_status!=="unpaid").forEach(r=>(Array.isArray(r.items)?r.items:[]).forEach((it:any)=>{const key=it.drink||"Unknown";totals[key]=(totals[key]||0)+Number(it.quantity||1);}));return Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=><div className="report-line" key={name}><span>{name}</span><b>{count}</b></div>);})()}</div></div><div className="report-card"><strong>RECORD COUNTS</strong><div className="report-line"><span>Paid</span><b>{salesRows.filter(r=>r.payment_status!=="unpaid").length}</b></div><div className="report-line"><span>Unpaid</span><b>{salesRows.filter(r=>r.payment_status==="unpaid").length}</b></div><div className="report-line"><span>Total</span><b>{salesRows.length}</b></div></div></div></div>
        {salesError&&<div style={{gridColumn:"1 / -1",fontSize:11,color:"#a33"}}>{salesError} · Run the Sticker Studio SQL setup in Supabase.</div>}
        <div style={{gridColumn:"1 / -1",display:"flex",gap:8,flexWrap:"wrap"}}>
          <span className="small" style={{fontWeight:800}}>CASHIER: {cashier}</span><button className="btn alt" type="button" onClick={()=>{localStorage.removeItem("syp-studio-cashier");setCashier("");}}>⇄ Switch cashier</button><button className="btn alt" type="button" onClick={()=>void refreshDailySales()}>↻ Refresh sales</button><button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-reset ang monthly sales total mula ngayon? Hindi mabubura ang order history."))return;const {error}=await supabase.rpc("syp_sticker_reset_monthly_sales");if(error){setNotice("Monthly reset failed: "+error.message);return;}await refreshDailySales();setNotice("Monthly sales counter reset. Permanent records remain unchanged.");}}>↺ Reset monthly sales</button>
          <button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-reset ang order number sa 001? Hindi mabubura ang sales records."))return;const {data,error}=await supabase.rpc("syp_sticker_reset_order_number");if(error){setNotice("Reset failed: "+error.message);return;}setOrderNo(String(data||"001"));setNotice("Next order number reset to #001. Sales history is unchanged.");}}>↺ Reset order number</button><button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-reset ang order count sa 0? Hindi mabubura ang sales records. Bibilang ulit mula ngayon hanggang sa susunod mong manual reset."))return;const {error}=await supabase.rpc("syp_sticker_reset_orders");if(error){setNotice("Orders reset failed: "+error.message+" — Run the latest SQL patch first.");return;}await refreshDailySales();setNotice("Order count reset to 0. Sales history is unchanged.");}}>↺ Reset order count</button>
          <button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-zero ang cash/sales total mula ngayon? Hindi mabubura ang sales history o mababago ang order number."))return;const {error}=await supabase.rpc("syp_sticker_reset_cash");if(error){setNotice("Cash reset failed: "+error.message);return;}await refreshDailySales();setNotice("Cash total reset to ₱0. Previous sales remain in history; new sales will count from now on.");}}>₱ Reset cash drawer</button>
        </div>

        </div>}
      </section>
      <section className="panel form-panel"><h2>Create signature sticker</h2><p className="muted">Piliin ang drink sa menu. Automatic ang drink name, size at presyo gaya ng Cup Wrap Studio.</p>
        <div className="field menu-search"><label>Find a drink or food</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type product name…"/></div>
        <div className="category-cards" aria-label="Choose menu category">{categories.map(category=><button type="button" key={category} className={"category-card"+(activeCategory===category?" active":"")} onClick={()=>setActiveCategory(category)}><span className="category-picture" aria-hidden="true">{categoryIcons[category]}</span><strong>{category}</strong><small>{category==="Coffee"?"Iced & hot coffee":category==="Milky"?"Creamy favorites":category==="Matcha"?"Iced & hot matcha":category==="Soda"?"Refreshing drinks":category==="Fries"?"Crispy snacks":"Sweet treats"}</small></button>)}</div>
        <div className="menu-section-heading"><div><span className="menu-eyebrow">SYP ON CAFÉ MENU</span><h3>{activeCategory}</h3></div><span className="menu-count">{filtered.length} options</span></div>
        <div className="quick-menu">
          <div className="quick-grid">{filtered.map(({m,i})=>{const hot=String(m[0]).toLowerCase().startsWith("hot ");const displayName=String(m[0]).replace(/^Hot\s+/i,"");const icon=hot?"☕":activeCategory==="Coffee"?"🧋":activeCategory==="Milky"?"🥛":activeCategory==="Matcha"?"🍵":activeCategory==="Soda"?"🥤":activeCategory==="Fries"?"🍟":"🧇";return <button type="button" className={"quick-item"+(selected===i?" selected":"")} key={i} onClick={()=>void add(i)}><span className="menu-product-picture" aria-hidden="true">{icon}</span><strong>{displayName}</strong><span className="menu-product-size">{hot?"HOT CUP · ":"ICED · "}{m[1]}</span><b>₱{m[2]}</b></button>})}</div>
          {filtered.length===0&&<p className="muted">Walang match sa search.</p>}
        </div>
        <div className="custom-drink-panel">
          <strong style={{fontSize:14}}>CUSTOMIZED DRINK</strong>
          <span className="small">Para sa special/custom drinks na wala sa regular menu. Ilagay ang sariling pangalan at presyo.</span>
          <div className="field"><label>Customized drink name</label><input value={customDrinkName} onChange={e=>setCustomDrinkName(e.target.value.slice(0,50))} placeholder="e.g. Customer's Own Mix"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div className="field"><label>Size</label><input value={customDrinkSize} onChange={e=>setCustomDrinkSize(e.target.value.slice(0,12))} placeholder="e.g. 16oz"/></div>
            <div className="field"><label>Price (₱)</label><input type="number" min="0" step="0.01" inputMode="decimal" value={customDrinkPrice} onChange={e=>setCustomDrinkPrice(e.target.value)} placeholder="Enter price"/></div>
          </div>
          <button type="button" className="btn" onClick={()=>void addCustomDrink()}>＋ Add customized drink</button>
        </div>
        {notice&&<div className="notice" role="status">{notice}</div>}
      </section>
      <section className="panel pos-order-panel"><div className="panel-head" style={{display:"flex",justifyContent:"space-between"}}><div><h2>Print queue</h2><p className="muted">Sticker {stickerWidth} × {stickerHeight} mm · {stickerOrientation} · Receipt {receiptWidth} mm</p></div><strong>{queue.length}</strong></div><div className="field" style={{marginTop:10}}><label>ORDER TYPE</label><div className="order-type-buttons">{(["Dine-in","Takeaway","Delivery"] as const).map(type=><button type="button" className={orderType===type?"active":""} onClick={()=>{setOrderType(type);setDeliveryEnabled(type==="Delivery");}}>{type}</button>)}</div></div><div className="order-summary-bar"><div><span>LIVE ORDER TOTAL</span><strong>₱{finalTotal.toFixed(2)}</strong><small>{queue.length} sticker(s) · {queue.reduce((sum,item)=>sum+1,0)} drinks</small></div><button type="button" className="btn" disabled={!queue.length} onClick={()=>setCheckoutOpen(true)}>Checkout / Print</button></div>
        {!queue.length?<p className="muted">Wala pang napipiling item. Pumili ng drink sa menu.</p>:<div className="pos-cart-list">{Array.from(queue.reduce((map,item)=>{const key=item.drink+"|"+item.size+"|"+item.price;const row=map.get(key)||{key,drink:item.drink,size:item.size,price:item.price,ids:[] as number[]};row.ids.push(item.id);map.set(key,row);return map;},new Map<string,{key:string;drink:string;size:string;price:number;ids:number[]}>()).values()).map(row=><div className="pos-cart-row" key={row.key}><div className="pos-cart-main"><strong>{row.drink}</strong><small>{row.size} · ₱{Number(row.price).toFixed(2)} each</small></div><div className="pos-cart-qty"><button type="button" onClick={()=>setQueue(q=>q.filter(item=>item.id!==row.ids[row.ids.length-1]))}>−</button><b>{row.ids.length}</b><button type="button" onClick={()=>{const base=queue.find(item=>item.id===row.ids[0]);if(base){const copy={...base,id:nextId,quote:pickUniqueQuote(base.category,[...queue.filter(item=>item.orderNo===base.orderNo).map(item=>item.quote),...history.slice(0,40).map(item=>item.quote)])};setNextId(n=>n+1);setQueue(q=>[...q,copy]);}}}>＋</button></div><strong className="pos-cart-line-total">₱{(row.ids.length*Number(row.price)).toFixed(2)}</strong><button className="pos-cart-remove" type="button" onClick={()=>setQueue(q=>q.filter(item=>!row.ids.includes(item.id)))}>×</button></div>)}</div>}
        <div style={{maxWidth:320,marginTop:16,border:"1px solid #e6d8c8",borderRadius:12,padding:12,display:"grid",gap:10}}><strong style={{fontSize:13}}>CUSTOM ADD-ONS / EXTRA CHARGES</strong><label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700}}><input type="checkbox" checked={deliveryEnabled} onChange={e=>setDeliveryEnabled(e.target.checked)}/> Add delivery fee</label>{deliveryEnabled&&<div className="field"><label>Delivery fee (₱)</label><input type="number" min="0" step="0.01" value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)}/></div>}{extraCharges.map(item=><div key={item.id} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 100px auto",gap:6,alignItems:"center"}}><input aria-label="Extra charge name" placeholder="e.g. Extra syrup" value={item.name} onChange={e=>setExtraCharges(rows=>rows.map(row=>row.id===item.id?{...row,name:e.target.value}:row))} style={{minWidth:0,width:"100%",padding:9,border:"1px solid #ddcbb7",borderRadius:8}}/><input aria-label="Extra charge amount" type="number" min="0" step="0.01" placeholder="₱" value={item.amount} onChange={e=>setExtraCharges(rows=>rows.map(row=>row.id===item.id?{...row,amount:e.target.value}:row))} style={{minWidth:0,width:"100%",padding:9,border:"1px solid #ddcbb7",borderRadius:8}}/><button type="button" className="smallbtn" onClick={()=>setExtraCharges(rows=>rows.filter(row=>row.id!==item.id))}>×</button></div>)}<button type="button" className="btn alt" onClick={()=>{setExtraCharges(rows=>[...rows,{id:nextChargeId,name:"",amount:""}]);setNextChargeId(n=>n+1);}}>＋ Add custom charge</button><span className="small">Halimbawa: Extra syrup, extra shot, add-ons, packaging fee.</span></div><div style={{maxWidth:320,marginTop:16,padding:12,border:"1px solid #e6d8c8",borderRadius:12,display:"grid",gap:8}}><strong style={{fontSize:13}}>ORDER DISCOUNT</strong><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><select value={discountType} onChange={e=>setDiscountType(e.target.value as "amount"|"percent")}><option value="amount">₱ Fixed amount</option><option value="percent">% Percentage</option></select><input aria-label="Discount value" type="number" min="0" max={discountType==="percent"?100:undefined} step="0.01" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} placeholder="0"/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span>Discount</span><strong>-₱{discountAmount.toFixed(2)}</strong></div><div style={{display:"flex",justifyContent:"space-between",fontSize:14}}><strong>NEW TOTAL</strong><strong>₱{finalTotal.toFixed(2)}</strong></div><span className="small">Applied to this print batch only. Max discount is the order total.</span></div><div className="field" style={{marginTop:16,maxWidth:320}}><label>Payment method</label><select value={paymentMethod} onChange={e=>{setPaymentMethod(e.target.value as "Cash"|"GCash"|"Maya"|"Bank Transfer");setPaymentConfirmed(false);}}><option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Maya">Maya</option><option value="Bank Transfer">Bank Transfer</option></select></div>{paymentMethod==="Cash"&&<div className="field"><label>Cash received (₱)</label><input type="number" min="0" step="0.01" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder="Enter customer payment"/><div className="cash-quick-grid">{[5,10,20,50,100,500,1000].map(amount=><button type="button" onClick={()=>setCashReceived(String((Number(cashReceived)||0)+amount))}>₱{amount}</button>)}<button type="button" className="exact-cash" onClick={()=>setCashReceived(finalTotal.toFixed(2))}>EXACT AMOUNT</button></div></div>}<div style={{maxWidth:320,background:"#f8f1e8",border:"1px solid #e6d8c8",borderRadius:12,padding:14,display:"grid",gap:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><strong>Drinks ({queue.length} pcs)</strong><strong>₱{drinksTotal.toFixed(2)}</strong></div>{chargesTotal>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Extra charges</span><strong>₱{chargesTotal.toFixed(2)}</strong></div>}<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Subtotal</span><strong>₱{queueTotal.toFixed(2)}</strong></div>{discountAmount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Discount</span><strong>-₱{discountAmount.toFixed(2)}</strong></div>}<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><strong>Total</strong><strong>₱{finalTotal.toFixed(2)}</strong></div>{paymentMethod==="Cash"?<><div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Cash received</span><strong>₱{cashValid?cashAmount.toFixed(2):"0.00"}</strong></div><div style={{borderTop:"1px dashed #cdbba5",paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><strong style={{fontSize:15}}>{cashValid?(liveChange>=0?"CHANGE":"KULANG"):"SUKLI"}</strong><strong style={{fontSize:22,color:cashValid?(liveChange>=0?"#276749":"#b45309"):"#65472f"}}>{cashValid?(liveChange>=0?"₱"+liveChange.toFixed(2):"₱"+Math.abs(liveChange).toFixed(2)):"—"}</strong></div></>:<div style={{borderTop:"1px dashed #cdbba5",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:13}}><strong>PAYMENT</strong><strong>{paymentMethod.toUpperCase()}</strong></div>}</div><div className="actions"><button className="btn" disabled={!queue.length} onClick={()=>setCheckoutOpen(true)}>Checkout / Print · ₱{finalTotal.toFixed(2)}</button></div><p className="muted">Bawat print batch ay magkakaroon ng isang receipt sa pinakahuling sheet. Ang sukli ay automatic na kukuwentahin.</p>
        <div className="history-page-section"><div className="history history-collapsible"><div className="history-toggle"><div><h2>UNPAID ORDERS ({unpaidOrders.length})</h2><p className="muted">{unpaidOrdersOpen?"Mga order na hindi pa bayad. I-mark as paid kapag nakapagbayad na ang customer.":"Nakatago muna para mas maluwag ang workspace."}</p></div><button className="btn alt" type="button" aria-expanded={unpaidOrdersOpen} onClick={()=>setUnpaidOrdersOpen(open=>!open)}>{unpaidOrdersOpen?"▲ Hide Unpaid Orders":"▼ Show Unpaid Orders"}</button></div>{unpaidOrdersOpen&&<div><h2>UNPAID ORDERS</h2><p className="muted">Mga order na hindi pa bayad. I-mark as paid kapag nakapagbayad na ang customer.</p>{unpaidOrders.map((u:any)=><div className="history-row" key={u.id}><div className="history-info"><div className="history-name">Order #{u.order_number} · {u.customer_name||"Walk-in"}</div><div className="history-specs"><span>₱{Number(u.total_amount||0).toFixed(2)} due</span><span className="history-price">{new Date(u.created_at).toLocaleString("en-PH")}</span></div></div><button className="smallbtn" onClick={async()=>{const {error}=await supabase.from("sticker_studio_sales").update({payment_status:"paid",amount_paid:u.total_amount,paid_at:new Date().toISOString()}).eq("id",u.id);if(error){setNotice("Hindi ma-update ang payment: "+error.message);return;}await refreshDailySales();setNotice("Order #"+u.order_number+" marked as PAID.");}}>Mark as Paid</button></div>)}{unpaidOrders.length===0&&<p className="muted">Walang unpaid orders.</p>}</div>}</div><div className="history history-scroll"><h2>SALES TRANSACTION HISTORY</h2><p className="muted">Permanent records mula sa Supabase. Kasama ang drinks, add-ons, discount at payment details.</p>{salesRows.slice().sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,100).map((sale:any)=><div className="history-row" key={sale.id}><div className="history-info"><div className="history-name">Order #{sale.order_number} · {sale.customer_name||"Walk-in"} · Cashier: {sale.cashier_name||"—"}</div><div className="history-specs"><span>₱{Number(sale.total_amount||0).toFixed(2)}</span><span className="history-price">{String(sale.payment_method||"Cash").toUpperCase()} · {String(sale.payment_status||"paid").toUpperCase()}</span></div><div className="history-meta">{new Date(sale.created_at).toLocaleString("en-PH")} · {((Array.isArray(sale.items)?sale.items:[])[0]?.order_type||"Takeaway")} · {(Array.isArray(sale.items)?sale.items:[]).map((it:any)=>`${it.drink} ${it.size}${Number(it.quantity||1)>1?" × "+it.quantity:""}`).join(", ")}</div>{(Array.isArray(sale.additional_charges)?sale.additional_charges:[]).length>0&&<div className="history-meta">Extras: {sale.additional_charges.map((c:any)=>`${c.name} ₱${Number(c.amount||0).toFixed(2)}`).join(" · ")}</div>}{Number(sale.discount_amount||0)>0&&<div className="history-meta">Discount: -₱{Number(sale.discount_amount).toFixed(2)}</div>}{sale.payment_method==="Cash"&&<div className="history-meta">Cash received: ₱{Number(sale.cash_received||0).toFixed(2)} · Sukli: ₱{Number(sale.change_amount||0).toFixed(2)}</div>}</div></div>)}{salesRows.length===0&&<p className="muted">Wala pang sales transactions.</p>}</div><div className="history history-scroll history-collapsible"><div className="history-toggle"><div><h2>PRINT HISTORY · REPRINT ({history.length})</h2><p className="muted">{reprintHistoryOpen?"Pindutin ang Reprint para direktang ilimbag ulit ang sticker. Hindi ito gagawa ng bagong sale o magdadagdag ng order.":"Nakatago muna ang reprint list para lumuwag ang workspace."}</p></div><button className="btn alt" type="button" aria-expanded={reprintHistoryOpen} onClick={()=>setReprintHistoryOpen(open=>!open)}>{reprintHistoryOpen?"▲ Hide Reprint History":"▼ Show Reprint History"}</button></div>{reprintHistoryOpen&&<div><h2>Print history · Reprint</h2><p className="muted">Pindutin ang Reprint para direktang ilimbag ulit ang sticker. Hindi ito gagawa ng bagong sale o magdadagdag ng order.</p>{history.slice(0,40).map((s,i)=><div className="history-row" key={s.id+"-"+i}><div className="history-info"><div className="history-name">{s.drink}</div><div className="history-specs"><span>{s.size}</span><span className="history-price">₱{Number(s.price||0).toFixed(2)}</span></div><div className="history-meta">Order #{s.orderNo} · {s.customer||"Walk-in"} · {s.createdAt}</div></div><button className="smallbtn" onClick={()=>reprint(s)}>Reprint</button></div>)}{history.length===0&&<p className="muted">Wala pang print history.</p>}</div>}</div>
        </div><p className="muted" style={{marginTop:18}}>Printer setup: Sticker {stickerWidth} × {stickerHeight} mm ({stickerOrientation}) · Receipt {receiptWidth} mm · Actual size / 100%, margins none, headers & footers off. Grozziie PDF: Print → Share / Save to Files as PDF → open in Grozziie app.</p>
      </section>
    </div>
    <div className="mobile-checkout-dock" aria-label="Quick checkout">
      <div className="dock-total"><span>CURRENT ORDER · {queue.length} ITEM{queue.length===1?"":"S"}</span><strong>₱{finalTotal.toFixed(2)}</strong><small>{queue.length?"Ready for checkout":"Add a drink to begin"}</small></div>
      <button type="button" className="btn" disabled={!queue.length} onClick={()=>setCheckoutOpen(true)}>Checkout / Print →</button>
    </div>
    {previewOpen&&<div role="dialog" aria-modal="true" aria-label="Print preview check" style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(25,18,12,.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:12,overflowY:"auto"}}><div style={{background:"#151719",color:"#f3eee7",width:"min(100%,760px)",maxHeight:"95vh",overflowY:"auto",borderRadius:16,padding:16,boxShadow:"0 18px 60px rgba(0,0,0,.35)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,position:"sticky",top:0,background:"#151719",paddingBottom:10,zIndex:2}}><div><h2 style={{margin:0,fontSize:19}}>PREVIEW CHECK</h2><p style={{margin:"4px 0 0",fontSize:12,color:"#80644c"}}>Walang papel o sticker na ilalabas sa preview na ito.</p></div><button type="button" className="smallbtn" onClick={()=>setPreviewOpen(false)}>✕ Close</button></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,alignItems:"start"}}>{(printMode==="both"||printMode==="stickers")&&<section style={{background:"#fff",border:"1px solid #d9c9b8",borderRadius:12,padding:10,overflow:"hidden"}}><strong style={{fontSize:12}}>STICKER · {stickerWidth} × {stickerHeight} mm · {stickerOrientation}</strong>{printItems.map((item,index)=><div key={item.id+"-proof-"+index} style={{marginTop:10,background:"#fff",border:"1px dashed #b8a58f",padding:4,overflow:"hidden"}}><div style={{width:"100%",aspectRatio:stickerWidth+" / "+stickerHeight,overflow:"hidden",position:"relative"}}><div className="preview-art"><StickerArt sticker={item}/></div></div></div>)}</section>}{(printMode==="both"||printMode==="receipt")&&<section style={{background:"#fff",border:"1px solid #d9c9b8",borderRadius:12,padding:10}}><strong style={{fontSize:12}}>RECEIPT · {receiptWidth} mm · COMPACT</strong><div style={{margin:"10px auto 0",width:"min(100%,300px)",background:"#fff",border:"1px dashed #b8a58f",padding:6,overflow:"hidden"}}><ReceiptArt items={printItems} cashReceived={paymentMethod==="Cash"?(Number(cashReceived)||0):0} paymentMethod={paymentMethod} paymentStatus={paymentStatusForReceipt(finalTotal,cashReceived,paymentMethod)} additionalCharges={receiptCharges} discountAmount={discountAmount} cashier={cashier} note={Array.from(new Set(printItems.map(item=>item.note.trim()).filter(Boolean))).join(" · ")}/></div></section>}</div><div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap",marginTop:16}}><button type="button" className="btn alt" onClick={()=>setPreviewOpen(false)}>Back to edit</button><button type="button" className="btn" onClick={()=>{const ids=printItems.map(item=>item.id);setPreviewOpen(false);void print(ids);}}>Looks good · Print</button></div><p style={{fontSize:11,color:"#80644c",margin:"10px 0 0"}}>I-check muna ang orientation, QR, text at haba. Kapag may mali, Back to edit muna—huwag mag-print.</p></div></div>}
    <div className="checkout-overlay" style={{display:checkoutOpen?"flex":"none"}} role="dialog" aria-modal="true" aria-label="POS checkout"><div className="checkout-card"><div className="checkout-head"><div><h2 style={{margin:0,fontSize:20}}>POS Checkout</h2><p className="muted" style={{margin:"4px 0 0"}}>{queue.length} sticker(s) in current order</p></div><button type="button" className="smallbtn" onClick={()=>setCheckoutOpen(false)}>✕ Close</button></div><div className="checkout-items">{queue.length?queue.map((s,i)=><div className="checkout-item" key={s.id+"-"+i}><span>{s.drink} · {s.size}</span><strong>₱{Number(s.price).toFixed(2)}</strong></div>):<span className="small">Walang laman ang queue.</span>}</div><div className="checkout-total"><span><strong style={{fontSize:13}}>TOTAL DUE</strong><br/><span className="small">Including add-ons and discount</span></span><strong>₱{finalTotal.toFixed(2)}</strong></div><div className="checkout-order-meta"><div className="field"><label>Order type</label><div className="order-type-buttons">{(["Dine-in","Takeaway","Delivery"] as const).map(type=><button type="button" className={orderType===type?"active":""} onClick={()=>{setOrderType(type);setDeliveryEnabled(type==="Delivery");}}>{type}</button>)}</div></div><div className="field"><label>Order number · automatic</label><input value={queue[0]?.orderNo||orderNo} readOnly/><small>Continuous order sequence.</small></div><div className="field"><label>Customer name · optional</label><input value={customer} maxLength={35} onChange={e=>{const name=e.target.value.slice(0,35);setCustomer(name);setQueue(q=>q.map(item=>({...item,customer:name})));}} placeholder="Walk-in / customer name"/></div></div><div className="checkout-options"><div className="field"><label>Sugar level</label><select value={sugar} onChange={e=>{const value=e.target.value;setSugar(value);setQueue(q=>q.map(item=>({...item,sugar:value})));}}><option>Regular sugar</option><option>75% sugar</option><option>50% sugar</option><option>25% sugar</option><option>No sugar</option></select></div><div className="field"><label>Ice level</label><select value={ice} onChange={e=>{const value=e.target.value;setIce(value);setQueue(q=>q.map(item=>({...item,ice:value})));}}><option>Regular ice</option><option>Less ice</option><option>Extra ice</option><option>No ice</option><option>Hot</option></select></div><div className="field quote-field"><label>Signature quote</label><input value={quote} maxLength={100} onChange={e=>{const value=e.target.value;setQuote(value);setQueue(q=>q.map(item=>({...item,quote:value})));}} placeholder="Sticker quote"/><button className="btn alt" type="button" onClick={()=>randomQuote(queue[0]?.category||product[3])}>🎲 Random quote</button></div></div><div className="checkout-grid"><div className="field"><label>Payment method</label><select value={paymentMethod} onChange={e=>{setPaymentMethod(e.target.value as "Cash"|"GCash"|"Maya"|"Bank Transfer");setPaymentConfirmed(false);}}><option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Maya">Maya</option><option value="Bank Transfer">Bank Transfer</option></select></div><div className="field"><label>Order note · Receipt + Sticker</label><input value={note} maxLength={80} onChange={e=>setNote(e.target.value.slice(0,80))} placeholder="e.g. no straw, less foam"/><small style={{fontSize:10,color:"#897762"}}>Optional · ilalagay sa receipt at stickers ng order na ito.</small></div>{paymentMethod==="Cash"&&<div className="field"><label>Cash received (₱)</label><input type="number" min="0" step="0.01" inputMode="decimal" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder="Enter amount"/><div className="cash-quick-grid">{[5,10,20,50,100,500,1000].map(amount=><button type="button" onClick={()=>setCashReceived(String((Number(cashReceived)||0)+amount))}>₱{amount}</button>)}<button type="button" className="exact-cash" onClick={()=>setCashReceived(finalTotal.toFixed(2))}>EXACT AMOUNT</button></div></div>}</div>{paymentMethod!=="Cash"&&<label className="payment-confirm"><input type="checkbox" checked={paymentConfirmed} onChange={e=>setPaymentConfirmed(e.target.checked)}/><span><strong>Confirm payment received</strong><small>Na-verify ko na ang {paymentMethod} payment bago i-print at i-record bilang PAID.</small></span></label>}{paymentMethod==="Cash"&&<div className={"checkout-change"+(cashValid&&liveChange<0?" short":"")}><span><strong style={{fontSize:13}}>{cashValid?(liveChange>=0?"SUKLI":"KULANG PA"):"SUKLI"}</strong><br/><span className="small">{cashValid?(liveChange>=0?"Ibigay sa customer":"Kulang sa bayad"):"Ilagay ang cash received"}</span></span><strong>{cashValid?"₱"+Math.abs(liveChange).toFixed(2):"—"}</strong></div>}<div className="checkout-change"><span><strong style={{fontSize:13}}>PAYMENT STATUS</strong><br/><span className="small">E-payments require confirmation before printing</span></span><strong>{paymentMethod!=="Cash"&&!paymentConfirmed?"WAITING CONFIRMATION":paymentStatusForReceipt(finalTotal,cashReceived,paymentMethod)}</strong></div><div style={{margin:"12px 0",padding:12,border:"1px solid #e6d8c8",borderRadius:12}}><strong style={{fontSize:13}}>PRINT OPTION</strong><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:7,marginTop:9}}>{([{value:"both",label:"Both"},{value:"stickers",label:"Sticker only"},{value:"receipt",label:"Receipt only"}] as const).map(option=><button key={option.value} type="button" onClick={()=>setPrintMode(option.value)} style={{padding:"10px 5px",borderRadius:9,border:printMode===option.value?"2px solid #76563c":"1px solid #d8c9b8",background:printMode===option.value?"#f2e7da":"#fff",fontWeight:800,fontSize:12,color:"#39291d"}}>{printMode===option.value?"✓ ":""}{option.label}</button>)}</div><div className="small" style={{marginTop:7}}>Piliin kung ano lang ang ilalabas sa printer para makatipid sa papel.</div></div><div className="checkout-actions"><button type="button" className="btn alt" onClick={()=>setCheckoutOpen(false)}>＋ Add another item</button><button type="button" className="btn" disabled={!queue.length} onClick={()=>openPrintPreview(queue)}>{printMode==="both"?"Preview stickers + receipt":printMode==="receipt"?"Preview receipt only":"Preview stickers only"}</button></div>{notice&&<div className="notice">{notice}</div>}</div></div><div className="print-only-container">{(printMode==="both"||printMode==="stickers")&&printItems.map((s,i)=><div className="print-sheet" key={s.id}><StickerArt sticker={s}/></div>)}{printItems.length>0&&(printMode==="both"||printMode==="receipt")&&<ReceiptArt items={printItems} cashReceived={paymentMethod==="Cash"?(Number(cashReceived)||0):0} paymentMethod={paymentMethod} paymentStatus={paymentStatusForReceipt(finalTotal,cashReceived,paymentMethod)} additionalCharges={receiptCharges} discountAmount={discountAmount} cashier={cashier} note={Array.from(new Set(printItems.map(item=>item.note.trim()).filter(Boolean))).join(" · ")}/>}</div>
  </main>;
}


function paymentStatusForReceipt(total:number,cash:string,method:"Cash"|"GCash"|"Maya"|"Bank Transfer"){return method==="Cash"?(cash.trim()!==""&&Number(cash)>=total&&Number(cash)>0?"PAID":"UNPAID"):"PAID";}

function ReceiptArt({items,cashReceived,paymentMethod,paymentStatus,additionalCharges,discountAmount,note,cashier}:{items:Sticker[];cashReceived:number;paymentMethod:"Cash"|"GCash"|"Maya"|"Bank Transfer";paymentStatus:string;additionalCharges:{name:string;amount:number}[];discountAmount:number;note:string;cashier:string}){
  const grouped=items.reduce((rows,item)=>{const key=item.drink+"|"+item.size+"|"+item.price;const found=rows.find(row=>row.key===key);if(found)found.quantity+=1;else rows.push({key,drink:item.drink,size:item.size,price:Number(item.price||0),quantity:1});return rows;},[] as {key:string;drink:string;size:string;price:number;quantity:number}[]);
  const drinksTotal=items.reduce((sum,item)=>sum+Number(item.price||0),0),extrasTotal=additionalCharges.reduce((sum,item)=>sum+Number(item.amount||0),0),subtotal=drinksTotal+extrasTotal,total=Math.max(0,subtotal-discountAmount),change=cashReceived-total;
  const customerName=items.find(item=>item.customer.trim())?.customer.trim()||"Walk-in";
  return <div className="receipt-sheet"><main className="receipt">
    <header className="receipt-header"><div className="receipt-head">SYP ON CAFÉ</div><div className="receipt-sub">STREET · ICED · BREWED</div><div className="receipt-address">National Rd., Apollo, Orani, Bataan</div></header>
    <div className="receipt-rule"/><section className="receipt-meta">
      <div><span>Order No.</span><strong>#{items[0]?.orderNo||"—"}</strong></div><div><span>Date</span><strong>{stamp()}</strong></div><div><span>Cashier</span><strong>{cashier}</strong></div><div><span>Customer</span><strong>{customerName}</strong></div><div><span>Payment</span><strong>{paymentMethod}</strong></div>
    </section>
    <div className="receipt-rule"/><div className="receipt-columns"><span>ITEM</span><span>AMOUNT</span></div>
    <section className="receipt-items">{grouped.map(row=><div className="receipt-item" key={row.key}><div className="receipt-item-main"><strong>{row.quantity} × {row.drink}</strong><strong>₱{(row.price*row.quantity).toFixed(2)}</strong></div><small>{row.size} · ₱{row.price.toFixed(2)} each</small></div>)}{additionalCharges.filter(item=>Number(item.amount)>0).map((item,index)=><div className="receipt-row" key={item.name+"-"+index}><span>{item.name}</span><strong>₱{Number(item.amount).toFixed(2)}</strong></div>)}</section>
    {note&&<div className="receipt-note">Note: {note}</div>}<div className="receipt-rule"/><section className="receipt-summary">
      <div className="receipt-row"><span>Subtotal</span><strong>₱{subtotal.toFixed(2)}</strong></div>{discountAmount>0&&<div className="receipt-row"><span>Discount</span><strong>-₱{discountAmount.toFixed(2)}</strong></div>}
      <div className="receipt-row receipt-total"><span>TOTAL</span><strong>₱{total.toFixed(2)}</strong></div><div className="receipt-row"><span>Status</span><strong>{paymentStatus}</strong></div>
      {paymentMethod==="Cash"&&<><div className="receipt-row"><span>Cash received</span><strong>₱{cashReceived.toFixed(2)}</strong></div><div className="receipt-row receipt-change"><span>{change>=0?"Change":"Balance due"}</span><strong>₱{Math.abs(change).toFixed(2)}</strong></div></>}
    </section><div className="receipt-rule"/><footer className="receipt-foot">THANK YOU! PLEASE COME AGAIN.</footer><div className="receipt-site">SYP ON CAFÉ · ORANI, BATAAN</div>
  </main></div>;
}
function StickerArt({sticker}:{sticker:Sticker}){
  const drinkFontSize=Math.min(19,Math.max(10,310/Math.max(12,sticker.drink.trim().length)));
  const rawDate=sticker.createdAt||stamp();
  const parsedDate=new Date(rawDate);
  const orderDate=Number.isNaN(parsedDate.getTime())?rawDate:new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:true}).format(parsedDate);
  return <div className="art ref-art simple-sticker">
    <header className="simple-sticker-head"><strong>SYP ON CAFÉ</strong><span>ORANI, BATAAN</span></header>
    <div className="simple-sticker-order">ORDER #{sticker.orderNo}</div>
    <div className="simple-sticker-drink" style={{fontSize:drinkFontSize+"pt"}}>{sticker.drink.toUpperCase()}</div>
    <div className="simple-sticker-size">{sticker.size}</div>
    <div className="simple-sticker-options"><span>{sticker.sugar}</span><i>·</i><span>{sticker.ice}</span></div>
    <div className="simple-sticker-customer">{sticker.customer.trim()||"Our Ka-SYP"}</div>
    <footer className="simple-sticker-date">{orderDate}</footer>
  </div>;
}
