"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const QR_TARGET = "https://syponcafe.shop";

type Sticker = {
  id: number;
  customer: string;
  drink: string;
  size: string;
  ice: string;
  sugar: string;
  notes: string;
  dateTime: string;
  quote: string;
  orderId?: string | number;
  orderNumber?: string;
  source: "manual" | "pos_order";
};

type ManualOrder = {
  orderId: string; customer: string; drink: string; size: string; quantity: number;
  unitPrice: number; total: number; dateTime: string;
};

type PosItem = {
  product_name?: string;
  name?: string;
  drink?: string;
  size?: string;
  quantity?: number;
  price?: number;
  line_total?: number;
  temperature?: string;
  ice?: string;
  sugar?: string;
  notes?: string;
};

type PosOrder = {
  id: string | number;
  order_number?: string;
  receipt_no?: string;
  queue_no?: string;
  customer_name?: string;
  total?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  items?: PosItem[];
  order_items?: PosItem[];
  paid_at?: string;
  created_at?: string;
};

const QUOTES = [
  "Kape muna, may magandang bukas.",
  "Dahan-dahan lang, hindi ka nahuhuli.",
  "Laban lang, deserve mo rin ang pahinga.",
  "Pahinga rin, hindi kailangang perfect.",
  "Ngiti muna, may dahilan para ngumiti.",
  "Isang higop, isa ka pa ring panalo.",
  "Chill ka lang, hindi ka nag-iisa.",
  "Kape at kwento, may saya sa simpleng bagay.",
  "Walang pressure, piliin mo rin ang sarili mo.",
  "Kahit puyat, may bagong chance bukas.",
  "Ang kape, hindi nang-iiwan.",
  "Kape ang sagot. Ano ulit ang tanong?",
  "Hindi tamad, naka-power saving mode.",
  "Kung may problema, may kape muna.",
  "Busy kunwari, nagkakape talaga.",
  "Petsa de peligro pero may iced coffee.",
  "Kape ang love language ko.",
  "Puyat responsibly.",
  "Minsan, kailangan mo lang ng space at kape.",
  "Ang pahinga ay hindi pagsuko.",
  "Hindi lahat ng miss mo ay dapat balikan.",
  "Okay lang hindi okay araw-araw.",
  "May peace sa pagbitaw.",
  "Hindi ka mahina dahil napagod ka.",
  "May bagong kwento pagkatapos ng dulo.",
  "Kape muna, saka na ang overthinking.",
"One sip at a time.",
"You deserve this little break.",
"Hindi kailangang bilisan ang buhay.",
"Slow days are still progress.",
"Kape ang pahinga ng pagod na puso.",
"Keep going, kahit dahan-dahan.",
"Your story is still unfolding.",
"Pahinga ka rin, KasYP.",
"Small wins are still wins.",
"Hindi ka late, may sarili kang timeline.",
"Breathe in peace, breathe out stress.",
"Isang araw lang muna sa bawat araw.",
"You are doing better than you think.",
"Kaya mo pa, pero puwede ring magpahinga.",
"Choose peace over pressure.",
"Hindi kailangang perfect para maging proud.",
"Better days are brewing.",
"Kape, hinga, laban ulit.",
"Trust the timing of your life.",
"Deserve mo ang pahingang pinaghirapan mo.",
"Rest is part of the journey.",
"Hindi lahat kailangang sagutin ngayon.",
"Make room for good things.",
"Your effort matters, kahit walang nakakakita.",
"Kapag pagod, huminto; huwag sumuko.",
"One little step still moves you forward.",
"May magandang bukas pagkatapos ng mahabang gabi.",
"Be proud of how far you've come.",
"A little coffee, a little courage.",
"Kape muna bago magdesisyon.",
"Overthinking? Add ice and stir.",
"Walang problema ang hindi puwedeng ipagpaliban habang nagkakape.",
"Adulting is just guessing with confidence.",
"Kape ang sahod ng kaluluwa.",
"Puyat ngayon, antok mamaya.",
"Low battery, high caffeine.",
"Kape: dahil hindi pa puwedeng mag-resign sa buhay.",
"Hindi ako galit, kulang lang sa kape.",
"My daily dose of bahala na.",
"Kape muna, bago maging main character.",
"BRB, nagre-recharge ng pagkatao.",
"No thoughts, just coffee.",
"Kulang sa tulog, sobra sa pangarap.",
"Coffee first, chismis later.",
"Hindi tamad, naka-energy saving mode.",
"Walang forever, pero may refill.",
"Kape ang plot twist ng araw ko.",
"One cup closer to functioning.",
"Kailangan ko ng kape at konting milagro.",
"Puyat responsibly, KasYP.",
"Busy? Hindi, nag-iisip lang kunwari.",
"Kape ang meeting namin ng sarili ko.",
"Ang deadline, hindi natatakot sa caffeine.",
"Coffee: my unpaid therapist.",
"Hindi ako late, cinematic entrance lang.",
"Sana all may energy tulad ng kape.",
"Masarap mabuhay kapag may iced coffee.",
"Kape muna bago mag-overreact.",
"Official member ng puyat club.",
"Love yourself like you love your coffee.",
"You are enough, even on hard days.",
"Choose yourself without guilt.",
"Be gentle with your own heart.",
"Hindi selfish ang piliin ang sarili.",
"Protect your peace at all costs.",
"You can start over anytime.",
"Your worth isn't up for debate.",
"Hindi mo kailangang patunayan ang lahat.",
"Give yourself the love you give others.",
"Grow at your own pace.",
"Hindi mo kailangang maging okay agad.",
"You deserve kindness, especially from yourself.",
"Let yourself bloom.",
"Piliin ang sarili, kahit mahirap.",
"You are allowed to outgrow old versions of you.",
"Be your own safe place.",
"Hindi ka mahirap mahalin dahil lang may flaws ka.",
"Healing looks different on everyone.",
"Take care of the person you are becoming.",
"Your peace is worth protecting.",
"Maging proud ka rin sa sarili mo.",
"You don't need everyone's approval.",
"Choose progress, not perfection.",
"Mas mahalaga ang peace kaysa validation.",
"Keep your heart soft and your boundaries strong.",
"You are more than your bad days.",
"Hindi mo kailangang makipag-unahan.",
"Make yourself a priority, too.",
"May halaga ka kahit walang pumapalakpak.",
"Become someone you feel safe being.",
"Some endings are quiet blessings.",
"Hindi lahat ng nami-miss ay dapat balikan.",
"Let go, even if you still care.",
"Healing starts with honesty.",
"You can miss someone and move on.",
"Hindi lahat ng mahal mo ay para sa'yo.",
"Some goodbyes make room for peace.",
"Your heart will learn to breathe again.",
"Hindi ka talo dahil ikaw ang bumitaw.",
"Love should feel like home.",
"Hindi sapat ang mahal mo kung hindi ka pinipili.",
"Choose someone who chooses you, too.",
"Some people are lessons, not destinations.",
"Hindi mo kailangang magmakaawa para mahalin.",
"Let the past teach, not trap you.",
"You deserve love without confusion.",
"Hindi mo kasalanang nagmahal ka nang totoo.",
"Sometimes closure is choosing yourself.",
"Hindi lahat ng tanong may sagot.",
"May peace sa pagtanggap.",
"You can forgive and still walk away.",
"The right love won't make you beg.",
"Don't chase what keeps running away.",
"May bukas pa kahit may nawala ngayon.",
"Your healing is not a race.",
"Hindi lahat ng tahimik ay walang nararamdaman.",
"One day, this won't hurt the same.",
"Let love be kind, not confusing.",
"May taong darating nang hindi mo kailangang pilitin.",
"Some chapters end so you can grow.",
"Kahit masakit, piliin ang kapayapaan.",
"You deserve a love that feels safe.",
"Hindi mo kailangang bumalik sa dating sakit.",
"Keep the memories, release the pain.",
"Midnight thoughts, morning hopes.",
"Sa tahimik na gabi, huminga ka muna.",
"Late nights, warm lights, good vibes.",
"May comfort sa simpleng tambay.",
"Gabi man, may liwanag pa rin.",
"Some nights are for healing.",
"Sa bawat higop, bawas bigat.",
"Dito muna tayo, walang pressure.",
"A quiet night can fix a lot.",
"Kape at kwento hanggang gumaan.",
"The night is young, so are your dreams.",
"Minsan, sapat na ang may kasabay.",
"Good coffee, better company.",
"Tambay now, worry less.",
"May saya sa mga gabing walang plano.",
"Let the night slow you down.",
"Sa ilalim ng ilaw, may bagong pag-asa.",
"Your midnight reminder: you're doing fine.",
"Kahit late na, puwede pang magsimula.",
"Stay a little, breathe a little.",
"A little café, a little peace.",
"Sa SYP, pahinga muna ang mundo.",
"Good vibes are always brewing.",
"Dito, puwedeng maging ikaw lang.",
"Kwentuhan muna bago umuwi.",
"Make tonight a little lighter.",
"May mga gabing kailangan lang ng kape.",
"Find your calm between sips.",
"Late-night coffee, early dreams.",
"Chill lang, KasYP.",
"Every cup holds a new beginning.",
"Thanks for being part of our story.",
"Good things take time, like good coffee.",
"A little sweetness goes a long way.",
"Stay kind, stay caffeinated.",
"Made with coffee, served with care.",
"Your favorite pause in a busy day.",
"Simple moments, lasting memories.",
"Savor the sip, enjoy the moment.",
"Kape na may kasamang good vibes.",
"Every visit makes our day better.",
"A cup of comfort, just for you.",
"Your happy place, one sip away.",
"Bawat higop, may munting saya.",
"Made for your kind of chill.",
"Good coffee, good mood.",
"Salamat sa pagdaan, KasYP.",
"A little cup of happiness.",
"Stay cozy, sip slowly.",
"Mas masaya ang kape kapag may kasama.",
"Sip happens. Enjoy it anyway.",
"Kape mo, moment mo.",
"Your break, your rules.",
"Keep the good vibes flowing.",
"Life's better with a little ice.",
"Choose joy in the little things.",
"A good day starts with a good sip.",
"Kape, kaibigan, at kwentong walang katapusan.",
"Thanks for making us part of your day.",
"Small cup, big comfort.",
"Good mood served fresh.",
"Brewed for your best moments.",
"Take a sip, make a memory.",
"Dito nagsisimula ang chill mo.",
"You make ordinary days special.",
"Kahit simpleng araw, puwedeng maging special.",
"A little caffeine, a lot of heart.",
"Keep showing up for your dreams.",
"The future is built one step at a time.",
"Your hard work will find its way.",
"Walang maliit na pangarap.",
"You didn't come this far to stop.",
"Build a life you don't need to escape from.",
"Every setback can teach you something.",
"Laban lang, may patutunguhan din.",
"Your consistency is your superpower.",
"Dream big, start small.",
"Hindi man mabilis, basta umuusad.",
"Keep planting, even before you see flowers.",
"Success begins with showing up.",
"Trust your effort.",
"May bunga rin ang tiyaga.",
"The work you do today matters.",
"Stay focused on your own lane.",
"Hindi mo kailangang makita agad ang resulta.",
"Keep building, quietly.",
"Your future self will thank you.",
"Progress over excuses.",
"Kahit konti, basta tuloy-tuloy.",
"Turn your plans into small actions.",
"May magandang naghihintay sa masipag.",
"Be patient with your progress.",
"One day at a time, one dream at a time.",
"Your next chapter can be better.",
"Don't quit on a difficult day.",
"Pahinga, recharge, repeat.",
"Better things are on the way.",
"Keep your dreams bigger than your doubts.",
"Esmeringhoy, kape muna bago magkalat.",
"Awit sa buhay, iced coffee sa kamay.",
"Luh, bakit mahal ang bilihin pero mura ang peace of mind ko?",
"Kape na lang, wala namang tayo.",
"Sana all may ka-talking stage, ako ka-kape lang.",
"Hindi ako marupok, kulang lang sa lambing.",
"Puyat na nga, wala pang ka-good night.",
"May pera sa GCash, pero ayaw gumalaw.",
"Lord, bigyan Mo ako ng pera, hindi pagsubok.",
"Nagtipid ako today. Bukas na lang ulit.",
"Ang buhay ay parang kape, minsan mapait, minsan ikaw ang bitter.",
"Kaya ko naman mag-isa, pero libre mo ba?",
"Nagmahal, nasaktan, nag-extra shot.",
"Hindi ako nag-o-overthink, nag-iimbestiga lang.",
"Sana kasing consistent ka ng antok ko.",
"Pahinga muna sa pagiging strong independent.",
"Walang jowa, pero may loyalty card.",
"Masakit ang katotohanan, pero mas masakit ang delivery fee.",
"Hindi ako suplado, naka-low power mode lang.",
"Kung hindi ka sure sa akin, sure ka ba sa order mo?",
"Pera na lang ang kulang, pati pala pera wala.",
"Ang tunay na love, hindi nanghihingi ng OTP.",
"Sana all may good morning, hindi puro good night.",
"Kape ang ka-date, wallet ang kaaway.",
"Hindi ako late, fashionably puyat lang.",
"Naka-move on na ako, pero naka-save pa rin number niya.",
"Wag mo akong paasahin, pati sweldo ko delayed.",
"Mahal kita, pero mas mahal ang kape.",
"Hindi lahat ng tahimik ay mabait, baka lowbat lang.",
"Gusto ko ng lambing, hindi dagdag problema.",
"Sana may installment din ang pahinga.",
"Kape muna bago magpanggap na okay.",
"Hindi ako tamad, energy efficient lang.",
"Ang sahod parang bisita, saglit lang.",
"Petsa de peligro pero may premium taste.",
"Walang budget pero may cravings.",
"Bawal ma-stress, wala tayong pang-therapy.",
"Sana all may savings, ako may screenshots ng presyo.",
"Bumili ng kape para makapagtrabaho, bumili ulit para kayanin ang trabaho.",
"Hindi ako magastos, mabilis lang ma-in love sa pagkain.",
"Ang tunay na matatag, nakakaraos hanggang payday.",
"Gusto ko ng peace, pero ang kapitbahay naka-videoke.",
"Nag-diet ako kahapon, today anniversary namin ng cravings.",
"Hindi ako gutom, bored lang ang sikmura.",
"One last cup daw, pang-apat na pala.",
"Kape ang sagot kahit hindi ko alam ang tanong.",
"Kung may problema, dagdagan ng pearls.",
"Life update: buhay pa, antok lang.",
"Wala akong toxic trait, may collection lang.",
"Kung may exam ang pagod, with honors na ako.",
"Esmeringhoy, ang gastos mo naman, self!",
"Sana all may ka-holding hands, ako hawak resibo.",
"Hindi ako bitter, dark roast lang.",
"Mahal ang feelings, kaya iced coffee na lang.",
"Nagparamdam siya, akala ko multo, ex pala.",
"Kung hindi ka niya replyan, baka busy. O baka ayaw talaga.",
"Seen zone specialist since birth.",
"Ang puso ko parang Wi-Fi, mahina kapag malayo ka.",
"Sana may warranty ang puso.",
"Naka-move on na, pero pag nag-chat, online agad.",
"Hindi ako naghahabol, nagja-jogging lang sa memories.",
"Ex mo na, bakit ikaw pa rin ang nagbabayad ng emotional damage?",
"Love is blind, pero friends mo nakakakita.",
"Red flag daw siya, akala ko Christmas decoration.",
"Hindi ako option, pero minsan backup charger.",
"Mahal kita, pero ayoko na ng character development.",
"Nag-pray ako ng sign, nag-story siya.",
"Sana all pinipili, hindi lang kapag convenient.",
"Walang forever, pero may monthly subscription.",
"Hindi ako marites, concerned citizen lang.",
"May chismis ba? Para naman sumaya ang araw.",
"Kape at chika: dalawang essential needs.",
"Hindi ako nangingialam, nagre-research lang.",
"Ang sikreto, huwag magtanong kung ayaw malaman ang sagot.",
"Tahimik ako kasi naka-save sa drafts ang sermon.",
"Kung may problema ka sa akin, pila ka muna.",
"Hindi ako plastik, eco-friendly lang ang packaging.",
"Smile ka lang, baka may utang kang hindi mo maalala.",
"Ang tunay na kaibigan, uutang at mangungumusta.",
"Libre ang advice, pero may service charge ang pakikinig.",
"Hindi lahat ng nakangiti masaya, yung iba may bayarin lang.",
"Pagod na ako maging mature, gusto ko na lang ng fries.",
"Buhay ay di karera, pero bills ay nag-uunahan.",
"Kung kaya ng iba, edi sana all.",
"Ang confidence ko parang signal, nawawala sa harap ng crush.",
"Hindi ako mahirap intindihin, mahirap lang akong bilhan.",
"Wag kang magmadali, baka mauna ka lang sa problema.",
"Kung walang ambag sa bills, huwag mag-ambag ng stress.",
"Hindi ako dramatic, cinematic lang ang buhay ko.",
"Ang alarm ko parang suggestion lang.",
"Gising na ang katawan, pero offline pa ang utak.",
"Natutulog ako para makatipid sa cravings.",
"Kape ang breakfast, lunch, at emotional support.",
"Wala akong plano sa buhay, pero may order na ako.",
"Kung may award sa pagpupuyat, ako ang sponsor.",
"Kahit walang jowa, may ka-share sa fries? Wala rin.",
"Esmeringhoy, bukas na natin problemahin ang bukas.",
"Basta may kape, may pag-asa. Basta may pera, may extra shot.",
"Tambay muna, baka sakaling may plot twist.",
"Kape muna, baka sakaling gumanda ang desisyon ko."
];

function manilaDateTime() {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function randomQuote(used: Set<string>) {
  const available = QUOTES.filter((quote) => !used.has(quote));
  const pool = available.length ? available : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function normalizeItems(order: PosOrder): PosItem[] {
  if (Array.isArray(order.order_items)) return order.order_items;
  if (Array.isArray(order.items)) return order.items;
  return [];
}

export default function StickerStudioPage() {
  const [customer, setCustomer] = useState("");
  const [drink, setDrink] = useState("");
  const [size, setSize] = useState("22 oz");
  const [ice, setIce] = useState("Regular ice");
  const [sugar, setSugar] = useState("Regular sugar");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>([]);
  const [printedCount, setPrintedCount] = useState(0);
  const [manualOrderCounter, setManualOrderCounter] = useState(1);
  const [dateTime, setDateTime] = useState(manilaDateTime);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [nextId, setNextId] = useState(1);
  const [notice, setNotice] = useState("");
  const [printing, setPrinting] = useState(false);

  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const [history, setHistory] = useState<{ sticker: Sticker; printedAt: string }[]>([]);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=2&ecc=H&data=${encodeURIComponent(QR_TARGET)}`,
    [],
  );

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("sypStickerManualOrders");
      const savedCounter = localStorage.getItem("sypStickerManualOrderCounter");
      const savedPrinted = localStorage.getItem("sypStickerPrintedCount");
      if (savedOrders) setManualOrders(JSON.parse(savedOrders));
      if (savedCounter) setManualOrderCounter(Math.max(1, Number(savedCounter) || 1));
      if (savedPrinted) setPrintedCount(Math.max(0, Number(savedPrinted) || 0));
    } catch { /* ignore invalid local browser data */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("sypStickerManualOrders", JSON.stringify(manualOrders));
  }, [manualOrders]);

  useEffect(() => {
    localStorage.setItem("sypStickerManualOrderCounter", String(manualOrderCounter));
  }, [manualOrderCounter]);

  useEffect(() => {
    localStorage.setItem("sypStickerPrintedCount", String(printedCount));
  }, [printedCount]);

  useEffect(() => {
    const timer = window.setInterval(() => setDateTime(manilaDateTime()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function searchOrders() {
    setSearching(true);
    setNotice("");
    setOrders([]);

    try {
      const query = orderSearch.trim();
      const response = await fetch(
        `/api/sticker-studio/orders${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        { method: "GET", credentials: "same-origin", cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Hindi makuha ang POS orders.");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data.data)
            ? data.data
            : [];

      setOrders(list);
      if (!list.length) setNotice("Walang nahanap na order. Subukan ang receipt number o customer name.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Hindi makakonekta sa POS orders API.",
      );
    } finally {
      setSearching(false);
    }
  }

  function selectOrder(order: PosOrder) {
    setSelectedOrder(order);
    setCustomer(order.customer_name || "");
    setNotice(`Napili ang order ${order.order_number || order.receipt_no || order.id}. Piliin ang item na gagawan ng sticker.`);
  }

  function addManualStickers() {
    if (!drink.trim()) { setNotice("Ilagay muna ang drink name."); return; }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) { setNotice("Ilagay ang valid na presyo."); return; }
    const count = Math.max(1, Math.min(100, quantity));
    const orderId = `SYP-${String(manualOrderCounter).padStart(4, "0")}`;
    const total = count * unitPrice;
    const now = manilaDateTime();
    const order: ManualOrder = { orderId, customer: customer.trim(), drink: drink.trim(), size, quantity: count, unitPrice, total, dateTime: now };
    const used = new Set(stickers.map((item) => item.quote));
    const added: Sticker[] = [];
    for (let i = 0; i < count; i++) {
      const quote = randomQuote(used); used.add(quote);
      added.push({ id: nextId + i, customer: customer.trim(), drink: drink.trim(), size, ice, sugar, notes: notes.trim(), dateTime: now, quote, orderId, orderNumber: orderId, source: "manual" });
    }
    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + added.length);
    setManualOrders((current) => [order, ...current]);
    setManualOrderCounter((current) => current + 1);
    setNotice(`${orderId} created · ${count} sticker(s) · Total ₱${total.toFixed(2)}. Note: local browser record only.`);
  }

  function addOrderItem(order: PosOrder, item: PosItem) {
    const drinkName = item.product_name || item.name || item.drink || "POS Order Item";
    const count = Math.max(1, Math.min(100, Number(item.quantity) || 1));
    const used = new Set(stickers.map((sticker) => sticker.quote));
    const added: Sticker[] = [];

    for (let i = 0; i < count; i++) {
      const quote = randomQuote(used);
      used.add(quote);

      added.push({
        id: nextId + i,
        customer: order.customer_name || "",
        drink: drinkName,
        size: item.size || "22 oz",
        ice: item.ice || (item.temperature === "Hot" ? "Hot" : "Regular ice"),
        sugar: item.sugar || "Regular sugar",
        notes: item.notes || "",
        dateTime: manilaDateTime(),
        quote,
        orderId: order.id,
        orderNumber: order.order_number || order.receipt_no || String(order.id),
        source: "pos_order",
      });
    }

    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + added.length);
    setNotice(`${count} sticker(s) added from order ${order.order_number || order.id}. Walang bagong sale na ginawa.`);
  }

  async function recordPrint(sticker: Sticker) {
    const response = await fetch("/api/sticker-studio/print", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: sticker.source,
        orderId: sticker.orderId ?? null,
        orderNumber: sticker.orderNumber ?? null,
        customerName: sticker.customer,
        items: [
          {
            product_name: sticker.drink,
            size: sticker.size,
            quantity: 1,
            ice: sticker.ice,
            sugar: sticker.sugar,
            notes: sticker.notes,
          },
        ],
        quantity: 1,
        action: "print",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Hindi naitala ang print job.");
    }
  }

  async function preparePrint() {
    if ("fonts" in document) await document.fonts.ready;

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(".sticker-sheet img"),
    );

    await Promise.all(
      images.map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }

        if (img.naturalWidth && img.decode) {
          try {
            await img.decode();
          } catch {}
        }
      }),
    );

        await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  function cleanupPrint() {
    document.body.classList.remove("printing-one");
    document.querySelectorAll<HTMLElement>(".sticker-sheet").forEach((node) => {
      node.classList.remove("print-selected");
    });
    setPrinting(false);
  }

  async function printStickers(id?: number) {
    if (!stickers.length || printing) {
      if (!stickers.length) setNotice("Wala pang sticker sa queue.");
      return;
    }

    const selected = id === undefined
      ? stickers
      : stickers.filter((sticker) => sticker.id === id);

    if (!selected.length) return;

    setPrinting(true);
    setNotice("Inihahanda ang print at itinatala ang print job...");

    try {
      document.body.classList.remove("printing-one");
      document.querySelectorAll<HTMLElement>(".sticker-sheet").forEach((node) => {
        node.classList.toggle(
          "print-selected",
          id !== undefined && Number(node.dataset.stickerId) === id,
        );
      });

      if (id !== undefined) document.body.classList.add("printing-one");

      await preparePrint();
      setNotice("Buksan ang print dialog. Suriin ang paper size bago mag-print.");

      // Keep a snapshot for reprinting. Remove from active queue when the
      // browser closes the print dialog; physical printer success cannot be
      // verified reliably by window.print().
      window.addEventListener("afterprint", () => {
        setHistory((current) => [
          ...selected.map((sticker) => ({ sticker, printedAt: manilaDateTime() })),
          ...current,
        ].slice(0, 100));
        setStickers((current) => current.filter((sticker) => !selected.some((done) => done.id === sticker.id)));
        setPrintedCount((current) => current + selected.length);
        cleanupPrint();
        setNotice(`Print dialog closed. ${selected.length} sticker(s) moved to print history; puwede silang i-reprint.`);
      }, { once: true });
      window.print();
    } catch (error) {
      cleanupPrint();
      setNotice(
        error instanceof Error
          ? error.message
          : "Hindi naihanda o naitala ang print job.",
      );
    }
  }

  function requeueForReprint(sticker: Sticker) {
    const copy = { ...sticker, id: nextId };
    setStickers((current) => [...current, copy]);
    setNextId((current) => current + 1);
    setNotice(`${sticker.orderNumber || sticker.orderId || "Sticker"} added back to queue. Pindutin ang Print / reprint.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeSticker(id: number) {
    setStickers((current) => current.filter((sticker) => sticker.id !== id));
    setNotice("Inalis ang sticker sa queue.");
  }

  function clearQueue() {
    setStickers([]);
    setNotice("Na-clear ang print queue.");
  }

  function reshuffleQuote(id: number) {
    const used = new Set(
      stickers.filter((sticker) => sticker.id !== id).map((item) => item.quote),
    );

    setStickers((current) =>
      current.map((sticker) =>
        sticker.id === id
          ? { ...sticker, quote: randomQuote(used) }
          : sticker,
      ),
    );
    setNotice("Bagong quote ang napili.");
  }

  return (
    <main className="studio-shell">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: #241b15; font-family: Arial, Helvetica, sans-serif; }
        .studio-shell { min-height: 100vh; padding: 26px clamp(12px,3vw,40px) 42px; }
        .studio-top { max-width: 1280px; margin: 0 auto 24px; display: flex; justify-content: space-between; align-items: center; gap: 14px; }
        .studio-brand { display: flex; align-items: center; gap: 12px; }
        .studio-brand img { width: 54px; height: 54px; object-fit: contain; background: white; border-radius: 10px; }
        .studio-brand h1 { margin: 0; font-size: clamp(22px,3vw,30px); letter-spacing: -.04em; }
        .studio-brand p { margin: 5px 0 0; font-size: 10px; letter-spacing: .16em; font-weight: 800; color: #80654d; }
        .studio-back { color: #62442e; text-decoration: none; font-size: 12px; font-weight: 800; border: 1px solid #d8c5af; border-radius: 30px; padding: 10px 14px; white-space: nowrap; }
        .sales-grid { max-width: 1280px; margin: 0 auto 20px; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; }
        .sales-card { background: #fffdf9; border: 1px solid #e8d9c6; border-radius: 14px; padding: 16px; }
        .sales-card span { display:block; color:#80644c; font-size:10px; font-weight:850; letter-spacing:.08em; text-transform:uppercase; }
        .sales-card strong { display:block; margin-top:8px; font-size:clamp(19px,2.5vw,26px); color:#62442e; overflow-wrap:anywhere; }
        .manual-order-list { margin-top:20px; border-top:1px solid #eadbc9; padding-top:16px; }
        .manual-order-item { padding:10px 0; border-bottom:1px solid #eee2d5; font-size:11px; display:flex; justify-content:space-between; gap:8px; }
        .manual-order-item small { display:block; color:#877461; margin-top:4px; }
        .studio-layout { max-width: 1280px; margin: auto; display: grid; grid-template-columns: minmax(280px,360px) minmax(0,1fr); gap: 20px; align-items: start; }
        .studio-panel { background: #fffdf9; border: 1px solid #e8d9c6; border-radius: 18px; padding: 20px; box-shadow: 0 12px 30px #482f1b0b; min-width: 0; }
        .studio-panel h2 { font-size: 17px; margin: 0 0 6px; }
        .studio-muted { color: #877461; font-size: 12px; line-height: 1.55; margin: 0 0 18px; }
        .studio-field { display: grid; gap: 6px; margin-bottom: 13px; }
        .studio-field label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #80644c; font-weight: 850; }
        .studio-field input, .studio-field select, .studio-field textarea { width: 100%; min-width: 0; border: 1px solid #dfcfbd; background: white; color: #34251a; border-radius: 9px; padding: 11px; font: inherit; font-size: 13px; outline: none; }
        .studio-field textarea { resize: vertical; min-height: 65px; }
        .studio-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .studio-button { border: 0; border-radius: 9px; padding: 12px 14px; background: #62442e; color: white; font-weight: 800; cursor: pointer; font-size: 12px; }
        .studio-button.secondary { color: #62442e; background: #efe3d3; }
        .studio-button:disabled, .small-action:disabled { opacity: .45; cursor: not-allowed; }
        .studio-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .studio-notice { padding: 10px 12px; border-radius: 9px; background: #f5ead8; color: #6d4c2e; font-size: 12px; margin-top: 12px; overflow-wrap: anywhere; }
        .studio-preview-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 16px; }
        .studio-count { font-size: 11px; font-weight: 850; color: #785a3d; background: #f3e7d7; border-radius: 30px; padding: 8px 10px; white-space: nowrap; }
        .studio-empty { min-height: 120px; border: 1px dashed #d7c4ae; border-radius: 14px; display: grid; place-items: center; padding: 25px; text-align: center; color: #927a64; font-size: 13px; line-height: 1.6; }
        .order-results { display: grid; gap: 8px; margin-bottom: 14px; }
        .order-card { padding: 11px; border: 1px solid #e5d4c0; border-radius: 10px; background: #fffaf3; }
        .order-card strong { font-size: 12px; }
        .order-card p { font-size: 11px; color: #806b56; margin: 5px 0; overflow-wrap: anywhere; }
        .order-item { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 8px; margin-top: 8px; border-top: 1px solid #eee0d0; }
        .order-item span { font-size: 11px; overflow-wrap: anywhere; }
        .sticker-list { display: grid; gap: 12px; }
        .sticker-row { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e8d9c6; border-radius: 12px; background: #fffaf3; min-width: 0; }
        .sticker-thumb { width: 100%; aspect-ratio: 80 / 50; background: white; overflow: hidden; margin-inline: auto; border: 1px dashed #cdbba5; }
        .sticker-row-actions { display: flex; flex-direction: column; gap: 6px; }
        .small-action { border: 1px solid #d8c4ad; background: white; color: #67472f; padding: 8px 9px; border-radius: 7px; font-size: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .sticker-sheet { display: none; width: 80mm; height: 52mm; margin: 0; padding: 0; overflow: hidden; background: white; color: black; }
        .sticker-art { width: 80mm; height: 50mm; overflow: hidden; background: white; color: black; display: grid; grid-template-columns: 17mm minmax(0,1fr) 13mm; grid-template-rows: minmax(0,1fr) auto; column-gap: 1.5mm; row-gap: 1mm; padding: 2mm 3mm 1.5mm 2mm; font-family: Arial, Helvetica, sans-serif; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sticker-brand-logo { grid-column: 1; grid-row: 1; width: 16mm; height: 16mm; object-fit: contain; align-self: start; justify-self: start; }
        .sticker-copy { grid-column: 2; grid-row: 1; min-width: 0; overflow: hidden; }
        .sticker-wordmark { font-size: 7pt; font-weight: 900; letter-spacing: -.03em; line-height: 1; white-space: nowrap; }
        .sticker-tagline { font-size: 4.5pt; font-weight: 800; margin-top: .8mm; letter-spacing: .03em; white-space: nowrap; }
        .sticker-drink { font-size: 17pt; font-weight: 900; line-height: 1; letter-spacing: -.045em; overflow-wrap: anywhere; margin-top: 2mm; }
        .sticker-pills { display: flex; flex-wrap: wrap; gap: .8mm; margin-top: 1.5mm; }
        .sticker-pill { border: .25mm solid #000; padding: .5mm .8mm; font-size: 5.5pt; font-weight: 800; line-height: 1.1; }
        .sticker-customer, .sticker-notes { font-size: 6pt; font-weight: 700; margin-top: 1mm; overflow-wrap: anywhere; }
        .sticker-qr { grid-column: 3; grid-row: 1; width: 13mm; display: flex; flex-direction: column; align-items: center; justify-content: start; }
        .sticker-qr img { display: block; width: 11mm; height: 11mm; object-fit: contain; }
        .sticker-qr span { font-size: 4pt; font-weight: 900; margin-top: .5mm; white-space: nowrap; }
        .sticker-quote { grid-column: 1 / 4; grid-row: 2; border-top: .45mm solid #000; padding-top: 1mm; min-width: 0; display: flex; gap: 1.5mm; align-items: center; overflow: hidden; }
        .quote-mark { font-size: 15pt; line-height: .8; font-weight: 900; flex: 0 0 auto; }
        .quote-text { font-size: 7pt; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
        .sticker-footer { font-size: 4pt; font-weight: 700; margin-top: .5mm; display: flex; justify-content: space-between; gap: 2mm; }
        @media (max-width: 900px) { .sales-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .studio-layout { grid-template-columns: 1fr; } .studio-top { align-items: flex-start; } }
        @media (max-width: 520px) { .sales-grid { gap:8px; } .sales-card { padding:12px; } .studio-shell { padding: 16px 10px 28px; } .studio-panel { padding: 15px; } .studio-brand img { width: 44px; height: 44px; } .studio-brand p { font-size: 8px; letter-spacing: .1em; } .studio-back { padding: 8px 10px; font-size: 10px; } .sticker-row { grid-template-columns: 1fr; } .sticker-row-actions { flex-direction: row; flex-wrap: wrap; } }
        @page { size: 80mm 52mm; margin: 0; }
        @media print {
          html, body { width: 80mm !important; margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
          body, body * { visibility: hidden !important; }
          .sticker-sheet, .sticker-sheet * { visibility: visible !important; }
          .studio-shell, .studio-layout, .studio-panel, .sticker-list { display: block !important; width: 80mm !important; min-width: 0 !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: white !important; }
          .studio-top, .studio-form-panel, .studio-preview-head, .studio-empty, .sticker-row-actions, .studio-notice, .studio-actions, .studio-muted, .sticker-thumb, .order-results { display: none !important; }
          .sticker-row { display: block !important; width: 80mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: white !important; break-inside: avoid !important; page-break-inside: avoid !important; }
          .sticker-sheet { display: block !important; position: relative !important; width: 80mm !important; height: 52mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; break-inside: avoid !important; page-break-inside: avoid !important; break-after: page !important; page-break-after: always !important; }
          .sticker-art { width: 80mm !important; height: 50mm !important; padding: 2mm 3mm 1.5mm 2mm !important; overflow: hidden !important; }
          .sticker-row:last-child .sticker-sheet { break-after: auto !important; page-break-after: auto !important; }
          body.printing-one .sticker-sheet { display: none !important; break-after: auto !important; page-break-after: auto !important; }
          body.printing-one .sticker-sheet.print-selected { display: block !important; }
          .sticker-brand-logo, .sticker-qr img { visibility: visible !important; }
        }
      `}</style>

      <header className="studio-top">
        <div className="studio-brand">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Sticker Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </div>
        <a className="studio-back" href="/">← Back to website</a>
      </header>

      <section className="sales-grid">
        <div className="sales-card"><span>Manual sales recorded</span><strong>₱{manualOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        <div className="sales-card"><span>Manual orders</span><strong>{manualOrders.length}</strong></div>
        <div className="sales-card"><span>Stickers in queue</span><strong>{stickers.length}</strong></div>
        <div className="sales-card"><span>Stickers printed</span><strong>{printedCount}</strong></div>
      </section>

      <div className="studio-layout">
        <section className="studio-panel studio-form-panel">
          <h2>POS order stickers</h2>
          <p className="studio-muted">Hanapin ang existing order at idagdag ang item sa sticker queue.</p>

          <div className="studio-field">
            <label htmlFor="orderSearch">Receipt / order number / customer</label>
            <input id="orderSearch" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search POS order..." maxLength={100} />
          </div>
          <button className="studio-button" type="button" disabled={searching} onClick={searchOrders}>
            {searching ? "Searching..." : "Search POS orders"}
          </button>

          <div className="order-results">
            {orders.map((order) => {
              const items = normalizeItems(order);
              return (
                <div className="order-card" key={String(order.id)}>
                  <strong>Order: {order.order_number || order.receipt_no || order.id}</strong>
                  <p>{order.customer_name || "Walk-in"} · {order.status || order.payment_status || "POS order"}</p>
                  <p>Total: ₱{Number(order.total || 0).toFixed(2)} · {order.paid_at || order.created_at || ""}</p>
                  {items.map((item, index) => (
                    <div className="order-item" key={`${order.id}-${index}`}>
                      <span>{item.product_name || item.name || item.drink || "Item"} × {item.quantity || 1} {item.size || ""}</span>
                      <button className="small-action" type="button" onClick={() => addOrderItem(order, item)}>Add sticker</button>
                    </div>
                  ))}
                  {!items.length && (
                    <button className="small-action" type="button" onClick={() => selectOrder(order)}>Select order</button>
                  )}
                </div>
              );
            })}
          </div>

          <h2 style={{ marginTop: 24 }}>Manual sticker</h2>
          <p className="studio-muted">Para sa walk-in, test print, o item na walang POS order.</p>

          <div className="studio-field">
            <label htmlFor="customer">Customer name (optional)</label>
            <input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Alex" maxLength={42} />
          </div>
          <div className="studio-field">
            <label htmlFor="drink">Drink name *</label>
            <input id="drink" value={drink} onChange={(e) => setDrink(e.target.value)} placeholder="e.g. Oreo Matcha" maxLength={42} />
          </div>
          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="size">Cup size</label>
              <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                <option>16 oz</option><option>22 oz</option><option>Hot 8 oz</option><option>Hot 12 oz</option><option>Custom size</option>
              </select>
            </div>
            <div className="studio-field">
              <label htmlFor="quantity">Quantity</label>
              <input id="quantity" type="number" min={1} max={100} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
            </div>
          </div>
          <div className="studio-field">
            <label htmlFor="unitPrice">Price per drink (₱)</label>
            <input id="unitPrice" type="number" min={0} step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))} placeholder="e.g. 109" />
            <small style={{ color: "#877461", fontSize: 11 }}>Order total: <strong>₱{(Math.max(1, Math.min(100, quantity)) * unitPrice).toFixed(2)}</strong></small>
          </div>
          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="ice">Ice preference</label>
              <select id="ice" value={ice} onChange={(e) => setIce(e.target.value)}>
                <option>Regular ice</option><option>Less ice</option><option>No ice</option><option>Extra ice</option><option>Hot</option>
              </select>
            </div>
            <div className="studio-field">
              <label htmlFor="sugar">Sugar preference</label>
              <select id="sugar" value={sugar} onChange={(e) => setSugar(e.target.value)}>
                <option>Regular sugar</option><option>Less sugar</option><option>Half sugar</option><option>No sugar</option><option>Extra sugar</option>
              </select>
            </div>
          </div>
          <div className="studio-field">
            <label htmlFor="notes">Custom notes (optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Oat milk, no whipped cream" maxLength={100} />
          </div>
          <div className="studio-field">
            <label htmlFor="dateTime">Manila date &amp; time</label>
            <input id="dateTime" value={dateTime} readOnly />
          </div>
          <button className="studio-button" type="button" onClick={addManualStickers}>＋ Add manual order & create stickers</button>

          {notice && <div className="studio-notice" role="status">{notice}</div>}
          <div className="studio-actions">
            <button className="studio-button secondary" type="button" onClick={() => {
              setCustomer(""); setDrink(""); setSize("22 oz"); setIce("Regular ice"); setSugar("Regular sugar"); setNotes(""); setQuantity(1); setUnitPrice(0); setSelectedOrder(null); setNotice("Form cleared.");
            }}>Clear form</button>
            <button className="studio-button secondary" type="button" onClick={clearQueue}>Clear queue</button>
          </div>
        </section>

        <section className="studio-panel">
          <div className="studio-preview-head">
            <div>
              <h2>Print queue</h2>
              <p className="studio-muted" style={{ marginBottom: 0 }}>Label 80 × 50 mm + 2 mm feed gap.</p>
            </div>
            <span className="studio-count">{stickers.length} sticker(s)</span>
          </div>

          {!stickers.length ? (
            <div className="studio-empty">Your sticker preview will appear here.<br />Search a POS order or add a manual sticker.</div>
          ) : (
            <div className="sticker-list">
              {stickers.map((sticker) => (
                <div className="sticker-row" key={sticker.id}>
                  <div className="sticker-thumb"><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
                  <div className="sticker-row-actions">
                    <button className="small-action" type="button" disabled={printing} onClick={() => printStickers(sticker.id)}>Print / reprint</button>
                    <button className="small-action" type="button" disabled={printing} onClick={() => reshuffleQuote(sticker.id)}>Random quote</button>
                    <button className="small-action" type="button" disabled={printing} onClick={() => removeSticker(sticker.id)}>Remove</button>
                  </div>
                  <div className="sticker-sheet" data-sticker-id={sticker.id}><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
                </div>
              ))}
            </div>
          )}

          <div className="studio-actions">
            <button className="studio-button" type="button" disabled={!stickers.length || printing} onClick={() => printStickers()}>
              {printing ? "Preparing print..." : "Print all stickers"}
            </button>
          </div>

          <div className="manual-order-list">
            <h2>Recent manual orders</h2>
            <p className="studio-muted">Saved in this browser only. These totals do not include POS orders.</p>
            {!manualOrders.length ? <div className="studio-empty">Wala pang manual order na na-record.</div> : manualOrders.slice(0, 8).map((order) => (
              <div className="manual-order-item" key={order.orderId}>
                <div><strong>{order.orderId} · {order.drink}</strong><small>{order.customer || "Walk-in"} · {order.quantity} × ₱{order.unitPrice.toFixed(2)} · {order.dateTime}</small></div>
                <strong>₱{order.total.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 24 }}>Recent print actions</h2>
          <p className="studio-muted">Temporary list for this browser session. Ang permanent history ay dapat manggaling sa database API.</p>
          {!history.length ? <div className="studio-empty">Wala pang print action sa session na ito.</div> : history.map((entry, index) => (
            <div className="manual-order-item" key={`${entry.sticker.id}-${entry.printedAt}-${index}`}>
              <div><strong>{entry.sticker.orderNumber || entry.sticker.orderId || entry.sticker.source} · {entry.sticker.drink}</strong><small>{entry.sticker.customer || "Walk-in"} · {entry.printedAt}</small></div>
              <button className="small-action" type="button" disabled={printing} onClick={() => requeueForReprint(entry.sticker)}>Reprint</button>
            </div>
          ))}

          <p className="studio-muted" style={{ marginTop: 14, marginBottom: 0 }}>
            Set paper to 80 × 52 mm, print at 100% / Actual size, margins 0, headers and footers off. Calibrate the gap sensor if needed.
          </p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({ sticker, qrUrl }: { sticker: Sticker; qrUrl: string }) {
  return (
    <div className="sticker-art">
      <img className="sticker-brand-logo" src={LOGO_URL} alt="SYP ON CAFÉ logo" />
      <div className="sticker-copy">
        <div className="sticker-wordmark">SYP ON CAFÉ</div>
        <div className="sticker-tagline">STREET • ICED • BREWED</div>
        {sticker.customer && <div className="sticker-customer">FOR: {sticker.customer}</div>}
        <div className="sticker-drink">{sticker.drink}</div>
        <div className="sticker-pills">
          <span className="sticker-pill">{sticker.size}</span>
          <span className="sticker-pill">{sticker.ice}</span>
          <span className="sticker-pill">{sticker.sugar}</span>
        </div>
        {sticker.notes && <div className="sticker-notes">NOTE: {sticker.notes}</div>}
      </div>
      <div className="sticker-qr">
        <img src={qrUrl} alt="QR code to syponcafe.shop" />
        <span>SCAN SYP</span>
      </div>
      <div className="sticker-quote">
        <span className="quote-mark">“</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="quote-text">{sticker.quote}</div>
          <div className="sticker-footer">
            <span>{sticker.orderNumber ? `${sticker.orderNumber} · ` : ""}{sticker.dateTime}</span>
            <span>syponcafe.shop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
