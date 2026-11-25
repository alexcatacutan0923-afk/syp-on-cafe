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

export default function StickerStudioPage() {
  const [search,setSearch]=useState("");
  const [salesReportOpen,setSalesReportOpen]=useState(false);
  const [activeCategory,setActiveCategory]=useState("All");
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
  const [printMode,setPrintMode]=useState<"both"|"stickers"|"receipt">("both");
  const [qzStatus,setQzStatus]=useState("Not connected");
  const [qzPrinters,setQzPrinters]=useState<string[]>([]);
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
      setNotice("QZ Tray connected. Check that TP870 S and EPSON TM-T88IV Receipt are listed below.");
    }catch(error){
      setQzStatus("Connection failed");
      setNotice("QZ Tray error: "+((error as any)?.message||String(error)));
    }
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
    const {data:resetData,error:resetError}=await supabase.from("sticker_studio_daily_counters").select("cash_reset_at,orders_reset_at").eq("business_date",counterKey).maybeSingle();
    if(resetError){setSalesError(resetError.message);setSalesLoading(false);return;}
    const {data,error}=await supabase.from("sticker_studio_sales").select("id,total_amount,created_at,business_date,payment_status,payment_method,items,order_number,customer_name,subtotal_amount,additional_charges,discount_amount,cash_received,change_amount");
    if(error){setSalesError(error.message);setSalesLoading(false);return;}
    const allRows=data||[];
    setSalesRows(allRows);
    const paidRows=allRows.filter(row=>row.payment_status!=="unpaid");
    const {data:unpaidData}=await supabase.from("sticker_studio_sales").select("id,order_number,customer_name,total_amount,amount_paid,payment_method,created_at").eq("payment_status","unpaid").order("created_at",{ascending:false});
    setUnpaidOrders(unpaidData||[]);
    const orderRows=resetData?.orders_reset_at?allRows.filter(row=>new Date(row.created_at)>=new Date(resetData.orders_reset_at)):allRows;
    const cashRows=resetData?.cash_reset_at?paidRows.filter(row=>new Date(row.created_at)>=new Date(resetData.cash_reset_at)):paidRows;
    const monthRows=paidRows.filter(row=>row.business_date>=monthStart);
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

  useEffect(()=>{try{const q=localStorage.getItem("syp-signature-queue");const h=localStorage.getItem("syp-signature-history");const n=localStorage.getItem("syp-signature-id");if(q)setQueue(JSON.parse(q));if(h)setHistory(JSON.parse(h));if(n)setNextId(Number(n)||1);}catch{}setReady(true);void refreshDailySales();void refreshNextOrderNumber();},[]);
  useEffect(()=>{if(!ready)return;localStorage.setItem("syp-signature-queue",JSON.stringify(queue));localStorage.setItem("syp-signature-history",JSON.stringify(history));localStorage.setItem("syp-signature-id",String(nextId));localStorage.setItem("syp-signature-order-no",orderNo);},[queue,history,nextId,orderNo,ready]);

  const categories=["All","Iced Coffee","Hot Coffee","Iced Milky","Hot Milky","Iced Signature","Matcha","Hot Matcha","Soda","Fries","Waffle"];
  const filtered=useMemo(()=>MENU.map((m,i)=>({m,i})).filter(({m})=>(activeCategory==="All"||m[3]===activeCategory)&&(m[0].toLowerCase().includes(search.toLowerCase())||m[3].toLowerCase().includes(search.toLowerCase()))),[search,activeCategory]);
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
    setQuote(pickUniqueQuote(category,used));
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
  async function print(ids?:number[]){const rawSelectedItems=ids?queue.filter(x=>ids.includes(x.id)):queue;if(!rawSelectedItems.length)return;const selectedItems=rawSelectedItems.map(item=>({...item,note:note.trim()||item.note}));if(paymentMethod!=="Cash"&&!paymentConfirmed){setNotice("Please confirm muna na natanggap na ang "+paymentMethod+" payment.");return;}const cashInput=cashReceived.trim()===""?0:Number(cashReceived);if(paymentMethod==="Cash"&&(!Number.isFinite(cashInput)||cashInput<0)){setNotice("Invalid ang cash received. Pakilagay ang tamang halaga.");return;}const paymentStatus=paymentMethod==="Cash"?(cashInput>=finalTotal&&cashInput>0?"paid":"unpaid"):"paid";const amountPaid=paymentStatus==="paid"?finalTotal:0;const pendingItems=selectedItems.filter(x=>x.salePending);if(pendingItems.length){if(!isSupabaseConfigured){setNotice("Hindi naka-configure ang database. Hindi maitatala ang sale.");return;}const groups=Array.from(new Set(pendingItems.map(x=>x.orderNo))).map(order=>pendingItems.filter(x=>x.orderNo===order));const businessDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());let discountRemaining=discountAmount;for(let index=0;index<groups.length;index++){const group=groups[index];const subtotal=group.reduce((sum,item)=>sum+Number(item.price||0),0);const charges=index===0?receiptCharges:[];const extraTotal=charges.reduce((sum,item)=>sum+item.amount,0);const orderDiscount=Math.min(subtotal+extraTotal,discountRemaining);discountRemaining=Math.max(0,discountRemaining-orderDiscount);const saleTotal=Math.max(0,subtotal+extraTotal-orderDiscount);const groupCash=index===0&&paymentMethod==="Cash"?cashInput:0;const sale={id:crypto.randomUUID(),order_number:group[0].orderNo,business_date:businessDate,customer_name:group[0].customer||"Walk-in",items:group.map(item=>({drink:item.drink,size:item.size,category:item.category,quantity:1,unit_price:Number(item.price),sugar:item.sugar,ice:item.ice,note:item.note})),total_quantity:group.length,subtotal_amount:subtotal,additional_charges:charges,discount_amount:orderDiscount,total_amount:saleTotal,payment_status:paymentStatus,amount_paid:paymentStatus==="paid"?saleTotal:0,payment_method:paymentMethod,cash_received:groupCash,change_amount:paymentMethod==="Cash"?Math.max(0,groupCash-saleTotal):0};const {error}=await supabase.from("sticker_studio_sales").insert(sale);if(error){setNotice("Hindi naitala ang sale kaya hindi muna magpi-print: "+error.message);return;}}const pendingIds=new Set(pendingItems.map(x=>x.id));setQueue(q=>q.map(item=>pendingIds.has(item.id)?{...item,salePending:false}:item));await refreshDailySales();}const selectedMode=printMode;setPrintItems(selectedItems);const done=()=>{const nextHistory=[...selectedItems.map(item=>({...item,salePending:false})),...history].slice(0,250);const nextQueue=queue.filter(x=>!selectedItems.some(y=>y.id===x.id));setHistory(nextHistory);setQueue(nextQueue);try{localStorage.setItem("syp-signature-history",JSON.stringify(nextHistory));localStorage.setItem("syp-signature-queue",JSON.stringify(nextQueue));}catch{}setNotice((paymentStatus==="paid"?"PAID":"UNPAID")+". Print dialog closed. Saved in history.");setPrintItems([]);setCheckoutOpen(false);window.removeEventListener("afterprint",done);window.setTimeout(()=>window.location.reload(),500);};window.addEventListener("afterprint",done,{once:true});window.setTimeout(()=>window.print(),350);window.setTimeout(()=>window.removeEventListener("afterprint",done),60000);}
  function reprint(s:Sticker){setPrintMode("stickers");setPrintItems([{...s,id:Date.now(),salePending:false}]);setNotice("Preparing sticker reprint for Order #"+s.orderNo+"…");const refresh=()=>{window.removeEventListener("afterprint",refresh);window.setTimeout(()=>window.location.reload(),500);};window.addEventListener("afterprint",refresh,{once:true});window.setTimeout(()=>window.print(),350);window.setTimeout(()=>window.removeEventListener("afterprint",refresh),60000);}

  return <main className="studio">
    <style jsx global>{`
      *{box-sizing:border-box}body{margin:0;background:#f3ede4;color:#2e241c;font-family:Arial,sans-serif}.studio{min-height:100vh;padding:22px}.head,.layout{max-width:1200px;margin:0 auto 18px}.head{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;align-items:center;gap:13px}.brand img{width:58px;height:58px;object-fit:contain;background:#fff;border-radius:12px}.brand h1{font-size:25px;margin:0}.brand p{font-size:10px;letter-spacing:.18em;font-weight:800;color:#876b51;margin:5px 0}.layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(390px,460px);gap:18px;align-items:start}.panel{background:#fffdf9;border:1px solid #e6d8c8;border-radius:16px;padding:18px;min-width:0}.panel h2{font-size:18px;margin:0 0 6px}.muted{font-size:12px;line-height:1.5;color:#897762;margin:0 0 15px}.field{display:grid;gap:6px;margin:0 0 12px}.field label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#80644c}.field input,.field select{width:100%;min-width:0;border:1px solid #ddcbb7;border-radius:9px;background:white;padding:11px;font-size:14px;color:#30251c}.btn{border:0;border-radius:9px;background:#65472f;color:white;padding:11px 14px;font-weight:800;font-size:12px;cursor:pointer}.btn.alt{background:#efe4d6;color:#65472f}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.notice{margin-top:12px;padding:10px;background:#f4e9d9;border-radius:8px;font-size:12px;color:#684a31}.queue{display:grid;gap:12px}.queue-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #eadfD2;border-radius:12px;padding:12px}.preview{width:100%;aspect-ratio:1/1;overflow:hidden;background:white;border:1px dashed #cdbba5}.small{font-size:11px;color:#6b4c33}.queue-buttons{display:flex;flex-direction:column;gap:6px}.smallbtn{border:1px solid #d8c5b0;border-radius:7px;background:#fff;padding:8px;color:#684a31;font-weight:800;font-size:10px;cursor:pointer}.checkout-overlay{position:fixed;inset:0;z-index:1000;background:rgba(30,22,16,.58);display:flex;align-items:center;justify-content:center;padding:14px}.checkout-card{width:min(100%,430px);max-height:min(88vh,720px);overflow:auto;background:#fffdf9;border:1px solid #e6d8c8;border-radius:18px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.28)}.checkout-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.checkout-total{background:#f4eadc;border-radius:13px;padding:13px;margin:12px 0;display:flex;justify-content:space-between;align-items:center}.checkout-total strong{font-size:27px}.checkout-change{background:#e9f4e9;border:1px solid #c7dfc7;border-radius:13px;padding:13px;display:flex;justify-content:space-between;align-items:center;gap:8px;margin:10px 0}.checkout-change strong{font-size:27px;color:#23643b}.checkout-change.short{background:#fff2e5;border-color:#f1d2ad}.checkout-change.short strong{color:#a65312}.checkout-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.checkout-grid .field{margin:0}.checkout-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.checkout-actions .btn{min-height:46px}.checkout-items{max-height:150px;overflow:auto;border:1px solid #eadfD2;border-radius:10px;padding:9px;display:grid;gap:7px}.checkout-item{display:flex;justify-content:space-between;gap:8px;font-size:12px}.checkout-overlay .field input,.checkout-overlay .field select{padding:12px;font-size:16px}.checkout-overlay .small{font-size:11px}.history{margin-top:24px;display:grid;gap:8px}.history-scroll{max-height:clamp(240px,42vh,440px);overflow-y:auto;overscroll-behavior:contain;padding:0 9px 8px 0;scrollbar-width:thin;scrollbar-color:#bda58b #f2e9df}.history-scroll::-webkit-scrollbar{width:7px}.history-scroll::-webkit-scrollbar-thumb{background:#bda58b;border-radius:10px}.history-scroll::-webkit-scrollbar-track{background:#f2e9df;border-radius:10px}.category-tabs{display:flex;gap:7px;overflow-x:auto;padding:3px 1px 8px;scrollbar-width:thin}.category-tab{flex:0 0 auto;border:1px solid #dfcdb9;background:#fff;border-radius:999px;padding:8px 13px;font-size:11px;font-weight:900;color:#76563b;cursor:pointer}.category-tab.active{background:#65472f;color:#fff;border-color:#65472f}.quick-menu{display:grid;gap:12px;margin:10px 0 16px;max-height:clamp(280px,58vh,620px);overflow-y:auto;overscroll-behavior:contain;padding:10px;border:1px solid #eadfD2;border-radius:14px;background:#faf6f0;scrollbar-gutter:stable}.quick-menu::-webkit-scrollbar{width:7px}.quick-menu::-webkit-scrollbar-thumb{background:#cbb69e;border-radius:10px}.quick-menu::-webkit-scrollbar-track{background:#f1e8dc;border-radius:10px}.menu-divider{display:flex;align-items:center;gap:10px;margin:5px 0 0}.menu-divider span{font-size:11px;font-weight:900;letter-spacing:.16em;color:#76563b;white-space:nowrap}.menu-divider i{height:1px;background:#d9c7b3;flex:1}.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.payment-confirm{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid #d7c3aa;border-radius:10px;background:#fff8ef;font-size:12px}.payment-confirm input{width:18px;height:18px;margin:1px 0 0;accent-color:#65472f}.payment-confirm span{display:grid;gap:3px}.payment-confirm small{font-size:10px;color:#806b56;line-height:1.4}.report-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.report-card{padding:12px;border:1px solid #e6d8c8;border-radius:12px;background:#fffaf4;min-width:0}.report-card strong{display:block;font-size:18px;margin-top:5px}.report-line{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #eee3d7;font-size:12px}.report-line:last-child{border:0}.report-scroll{max-height:230px;overflow:auto}.order-summary-bar{position:sticky;top:8px;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin:8px 0 14px;border:1px solid #e3d1bd;border-radius:13px;background:#fbf4eb;box-shadow:0 5px 16px rgba(70,48,29,.08)}.order-summary-bar div{display:grid;gap:2px}.order-summary-bar span{font-size:9px;letter-spacing:.1em;font-weight:900;color:#80644c}.order-summary-bar strong{font-size:23px}.order-summary-bar small{font-size:10px;color:#897762}.order-summary-bar .btn{white-space:nowrap}.queue-edit{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex-wrap:wrap}.queue-edit button{width:30px;height:30px;border:1px solid #d8c5b0;border-radius:8px;background:#fff;color:#65472f;font-weight:900;cursor:pointer}.queue-edit .remove{width:auto;padding:0 9px;font-size:10px}.quick-item{min-width:0;min-height:72px;border:1px solid #e4d4c2;border-radius:11px;background:#fff;padding:10px;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 8px;color:#35281e;cursor:pointer;transition:background .12s,border-color .12s,transform .12s}.quick-item:active{transform:scale(.98);background:#f4eadc}.quick-item strong{font-size:12px;line-height:1.2;overflow-wrap:anywhere}.quick-item span{font-size:10px;color:#8a725b}.quick-item b{grid-column:2;grid-row:1 / span 2;font-size:14px;white-space:nowrap;color:#65472f}.quick-item.selected{border-color:#8c6747;background:#f8f0e6}.history-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;border-bottom:1px solid #eee4d9;padding:11px 0;font-size:12px;min-width:0}.history-info{display:grid;gap:4px;min-width:0}.history-name{font-size:13px;font-weight:900;line-height:1.25;overflow-wrap:anywhere}.history-specs{display:flex;flex-wrap:wrap;align-items:center;gap:5px 9px;font-size:12px;font-weight:800;color:#65472f}.history-meta{font-size:10px;line-height:1.4;color:#897762;overflow-wrap:anywhere}.history-price{font-size:13px;font-weight:900;color:#2e241c;white-space:nowrap}
      .art{width:66mm;height:48mm;box-sizing:border-box;background:white;color:#000;overflow:hidden;margin:1mm 2mm;padding:1.5mm;border:.35mm solid #000;display:flex;flex-direction:column;font-family:Arial,sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}.art-top{display:flex;align-items:center;justify-content:space-between;border-bottom:.5mm solid #000;padding-bottom:1mm;gap:1mm;flex:0 0 auto;min-height:10mm}.art-logo{width:11mm;height:8mm;object-fit:contain}.art-brand{flex:1;text-align:center}.art-brand strong{display:block;font-size:9.5pt;letter-spacing:.035em}.art-brand span{font-size:4pt;font-weight:900;letter-spacing:.12em}.art-qr-row{display:grid;grid-template-columns:17mm minmax(0,1fr) 17mm;align-items:center;gap:1.2mm;width:100%;margin:1mm 0 0;padding:0 .4mm;flex:0 0 auto;min-height:18mm}.art-qr-row>div{display:flex;flex-direction:column;align-items:center;justify-content:center;width:17mm;gap:.45mm}.art-qr-main,.art-wifi-qr{width:14mm;height:14mm;object-fit:contain;display:block;image-rendering:pixelated}.art-wifi-box{display:flex;flex-direction:column;align-items:center;justify-content:center;width:17mm;gap:.45mm}.art-wifi-label,.art-qr-label{text-align:center;font-size:4.2pt;font-weight:900;letter-spacing:.01em;line-height:1.05}.art-wifi-name{text-align:center;font-size:3.7pt;line-height:1;font-weight:800}.art-quote{min-width:0;min-height:13mm;padding:.8mm .5mm;text-align:center;font-size:5.8pt;font-weight:900;line-height:1.12;display:flex;align-items:center;justify-content:center;overflow-wrap:anywhere;word-break:normal;border-left:.25mm solid #000;border-right:.25mm solid #000}.art-order{font-size:5pt;font-weight:900;text-align:center;margin-top:.7mm;letter-spacing:.1em;flex:0 0 auto}.art-drink{font-size:13pt;line-height:1.02;text-align:center;font-weight:900;overflow-wrap:anywhere;margin:.8mm 0 .3mm;flex:0 0 auto}.art-meta{display:flex;justify-content:center;gap:1mm;font-size:4.3pt;font-weight:900;margin-top:.4mm;flex-wrap:wrap;flex:0 0 auto}.art-customer{text-align:center;font-size:4.3pt;font-weight:900;margin-top:.4mm;flex:0 0 auto}.art-note{text-align:center;font-size:3.8pt;font-weight:800;margin-top:.3mm;flex:0 0 auto}.art-foot{display:flex;justify-content:space-between;align-items:center;font-size:3.6pt;font-weight:900;padding-top:.5mm;letter-spacing:.04em;flex:0 0 auto}.print-only-container{display:none}.print-sheet{display:none}
      @media(max-width:900px){.layout{grid-template-columns:1fr}.studio{padding:13px}.quick-menu{max-height:48vh}}@media(min-width:901px){.form-panel{position:sticky;top:12px;align-self:start}.layout>section:last-of-type{min-width:0}}@media(max-width:480px){.head{align-items:flex-start}.queue-row{grid-template-columns:1fr}.queue-buttons{flex-direction:row;flex-wrap:wrap}.quick-menu{max-height:46vh;padding:8px}.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @page{size:70mm 50mm;margin:0} @page receipt{size:80mm auto;margin:0} @media print{html,body{width:70mm!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important}body *{visibility:hidden!important}.studio,.studio .print-only-container,.studio .print-only-container *{visibility:visible!important}.studio{display:block!important;position:static!important;width:70mm!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;background:#fff!important}.studio>*:not(.print-only-container){display:none!important}.print-only-container{display:block!important;position:static!important;width:70mm!important;margin:0!important;padding:0!important}.print-sheet{display:block!important;position:relative!important;width:70mm!important;height:50mm!important;min-height:50mm!important;max-height:50mm!important;margin:0!important;padding:0!important;overflow:hidden!important;break-inside:avoid!important;page-break-inside:avoid!important;break-after:page!important;page-break-after:always!important}.receipt-sheet{page:receipt!important;display:block!important;position:relative!important;width:80mm!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;break-inside:avoid!important;page-break-inside:avoid!important;break-after:auto!important;page-break-after:auto!important}.receipt{width:76mm;min-height:76mm;height:auto;max-height:none;box-sizing:border-box;margin:1mm 0 0 1mm;padding:3.5mm 5.5mm;color:#000;background:#fff;font-family:Arial,sans-serif;font-size:8pt;overflow:visible;break-inside:auto;page-break-inside:auto}.receipt-item,.receipt-row{break-inside:avoid!important;page-break-inside:avoid!important}.receipt-head{text-align:center;font-weight:900;font-size:14pt;letter-spacing:.03em}.receipt-sub{text-align:center;font-size:6pt;font-weight:800;letter-spacing:.12em;margin-top:1mm}.receipt-title{text-align:center;font-size:8pt;font-weight:900;margin:2mm 0}.receipt-rule{border-top:.35mm dashed #000;margin:2mm 0}.receipt-row{display:flex;justify-content:space-between;gap:2mm;font-size:7pt;line-height:1.35}.receipt-total{font-size:10pt;font-weight:900}.receipt-change{font-size:15pt;font-weight:900}.receipt-item{margin:1mm 0}.receipt-social{text-align:center;margin:2.5mm auto 1mm;display:flex;flex-direction:column;align-items:center;gap:.7mm}.receipt-social img{width:17mm;height:17mm;object-fit:contain;display:block}.receipt-social span{font-size:6pt;font-weight:900;letter-spacing:.06em}.receipt-foot{text-align:center;font-size:7pt;font-weight:900;margin-top:2mm}.print-sheet .art{display:flex!important;box-sizing:border-box!important;width:66mm!important;height:48mm!important;min-height:48mm!important;max-height:48mm!important;margin:1mm 2mm!important;padding:1.5mm!important;border:.35mm solid #000!important;overflow:hidden!important;gap:0!important}.art-top{position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;flex:0 0 auto!important;width:100%!important;padding-bottom:1mm!important;min-height:10mm!important}.art-logo{width:11mm!important;height:8mm!important;flex:0 0 auto!important}.art-brand{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:48mm!important;max-width:48mm!important;flex:none!important;text-align:center!important;white-space:nowrap!important}.art-brand strong{font-size:9.5pt!important;line-height:1!important;letter-spacing:.035em!important}.art-brand span{font-size:4pt!important;letter-spacing:.12em!important}.art-order{flex:0 0 auto!important;font-size:5pt!important;margin-top:.7mm!important}.art-drink{flex:0 0 auto!important;font-size:13pt!important;line-height:1.02!important;margin:.8mm 0 .3mm!important}.art-meta,.art-customer,.art-note{flex:0 0 auto!important;font-size:4.3pt!important;margin-top:.4mm!important}.art-qr-row{flex:0 0 auto!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;width:100%!important;box-sizing:border-box!important;margin:.8mm 0 0!important;padding:0 1mm!important;gap:2mm!important}.art-qr-row>div{width:19mm!important;flex:0 0 19mm!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;gap:.5mm!important}.art-qr-main{width:17mm!important;height:17mm!important;object-fit:contain!important;display:block!important;image-rendering:pixelated!important}.art-wifi-box{width:19mm!important;flex:0 0 19mm!important}.art-wifi-qr{width:17mm!important;height:17mm!important;object-fit:contain!important;display:block!important;image-rendering:pixelated!important}.art-qr-label{font-size:5pt!important;line-height:1.1!important}.art-wifi-label{font-size:5pt!important;line-height:1.1!important}.art-wifi-name{font-size:4pt!important}.art-quote{flex:0 0 auto!important;min-height:13mm!important;margin-top:0!important;padding:.8mm .5mm!important;font-size:5.8pt!important;line-height:1.12!important;overflow-wrap:anywhere!important;border-top:0!important;border-bottom:0!important;border-left:.25mm solid #000!important;border-right:.25mm solid #000!important}.art-foot{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:1mm!important;width:100%!important;min-width:0!important;flex:0 0 auto!important;font-size:4pt!important;line-height:1!important;padding-top:.5mm!important;letter-spacing:.02em!important;white-space:nowrap!important}.art-foot span{display:block!important;min-width:0!important;white-space:nowrap!important}.art-foot span:last-child{justify-self:end!important;text-align:right!important}}}
    `}</style>
    <header className="head"><div className="brand"><img src={LOGO_URL} alt="SYP logo"/><div><h1>SYP Signature Sticker Studio</h1><p>STREET • ICED • BREWED</p></div></div><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><button className="btn alt" type="button" onClick={async()=>{let device:any;try{const bt=(navigator as any).bluetooth;if(!bt){alert("Web Bluetooth is not available in this browser.");return;}if(!confirm("Print ONE 70 x 50mm test label?\\nNo sale or sticker queue record will be created."))return;device=await bt.requestDevice({acceptAllDevices:true,optionalServices:["ff00"]});const server=await device.gatt.connect();if(!server.connected)throw new Error("Bluetooth connected state is false.");const service=await server.getPrimaryService("ff00");const characteristic=await service.getCharacteristic("ff02");const payload='SIZE 70 mm,50 mm\\r\\nGAP 2 mm,0 mm\\r\\nDIRECTION 1\\r\\nCLS\\r\\nTEXT 55,75,"3",0,1,1,"SYP BLUETOOTH TEST"\\r\\nPRINT 1,1\\r\\n';const bytes=new TextEncoder().encode(payload);for(let i=0;i<bytes.length;i+=20){await characteristic.writeValueWithoutResponse(bytes.slice(i,i+20));await new Promise(resolve=>setTimeout(resolve,25));}await new Promise(resolve=>setTimeout(resolve,2500));if(!device.gatt.connected)throw new Error("Printer disconnected before the test could be confirmed.");alert("Data transfer finished and Bluetooth stayed connected. Check whether one label printed.");device.gatt.disconnect();}catch(e){try{device?.gatt?.disconnect();}catch{}alert("Test failed: "+((e as any)?.message||String(e))+"\\nIf the printer was not listed, ensure it is ON and not connected to the Grozziie app. No sale was created.");}}}>PRINT TEST LABEL</button><button className="btn" type="button" onClick={connectQz}>CONNECT QZ TRAY</button><a href="/" style={{color:"#65472f",fontSize:12,fontWeight:800}}>← Back</a></div></header>
    <section className="panel" style={{maxWidth:1200,margin:"0 auto 14px",padding:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div><strong style={{fontSize:13}}>QZ TRAY · DUAL PRINTER</strong><div className="small">{qzStatus}</div></div>
        <button type="button" className="btn alt" onClick={connectQz}>Reconnect / Find Printers</button>
      </div>
      {qzPrinters.length>0&&<div className="small" style={{marginTop:8,display:"grid",gap:4}}>{qzPrinters.map((printer,index)=><div key={printer+"-"+index}>• {printer}</div>)}</div>}
      <div className="small" style={{marginTop:8}}>Connection check only muna. Wala pang ipi-print at walang mababago sa sales o queue.</div>
    </section>
    <div className="layout">
      <section className="panel" style={{gridColumn:"1 / -1",padding:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div><strong style={{fontSize:14}}>SALES REPORT</strong><div className="small">{salesReportOpen?"Sales summary, payment breakdown, records at controls":"Nakatago ang sales report para mas maluwag ang sticker workspace."}</div></div>
          <button className="btn alt" type="button" aria-expanded={salesReportOpen} onClick={()=>setSalesReportOpen(open=>!open)}>{salesReportOpen?"▲ Close Sales Report":"▼ Open Sales Report"}</button>
        </div>
        {salesReportOpen&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginTop:14}}>

        <div><div className="small">ORDERS SINCE MANUAL RESET</div><div style={{fontSize:28,fontWeight:900}}>{salesLoading?"…":dailyOrders}</div></div>
        <div><div className="small">TOTAL SALES SINCE CASH RESET</div><div style={{fontSize:28,fontWeight:900}}>₱{salesLoading?"…":dailySales.toLocaleString("en-PH")}</div></div>
        <div><div className="small">THIS MONTH'S SALES</div><div style={{fontSize:28,fontWeight:900}}>₱{salesLoading?"…":monthlySales.toLocaleString("en-PH")}</div></div>
        <div><div className="small">NEXT ORDER NUMBER</div><div style={{fontSize:28,fontWeight:900}}>#{orderNo}</div></div>
        <div style={{gridColumn:"1 / -1",marginTop:10,borderTop:"1px solid #e5d8c9",paddingTop:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><strong>SALES REPORTS</strong><button className="btn alt" type="button" onClick={()=>{const headers=["Order Number","Customer","Date","Payment Method","Payment Status","Total Amount","Items"];const quote=(v:any)=>'"'+String(v??"").replace(/"/g,'""')+'"';const lines=[headers.map(quote).join(","),...salesRows.map(r=>[r.order_number,r.customer_name,r.created_at,r.payment_method,r.payment_status||"paid",r.total_amount,JSON.stringify(r.items||[])].map(quote).join(","))];const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="syp-sticker-studio-sales.csv";a.click();URL.revokeObjectURL(url);}}>↓ Export CSV</button></div>
        <div className="report-grid"><div className="report-card"><span className="small">PAID ORDERS</span><strong>{salesRows.filter(r=>r.payment_status!=="unpaid").length}</strong></div><div className="report-card"><span className="small">UNPAID ORDERS</span><strong>{salesRows.filter(r=>r.payment_status==="unpaid").length}</strong></div><div className="report-card"><span className="small">ALL-TIME COLLECTED</span><strong>₱{salesRows.filter(r=>r.payment_status!=="unpaid").reduce((n,r)=>n+Number(r.total_amount||0),0).toLocaleString("en-PH")}</strong></div></div>
        <div className="report-grid"><div className="report-card"><strong>PAYMENT METHODS</strong>{["Cash","GCash","Maya","Bank Transfer"].map(method=><div className="report-line" key={method}><span>{method}</span><b>₱{salesRows.filter(r=>r.payment_status!=="unpaid"&&r.payment_method===method).reduce((n,r)=>n+Number(r.total_amount||0),0).toFixed(2)}</b></div>)}</div><div className="report-card"><strong>BEST SELLERS</strong><div className="report-scroll">{(()=>{const totals:Record<string,number>={};salesRows.filter(r=>r.payment_status!=="unpaid").forEach(r=>(Array.isArray(r.items)?r.items:[]).forEach((it:any)=>{const key=it.drink||"Unknown";totals[key]=(totals[key]||0)+Number(it.quantity||1);}));return Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=><div className="report-line" key={name}><span>{name}</span><b>{count}</b></div>);})()}</div></div><div className="report-card"><strong>RECORD COUNTS</strong><div className="report-line"><span>Paid</span><b>{salesRows.filter(r=>r.payment_status!=="unpaid").length}</b></div><div className="report-line"><span>Unpaid</span><b>{salesRows.filter(r=>r.payment_status==="unpaid").length}</b></div><div className="report-line"><span>Total</span><b>{salesRows.length}</b></div></div></div></div>
        {salesError&&<div style={{gridColumn:"1 / -1",fontSize:11,color:"#a33"}}>{salesError} · Run the Sticker Studio SQL setup in Supabase.</div>}
        <div style={{gridColumn:"1 / -1",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn alt" type="button" onClick={()=>void refreshDailySales()}>↻ Refresh sales</button>
          <button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-reset ang order number sa 001? Hindi mabubura ang sales records."))return;const {data,error}=await supabase.rpc("syp_sticker_reset_order_number");if(error){setNotice("Reset failed: "+error.message);return;}setOrderNo(String(data||"001"));setNotice("Next order number reset to #001. Sales history is unchanged.");}}>↺ Reset order number</button><button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-reset ang order count sa 0? Hindi mabubura ang sales records. Bibilang ulit mula ngayon hanggang sa susunod mong manual reset."))return;const {error}=await supabase.rpc("syp_sticker_reset_orders");if(error){setNotice("Orders reset failed: "+error.message+" — Run the latest SQL patch first.");return;}await refreshDailySales();setNotice("Order count reset to 0. Sales history is unchanged.");}}>↺ Reset order count</button>
          <button className="btn alt" type="button" onClick={async()=>{if(!confirm("I-zero ang cash/sales total mula ngayon? Hindi mabubura ang sales history o mababago ang order number."))return;const {error}=await supabase.rpc("syp_sticker_reset_cash");if(error){setNotice("Cash reset failed: "+error.message);return;}await refreshDailySales();setNotice("Cash total reset to ₱0. Previous sales remain in history; new sales will count from now on.");}}>₱ Reset cash drawer</button>
        </div>

        </div>}
      </section>
      <section className="panel form-panel"><h2>Create signature sticker</h2><p className="muted">Piliin ang drink sa menu. Automatic ang drink name, size at presyo gaya ng Cup Wrap Studio.</p>
        <div className="field"><label>Search menu</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drink / category"/></div>
        <div className="category-tabs" aria-label="Menu categories">{categories.map(category=><button type="button" key={category} className={"category-tab"+(activeCategory===category?" active":"")} onClick={()=>setActiveCategory(category)}>{category==="All"?"All menu":category}</button>)}</div>
        <div className="quick-menu">
          {(activeCategory==="All"?categories.slice(1):[activeCategory]).map(category=><div key={category}><div className="menu-divider"><span>{category.toUpperCase()}</span><i/></div><div className="quick-grid">{filtered.filter(({m})=>m[3]===category).map(({m,i})=><button type="button" className={"quick-item"+(selected===i?" selected":"")} key={i} onClick={()=>void add(i)}><strong>{m[0]}</strong><span>{m[1]}</span><b>₱{m[2]}</b></button>)}</div></div>)}
          {filtered.length===0&&<p className="muted">Walang match sa search.</p>}
        </div>
        <div style={{marginTop:14,padding:12,border:"1px solid #d8c4ad",borderRadius:12,background:"#fffaf4",display:"grid",gap:9}}>
          <strong style={{fontSize:14}}>CUSTOMIZED DRINK</strong>
          <span className="small">Para sa special/custom drinks na wala sa regular menu. Ilagay ang sariling pangalan at presyo.</span>
          <div className="field"><label>Customized drink name</label><input value={customDrinkName} onChange={e=>setCustomDrinkName(e.target.value.slice(0,50))} placeholder="e.g. Customer's Own Mix"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div className="field"><label>Size</label><input value={customDrinkSize} onChange={e=>setCustomDrinkSize(e.target.value.slice(0,12))} placeholder="e.g. 16oz"/></div>
            <div className="field"><label>Price (₱)</label><input type="number" min="0" step="0.01" inputMode="decimal" value={customDrinkPrice} onChange={e=>setCustomDrinkPrice(e.target.value)} placeholder="Enter price"/></div>
          </div>
          <button type="button" className="btn" onClick={()=>void addCustomDrink()}>＋ Add customized drink</button>
        </div>
        <p className="muted">Tap ang drink at size para direktang maidagdag sa order. Walang Add to Print Queue button.</p>
        <div className="field"><label>Customer name (optional)</label><input value={customer} onChange={e=>setCustomer(e.target.value.slice(0,35))} placeholder="Walk-in / customer name"/></div>
        <div className="field"><label>Order number (automatic)</label><input value={orderNo} readOnly/><span className="small">Continuous sequence. Ikaw ang magre-reset bago magsimula ng bagong kaha.</span></div>
        <div className="field"><label>Sugar level — default regular</label><select value={sugar} onChange={e=>setSugar(e.target.value)}><option>Regular sugar</option><option>75% sugar</option><option>50% sugar</option><option>25% sugar</option><option>No sugar</option></select></div>
        <div className="field"><label>Ice level</label><select value={ice} onChange={e=>setIce(e.target.value)}><option>Regular ice</option><option>Less ice</option><option>Extra ice</option><option>No ice</option><option>Hot</option></select></div>
        
        <div className="field"><label>Signature quote</label><input value={quote} onChange={e=>setQuote(e.target.value.slice(0,100))}/><button className="btn alt" type="button" onClick={()=>randomQuote(product[3])}>🎲 Random {product[3]} quote</button></div>
        <div className="field"><label>Quantity</label><input type="number" min="1" max="100" value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></div>
        <div className="actions"><button className="btn alt" onClick={()=>{setCustomer("");setNote("");setQuantity(1);setNotice("Form cleared.");}}>Clear customer / note</button><button className="btn alt" onClick={()=>{if(confirm("Clear print queue?"))setQueue([]);}}>Clear order</button></div>
        {notice&&<div className="notice" role="status">{notice}</div>}
      </section>
      <section className="panel"><div className="panel-head" style={{display:"flex",justifyContent:"space-between"}}><div><h2>Print queue</h2><p className="muted">80mm × 80mm · square portrait feed · Portrait · Actual size 100%</p></div><strong>{queue.length}</strong></div><div className="order-summary-bar"><div><span>LIVE ORDER TOTAL</span><strong>₱{finalTotal.toFixed(2)}</strong><small>{queue.length} sticker(s) · {queue.reduce((sum,item)=>sum+1,0)} drinks</small></div><button type="button" className="btn" disabled={!queue.length} onClick={()=>setCheckoutOpen(true)}>Checkout / Print</button></div>
        {!queue.length?<p className="muted">Wala pang sticker sa queue.</p>:<div className="queue">{queue.map(s=><div className="queue-row" key={s.id}><div className="preview"><StickerArt sticker={s}/></div><div className="queue-buttons"><div className="queue-edit"><button type="button" aria-label="Remove one" onClick={()=>setQueue(q=>{const index=q.findIndex(x=>x.id===s.id);return index<0?q:q.filter((_,i)=>i!==index);})}>−</button><button type="button" aria-label="Duplicate one" onClick={()=>{const copy={...s,id:nextId,quote:pickUniqueQuote(s.category,[...queue.filter(item=>item.orderNo===s.orderNo).map(item=>item.quote),...history.slice(0,40).map(item=>item.quote)])};setNextId(n=>n+1);setQueue(q=>[...q,copy]);}}>＋</button><button type="button" className="remove" onClick={()=>{if(confirm("I-void ang item na ito? Tatanggalin ito sa kasalukuyang print queue at hindi isasama sa sale.")){setQueue(q=>q.filter(x=>x.id!==s.id));setNotice(s.drink+" · "+s.size+" voided bago i-print.");}}}>Void item</button></div><button className="smallbtn" onClick={()=>print([s.id])}>Print / reprint</button><button className="smallbtn" onClick={()=>setQueue(q=>q.map(x=>x.id===s.id?{...x,quote:pickUniqueQuote(x.category,[...q.filter(item=>item.id!==x.id&&item.orderNo===x.orderNo).map(item=>item.quote),...history.slice(0,40).map(item=>item.quote)])}:x))}>Random quote</button></div></div>)}</div>}
        <div style={{maxWidth:320,marginTop:16,border:"1px solid #e6d8c8",borderRadius:12,padding:12,display:"grid",gap:10}}><strong style={{fontSize:13}}>CUSTOM ADD-ONS / EXTRA CHARGES</strong><label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700}}><input type="checkbox" checked={deliveryEnabled} onChange={e=>setDeliveryEnabled(e.target.checked)}/> Add delivery fee</label>{deliveryEnabled&&<div className="field"><label>Delivery fee (₱)</label><input type="number" min="0" step="0.01" value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)}/></div>}{extraCharges.map(item=><div key={item.id} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 100px auto",gap:6,alignItems:"center"}}><input aria-label="Extra charge name" placeholder="e.g. Extra syrup" value={item.name} onChange={e=>setExtraCharges(rows=>rows.map(row=>row.id===item.id?{...row,name:e.target.value}:row))} style={{minWidth:0,width:"100%",padding:9,border:"1px solid #ddcbb7",borderRadius:8}}/><input aria-label="Extra charge amount" type="number" min="0" step="0.01" placeholder="₱" value={item.amount} onChange={e=>setExtraCharges(rows=>rows.map(row=>row.id===item.id?{...row,amount:e.target.value}:row))} style={{minWidth:0,width:"100%",padding:9,border:"1px solid #ddcbb7",borderRadius:8}}/><button type="button" className="smallbtn" onClick={()=>setExtraCharges(rows=>rows.filter(row=>row.id!==item.id))}>×</button></div>)}<button type="button" className="btn alt" onClick={()=>{setExtraCharges(rows=>[...rows,{id:nextChargeId,name:"",amount:""}]);setNextChargeId(n=>n+1);}}>＋ Add custom charge</button><span className="small">Halimbawa: Extra syrup, extra shot, add-ons, packaging fee.</span></div><div style={{maxWidth:320,marginTop:16,padding:12,border:"1px solid #e6d8c8",borderRadius:12,display:"grid",gap:8}}><strong style={{fontSize:13}}>ORDER DISCOUNT</strong><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><select value={discountType} onChange={e=>setDiscountType(e.target.value as "amount"|"percent")}><option value="amount">₱ Fixed amount</option><option value="percent">% Percentage</option></select><input aria-label="Discount value" type="number" min="0" max={discountType==="percent"?100:undefined} step="0.01" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} placeholder="0"/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span>Discount</span><strong>-₱{discountAmount.toFixed(2)}</strong></div><div style={{display:"flex",justifyContent:"space-between",fontSize:14}}><strong>NEW TOTAL</strong><strong>₱{finalTotal.toFixed(2)}</strong></div><span className="small">Applied to this print batch only. Max discount is the order total.</span></div><div className="field" style={{marginTop:16,maxWidth:320}}><label>Payment method</label><select value={paymentMethod} onChange={e=>{setPaymentMethod(e.target.value as "Cash"|"GCash"|"Maya"|"Bank Transfer");setPaymentConfirmed(false);}}><option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Maya">Maya</option><option value="Bank Transfer">Bank Transfer</option></select></div>{paymentMethod==="Cash"&&<div className="field" style={{maxWidth:320}}><label>Cash received (₱)</label><input type="number" min="0" step="0.01" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder="Enter customer payment"/></div>}<div style={{maxWidth:320,background:"#f8f1e8",border:"1px solid #e6d8c8",borderRadius:12,padding:14,display:"grid",gap:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><strong>Drinks ({queue.length} pcs)</strong><strong>₱{drinksTotal.toFixed(2)}</strong></div>{chargesTotal>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Extra charges</span><strong>₱{chargesTotal.toFixed(2)}</strong></div>}<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Subtotal</span><strong>₱{queueTotal.toFixed(2)}</strong></div>{discountAmount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Discount</span><strong>-₱{discountAmount.toFixed(2)}</strong></div>}<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><strong>Total</strong><strong>₱{finalTotal.toFixed(2)}</strong></div>{paymentMethod==="Cash"?<><div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Cash received</span><strong>₱{cashValid?cashAmount.toFixed(2):"0.00"}</strong></div><div style={{borderTop:"1px dashed #cdbba5",paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><strong style={{fontSize:15}}>{cashValid?(liveChange>=0?"CHANGE":"KULANG"):"SUKLI"}</strong><strong style={{fontSize:22,color:cashValid?(liveChange>=0?"#276749":"#b45309"):"#65472f"}}>{cashValid?(liveChange>=0?"₱"+liveChange.toFixed(2):"₱"+Math.abs(liveChange).toFixed(2)):"—"}</strong></div></>:<div style={{borderTop:"1px dashed #cdbba5",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:13}}><strong>PAYMENT</strong><strong>{paymentMethod.toUpperCase()}</strong></div>}</div><div className="actions"><button className="btn" disabled={!queue.length} onClick={()=>setCheckoutOpen(true)}>Checkout / Print · ₱{finalTotal.toFixed(2)}</button></div><p className="muted">Bawat print batch ay magkakaroon ng isang receipt sa pinakahuling sheet. Ang sukli ay automatic na kukuwentahin.</p>
        <div className="history"><h2>UNPAID ORDERS</h2><p className="muted">Mga order na hindi pa bayad. I-mark as paid kapag nakapagbayad na ang customer.</p>{unpaidOrders.map((u:any)=><div className="history-row" key={u.id}><div className="history-info"><div className="history-name">Order #{u.order_number} · {u.customer_name||"Walk-in"}</div><div className="history-specs"><span>₱{Number(u.total_amount||0).toFixed(2)} due</span><span className="history-price">{new Date(u.created_at).toLocaleString("en-PH")}</span></div></div><button className="smallbtn" onClick={async()=>{const {error}=await supabase.from("sticker_studio_sales").update({payment_status:"paid",amount_paid:u.total_amount,paid_at:new Date().toISOString()}).eq("id",u.id);if(error){setNotice("Hindi ma-update ang payment: "+error.message);return;}await refreshDailySales();setNotice("Order #"+u.order_number+" marked as PAID.");}}>Mark as Paid</button></div>)}{unpaidOrders.length===0&&<p className="muted">Walang unpaid orders.</p>}</div><div className="history history-scroll"><h2>SALES TRANSACTION HISTORY</h2><p className="muted">Permanent records mula sa Supabase. Kasama ang drinks, add-ons, discount at payment details.</p>{salesRows.slice().sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,100).map((sale:any)=><div className="history-row" key={sale.id}><div className="history-info"><div className="history-name">Order #{sale.order_number} · {sale.customer_name||"Walk-in"}</div><div className="history-specs"><span>₱{Number(sale.total_amount||0).toFixed(2)}</span><span className="history-price">{String(sale.payment_method||"Cash").toUpperCase()} · {String(sale.payment_status||"paid").toUpperCase()}</span></div><div className="history-meta">{new Date(sale.created_at).toLocaleString("en-PH")} · {(Array.isArray(sale.items)?sale.items:[]).map((it:any)=>`${it.drink} ${it.size}${Number(it.quantity||1)>1?" × "+it.quantity:""}`).join(", ")}</div>{(Array.isArray(sale.additional_charges)?sale.additional_charges:[]).length>0&&<div className="history-meta">Extras: {sale.additional_charges.map((c:any)=>`${c.name} ₱${Number(c.amount||0).toFixed(2)}`).join(" · ")}</div>}{Number(sale.discount_amount||0)>0&&<div className="history-meta">Discount: -₱{Number(sale.discount_amount).toFixed(2)}</div>}{sale.payment_method==="Cash"&&<div className="history-meta">Cash received: ₱{Number(sale.cash_received||0).toFixed(2)} · Sukli: ₱{Number(sale.change_amount||0).toFixed(2)}</div>}</div></div>)}{salesRows.length===0&&<p className="muted">Wala pang sales transactions.</p>}</div><div className="history history-scroll"><h2>Print history · Reprint</h2><p className="muted">Pindutin ang Reprint para direktang ilimbag ulit ang sticker. Hindi ito gagawa ng bagong sale o magdadagdag ng order.</p>{history.slice(0,40).map((s,i)=><div className="history-row" key={s.id+"-"+i}><div className="history-info"><div className="history-name">{s.drink}</div><div className="history-specs"><span>{s.size}</span><span className="history-price">₱{Number(s.price||0).toFixed(2)}</span></div><div className="history-meta">Order #{s.orderNo} · {s.customer||"Walk-in"} · {s.createdAt}</div></div><button className="smallbtn" onClick={()=>reprint(s)}>Reprint</button></div>)}{history.length===0&&<p className="muted">Wala pang print history.</p>}</div>
        <p className="muted" style={{marginTop:18}}>Printer setup: 70mm × 50mm, Landscape, Actual size / 100%, margins none, headers & footers off. Grozziie PDF: Print → Share / Save to Files as PDF → open in Grozziie app.</p>
      </section>
    </div>
    <div className="checkout-overlay" style={{display:checkoutOpen?"flex":"none"}} role="dialog" aria-modal="true" aria-label="POS checkout"><div className="checkout-card"><div className="checkout-head"><div><h2 style={{margin:0,fontSize:20}}>POS Checkout</h2><p className="muted" style={{margin:"4px 0 0"}}>{queue.length} sticker(s) in current order</p></div><button type="button" className="smallbtn" onClick={()=>setCheckoutOpen(false)}>✕ Close</button></div><div className="checkout-items">{queue.length?queue.map((s,i)=><div className="checkout-item" key={s.id+"-"+i}><span>{s.drink} · {s.size}</span><strong>₱{Number(s.price).toFixed(2)}</strong></div>):<span className="small">Walang laman ang queue.</span>}</div><div className="checkout-total"><span><strong style={{fontSize:13}}>TOTAL DUE</strong><br/><span className="small">Including add-ons and discount</span></span><strong>₱{finalTotal.toFixed(2)}</strong></div><div className="checkout-grid"><div className="field"><label>Payment method</label><select value={paymentMethod} onChange={e=>{setPaymentMethod(e.target.value as "Cash"|"GCash"|"Maya"|"Bank Transfer");setPaymentConfirmed(false);}}><option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Maya">Maya</option><option value="Bank Transfer">Bank Transfer</option></select></div><div className="field"><label>Order note · Receipt + Sticker</label><input value={note} maxLength={80} onChange={e=>setNote(e.target.value.slice(0,80))} placeholder="e.g. no straw, less foam"/><small style={{fontSize:10,color:"#897762"}}>Optional · ilalagay sa receipt at stickers ng order na ito.</small></div>{paymentMethod==="Cash"&&<div className="field"><label>Cash received (₱)</label><input type="number" min="0" step="0.01" inputMode="decimal" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder="Amount"/></div>}</div>{paymentMethod!=="Cash"&&<label className="payment-confirm"><input type="checkbox" checked={paymentConfirmed} onChange={e=>setPaymentConfirmed(e.target.checked)}/><span><strong>Confirm payment received</strong><small>Na-verify ko na ang {paymentMethod} payment bago i-print at i-record bilang PAID.</small></span></label>}{paymentMethod==="Cash"&&<div className={"checkout-change"+(cashValid&&liveChange<0?" short":"")}><span><strong style={{fontSize:13}}>{cashValid?(liveChange>=0?"SUKLI":"KULANG PA"):"SUKLI"}</strong><br/><span className="small">{cashValid?(liveChange>=0?"Ibigay sa customer":"Kulang sa bayad"):"Ilagay ang cash received"}</span></span><strong>{cashValid?"₱"+Math.abs(liveChange).toFixed(2):"—"}</strong></div>}<div className="checkout-change"><span><strong style={{fontSize:13}}>PAYMENT STATUS</strong><br/><span className="small">E-payments require confirmation before printing</span></span><strong>{paymentMethod!=="Cash"&&!paymentConfirmed?"WAITING CONFIRMATION":paymentStatusForReceipt(finalTotal,cashReceived,paymentMethod)}</strong></div><div style={{margin:"12px 0",padding:12,border:"1px solid #e6d8c8",borderRadius:12}}><strong style={{fontSize:13}}>PRINT OPTION</strong><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:7,marginTop:9}}>{([{value:"both",label:"Both"},{value:"stickers",label:"Sticker only"},{value:"receipt",label:"Receipt only"}] as const).map(option=><button key={option.value} type="button" onClick={()=>setPrintMode(option.value)} style={{padding:"10px 5px",borderRadius:9,border:printMode===option.value?"2px solid #76563c":"1px solid #d8c9b8",background:printMode===option.value?"#f2e7da":"#fff",fontWeight:800,fontSize:12,color:"#39291d"}}>{printMode===option.value?"✓ ":""}{option.label}</button>)}</div><div className="small" style={{marginTop:7}}>Piliin kung ano lang ang ilalabas sa printer para makatipid sa papel.</div></div><div className="checkout-actions"><button type="button" className="btn alt" onClick={()=>setCheckoutOpen(false)}>＋ Add another item</button><button type="button" className="btn" disabled={!queue.length} onClick={()=>print()}>{printMode==="both"?"Print stickers + receipt":printMode==="receipt"?"Print receipt only":"Print stickers only"}</button></div>{notice&&<div className="notice">{notice}</div>}</div></div><div className="print-only-container">{(printMode==="both"||printMode==="stickers")&&printItems.map((s,i)=><div className="print-sheet" key={s.id}><StickerArt sticker={s}/></div>)}{printItems.length>0&&(printMode==="both"||printMode==="receipt")&&<ReceiptArt items={printItems} cashReceived={paymentMethod==="Cash"?(Number(cashReceived)||0):0} paymentMethod={paymentMethod} paymentStatus={paymentStatusForReceipt(finalTotal,cashReceived,paymentMethod)} additionalCharges={receiptCharges} discountAmount={discountAmount} note={Array.from(new Set(printItems.map(item=>item.note.trim()).filter(Boolean))).join(" · ")}/>}</div>
  </main>;
}


function paymentStatusForReceipt(total:number,cash:string,method:"Cash"|"GCash"|"Maya"|"Bank Transfer"){return method==="Cash"?(cash.trim()!==""&&Number(cash)>=total&&Number(cash)>0?"PAID":"UNPAID"):"PAID";}

function ReceiptArt({items,cashReceived,paymentMethod,paymentStatus,additionalCharges,discountAmount,note}:{items:Sticker[];cashReceived:number;paymentMethod:"Cash"|"GCash"|"Maya"|"Bank Transfer";paymentStatus:string;additionalCharges:{name:string;amount:number}[];discountAmount:number;note:string}){
  const grouped=items.reduce((rows,item)=>{
    const key=item.orderNo+"|"+item.drink+"|"+item.size+"|"+item.price;
    const found=rows.find(row=>row.key===key);
    if(found)found.quantity+=1;
    else rows.push({key,orderNo:item.orderNo,drink:item.drink,size:item.size,price:item.price,quantity:1});
    return rows;
  },[] as {key:string;orderNo:string;drink:string;size:string;price:number;quantity:number}[]);
  const drinksTotal=items.reduce((sum,item)=>sum+Number(item.price||0),0);
  const extrasTotal=additionalCharges.reduce((sum,item)=>sum+item.amount,0);
  const total=Math.max(0,drinksTotal+extrasTotal-discountAmount);
  const change=cashReceived-total;
  return <div className="receipt-sheet"><div className="receipt">
    <div className="receipt-head">SYP ON CAFÉ</div><div className="receipt-sub">STREET • ICED • BREWED</div><div className="receipt-title">ORDER SUMMARY</div><div style={{textAlign:"center",fontSize:"6.5pt",fontWeight:900,letterSpacing:".08em",border:"1px solid #000",padding:"1mm",marginTop:"1mm"}}>NOT AN OFFICIAL RECEIPT</div>
    <div className="receipt-row"><span>ORDER #{items[0]?.orderNo||"—"}</span><span>{stamp()}</span></div>
    <div className="receipt-rule"/>
    {note&&<div style={{border:"1px dashed #777",padding:"1.5mm",margin:"1.5mm 0",fontSize:"7pt",lineHeight:1.35,overflowWrap:"anywhere"}}><strong>NOTE:</strong> {note}</div>}
    {grouped.map(row=><div className="receipt-item" key={row.key}><div className="receipt-row"><strong>{row.drink}</strong><strong>₱{(row.price*row.quantity).toFixed(2)}</strong></div><div className="receipt-row"><span>{row.size} × {row.quantity}</span></div></div>)}
    <div className="receipt-rule"/>
    <div className="receipt-row"><strong>TOTAL DRINKS</strong><strong>{items.length} pcs</strong></div>
    {additionalCharges.map((charge,index)=><div className="receipt-row" key={index}><span>{charge.name.toUpperCase()}</span><strong>₱{charge.amount.toFixed(2)}</strong></div>)}{discountAmount>0&&<div className="receipt-row"><span>DISCOUNT</span><strong>-₱{discountAmount.toFixed(2)}</strong></div>}
    <div className="receipt-row receipt-total"><span>TOTAL</span><span>₱{total.toFixed(2)}</span></div>
    <div className="receipt-row"><span>PAYMENT METHOD</span><strong>{paymentMethod.toUpperCase()}</strong></div><div className="receipt-row"><span>PAYMENT STATUS</span><strong>{paymentStatus}</strong></div>
    {paymentMethod==="Cash"&&<><div className="receipt-row"><span>CASH RECEIVED</span><strong>₱{cashReceived.toFixed(2)}</strong></div><div className="receipt-rule"/><div className="receipt-row receipt-change"><span>{change>=0?"CHANGE":"BALANCE"}</span><span>₱{Math.abs(change).toFixed(2)}</span></div></>}
    <div className="receipt-social"><img src={QR_URL} alt="SYP ON CAFÉ Facebook page QR"/><span>FOLLOW US ON FACEBOOK</span></div><div className="receipt-foot">THANK YOU, KASYP!</div>
  </div></div>;
}

function StickerArt({sticker}:{sticker:Sticker}){
  return <div className="art"><div className="art-top"><img className="art-logo" src={LOGO_URL} alt="SYP"/><div className="art-brand"><strong>SYP ON CAFÉ</strong><span>STREET • ICED • BREWED</span></div></div><div className="art-order">ORDER #{sticker.orderNo||"001"} · {sticker.createdAt}</div><div className="art-drink">{sticker.drink}</div>{sticker.customer&&<div className="art-customer">MADE FOR {sticker.customer}</div>}<div className="art-meta"><span>{sticker.size}</span><span>•</span><span>{sticker.sugar}</span><span>•</span><span>{sticker.ice}</span></div><div className="art-qr-row"><div><img className="art-qr-main" src={MEMBERSHIP_QR_URL} alt="KasYP membership registration QR"/><div className="art-qr-label">KASYP</div></div><div className="art-quote">“{sticker.quote}”</div><div className="art-wifi-box"><img className="art-wifi-qr" src={WIFI_QR_URL} alt="Syp On Café Wi-Fi QR"/><div className="art-wifi-label">FREE WI-FI</div><div className="art-wifi-name">Syp On Café</div></div></div>{sticker.note&&<div className="art-note">NOTE: {sticker.note}</div>}<div className="art-foot"><span>THANK YOU, KASYP!</span><span>SYP ON CAFÉ</span></div></div>;
}
