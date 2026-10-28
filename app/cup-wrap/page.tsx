"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const FACEBOOK_URL = "https://www.facebook.com/SypOnCafe";

 type PrintRecord = { id: string; printedAt: string; cup: string; drinkName: string; price: string; customerName: string; orderNumber: string; orderDateTime: string; quote: string; note: string; };
const HISTORY_KEY = "sypCupWrapPrintHistoryV1";
const ORDER_COUNTER_KEY = "sypCupWrapNextOrderNumberV1";
const STARTING_CASH_KEY = "sypCupWrapStartingCashV1";

const CUP_MENU = [
  { id: "americano-16", name: "Americano", size: "16oz", price: 69, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "americano-22", name: "Americano", size: "22oz", price: 79, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "spanish-16", name: "Spanish Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "spanish-22", name: "Spanish Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "oreo-16", name: "Oreo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "oreo-22", name: "Oreo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "milo-latte-16", name: "Iced Milo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "milo-latte-22", name: "Iced Milo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "vanilla-16", name: "Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "vanilla-22", name: "Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "french-vanilla-16", name: "French Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "french-vanilla-22", name: "French Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "almond-16", name: "Roasted Almond Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "almond-22", name: "Roasted Almond Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "biscoff-16", name: "Biscoff Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/biscoff-latte.webp" },
  { id: "biscoff-22", name: "Biscoff Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/biscoff-latte.webp" },
  { id: "salted-caramel-16", name: "Salted Caramel", size: "16oz", price: 89, category: "Coffee", image: "/products/caramel-macchiato.webp" },
  { id: "salted-caramel-22", name: "Salted Caramel", size: "22oz", price: 109, category: "Coffee", image: "/products/caramel-macchiato.webp" },

  // Hot Coffee Collection — unified official black SYP cup
  { id: "hot-americano-8", name: "Hot Americano", size: "8oz", price: 49, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-americano-12", name: "Hot Americano", size: "12oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-8", name: "Hot Spanish Latte", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-12", name: "Hot Spanish Latte", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-8", name: "Hot Oreo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-12", name: "Hot Oreo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-8", name: "Hot Milo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-12", name: "Hot Milo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-8", name: "Hot Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-12", name: "Hot Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-8", name: "Hot White Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-12", name: "Hot White Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-8", name: "Hot Roasted Almond Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-12", name: "Hot Roasted Almond Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-8", name: "Hot Biscoff Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-12", name: "Hot Biscoff Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-8", name: "Hot Salted Caramel", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-12", name: "Hot Salted Caramel", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },

  { id: "milo-dino-16", name: "Milo Dino", size: "16oz", price: 79, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "milo-dino-22", name: "Milo Dino", size: "22oz", price: 99, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "oreo-milky-16", name: "Oreo Milky", size: "16oz", price: 79, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "oreo-milky-22", name: "Oreo Milky", size: "22oz", price: 99, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "caramel-macchiato-16", name: "Caramel Macchiato", size: "16oz", price: 99, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "caramel-macchiato-22", name: "Caramel Macchiato", size: "22oz", price: 119, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "white-choco-16", name: "Milky White Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "white-choco-22", name: "Milky White Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "milky-choco-16", name: "Milky Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "milky-choco-22", name: "Milky Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "matcha-16", name: "Matcha Latte", size: "16oz", price: 109, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "matcha-22", name: "Matcha Latte", size: "22oz", price: 129, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "strawberry-matcha-16", name: "Strawberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "strawberry-matcha-22", name: "Strawberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "mango-matcha-16", name: "Mango Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "mango-matcha-22", name: "Mango Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "blueberry-matcha-16", name: "Blueberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "blueberry-matcha-22", name: "Blueberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "biscoff-matcha-16", name: "Biscoff Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "biscoff-matcha-22", name: "Biscoff Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "oreo-matcha-16", name: "Oreo Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/oreo-matcha.webp" },
  { id: "oreo-matcha-22", name: "Oreo Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/oreo-matcha.webp" },

  { id: "green-apple-16", name: "Green Apple", size: "16oz", price: 39, category: "Soda", image: "/products/green-apple.webp" },
  { id: "green-apple-22", name: "Green Apple", size: "22oz", price: 49, category: "Soda", image: "/products/green-apple.webp" },
  { id: "mango-soda-16", name: "Mango", size: "16oz", price: 39, category: "Soda", image: "/products/mango.webp" },
  { id: "mango-soda-22", name: "Mango", size: "22oz", price: 49, category: "Soda", image: "/products/mango.webp" },
  { id: "orange-16", name: "Orange", size: "16oz", price: 39, category: "Soda", image: "/products/orange.webp" },
  { id: "orange-22", name: "Orange", size: "22oz", price: 49, category: "Soda", image: "/products/orange.webp" },
  { id: "strawberry-soda-16", name: "Strawberry", size: "16oz", price: 39, category: "Soda", image: "/products/strawberry.webp" },
  { id: "strawberry-soda-22", name: "Strawberry", size: "22oz", price: 49, category: "Soda", image: "/products/strawberry.webp" },
  { id: "watermelon-16", name: "Watermelon", size: "16oz", price: 39, category: "Soda", image: "/products/watermelon.webp" },
  { id: "watermelon-22", name: "Watermelon", size: "22oz", price: 49, category: "Soda", image: "/products/watermelon.webp" },
  { id: "blueberry-soda-16", name: "Blueberry", size: "16oz", price: 39, category: "Soda", image: "/products/blueberry.webp" },
  { id: "blueberry-soda-22", name: "Blueberry", size: "22oz", price: 49, category: "Soda", image: "/products/blueberry.webp" },
  { id: "peach-16", name: "Peach", size: "16oz", price: 39, category: "Soda", image: "/products/peach.webp" },
  { id: "peach-22", name: "Peach", size: "22oz", price: 49, category: "Soda", image: "/products/peach.webp" },

  { id: "choco-boom-16", name: "SYP Choco Boom", size: "16oz", price: 99, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "choco-boom-22", name: "SYP Choco Boom", size: "22oz", price: 119, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "white-rush-16", name: "SYP White Rush", size: "16oz", price: 99, category: "Signature", image: "/products/syp-white-rush.webp" },
  { id: "white-rush-22", name: "SYP White Rush", size: "22oz", price: 119, category: "Signature", image: "/products/syp-white-rush.webp" },

  { id: "fries-small", name: "SYP Bites", size: "Small", price: 49, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-medium", name: "SYP Cravings", size: "Medium", price: 79, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-barkada", name: "SYP Overload", size: "Barkada", price: 119, category: "Fries", image: "/products/syp-fries.webp" },
] as const;

const QUOTE_STARTS = [
  "Kape muna, ", "Iced coffee kasi ", "Hindi ako tamad, ", "Adulting na naman, ",
  "Puyat pero ", "Walang jowa pero ", "Wallet ko payat, ", "Pahinga saglit, ",
  "Kung stressed ka, ", "Dasurv mo ’to, ", "Bawal sumuko, ", "Ang buhay ay ",
  "Love yourself, ", "Kape ang sagot, ", "Pagod na ang beshie, ", "Trabaho nang trabaho, ",
  "Laban lang, ", "Manifesting na ", "Budget kuno, ", "Sabi ko isa lang, ",
  "Nagtitipid ako, ", "May problema? ", "Hindi lahat ng ", "Kung walang plot twist, ",
  "Lowbat na ako, ", "Puso ko marupok, ", "Minsan kailangan lang ", "Wag kang mag-alala, ",
  "Chill ka lang, ", "Main character ka, ", "Kape muna bago ", "Gising pa rin dahil ",
  "Sana all, ", "Walang forever pero ", "Petsa de peligro, ", "Ang importante, ",
  "Kung pagod ka na, ", "Hindi man mayaman, ", "Self-care muna, ", "Buhay ay maikli, ",
  "Kape ang therapy, ", "May exam bukas, ", "May deadline mamaya, ", "Hindi ako late, ",
  "Sabi ng puso ko, ", "Sabi ng utak ko, ", "Nandito para sa kape, ", "Tambay responsibly, ",
  "Konting sip lang, ", "Kaya pa ’yan, ", "Walang perfect, ", "Laban mga ka-SYP, ",
  "Kalmado lang kunwari, ", "Ngiti muna, ", "Hinga nang malalim, ", "Kapag may sahod, ",
  "Kapag walang sahod, ", "Ang tunay na plot twist, ", "Minsan ang sagot ay ", "Sana kasing tamis ng kape "
];

const QUOTE_ENDINGS = [
  "ang problema, bukas na.", "kape muna bago breakdown.", "pero cute pa rin.", "at least may caffeine.",
  "bahala na si future me.", "ang bills, hindi nawawala.", "pero laban pa rin.", "deserve ko ng extra shot.",
  "hindi kasama sa budget.", "pero masarap ang buhay.", "wag lang maubusan ng yelo.", "kaya natin ’to, besh.",
  "at least may iced coffee.", "sa susunod na sweldo na.", "sana all may pahinga.", "wag lang i-chat ang ex.",
  "pahinga, hindi pagsuko.", "ang importante, may kape.", "puso lang ang walang sukli.", "kaya pala kailangan ng large.",
  "pero order muna tayo.", "hindi bayad ang overthink.", "may free therapy sa bawat sip.", "bukas na ang pagiging productive.",
  "hindi lahat nadadaan sa tulog.", "pero may pag-asa pa.", "kape muna bago desisyon.", "mas okay kapag may kasama.",
  "ang tunay na love language ay fries.", "hindi dapat minamadali ang happiness.", "pero ubos na ang allowance.",
  "pahingi naman ng plot armor.", "sana pati sweldo, extra large.", "pero hindi tayo susuko.", "at least hindi tubig ang order.",
  "wag kalimutang mag-water din.", "konting arte, malaking saya.", "may resibo ang kaligayahan.", "basta may kape, may laban.",
  "hindi lahat ng tahimik ay okay.", "pero okay lang magpahinga.", "ang stress, walang loyalty card.", "ang saya, dagdagan ng pearls.",
  "piliin ang peace at cheese fries.", "hindi kasama ang problema sa refill.", "mas masarap kapag libre—charot.", "puro ka na lang 'next time'.",
  "pero sige, one day at a time.", "ang importante, hindi ka nag-give up.", "may caffeine, may chance.", "hindi ito gastos, investment sa mood.",
  "wag puro seen, mag-reply ka rin.", "pero hindi tayo marupok ngayon.", "sana all may extra income.", "hindi lahat ng tanong kailangan sagutin.",
  "ang tunay na glow-up ay tulog.", "sana may add-to-cart sa sahod.", "pero chill muna tayo tonight.", "kaya order ka na, deserve mo ’yan.",
  "hindi lahat ng desisyon dapat 3AM.", "may bukas pa para magpaka-responsable.", "wag lang maubos ang pasensya.", "basta wag kalimutan ang sarili.",
  "at least may dahilan para ngumiti.", "pero wag kalimutan magbayad, besh.", "sana all may stable na Wi-Fi.", "dahan-dahan lang, hindi karera ang buhay.",
  "may kape na, kulang na lang peace of mind.", "at least masaya ang taste buds.", "ang importante, may pang-order ulit.",
  "pahinga ka rin, hindi ka robot.", "hindi ka weak, kailangan mo lang ng kape.", "kahit sabog, present pa rin.",
  "kung di kaya ngayon, sip muna.", "wag gawing personality ang puyat.", "pero ang saya maging KasYP.",
  "kaya ngumiti ka naman diyan.", "ang budget ay suggestion lang—joke!", "pero wag na nating bilangin ang calories.",
  "sana may promo rin sa responsibilities.", "may bayad ang stress, walang overtime.", "tuloy lang kahit loading ang utak.",
  "ang tunay na flex ay may peace of mind.", "hindi man perfect, at least may caffeine.", "basta masarap, walang debate.",
  "sana pati problema may closing time.", "pwedeng mapagod, bawal mawalan ng kape.", "at least may magandang cup ka.",
  "wag i-overthink ang straw.", "hindi ka nag-iisa, may iced coffee ka.", "small wins count, pati first sip.",
  "ang bukas ay problema ni bukas.", "pero tonight, tambay muna.", "kaya mo ’yan, wag lang walang tulog.",
  "sana lahat ng red flag ay kulay brown sugar.", "mas okay ang mixed feelings kapag mixed coffee.",
  "ang love life ay seasonal, kape ay available.", "kung walang lambing, dagdagan ng whipped cream.",
  "wag i-judge ang order, i-enjoy ang sip.", "hindi lahat ng malaki ay problema—minsan 22oz.",
  "ang tunay na commitment ay bumalik sa SYP.", "at least hindi ka nag-order ng sama ng loob.",
  "kape ang plot twist na deserve mo.", "tama na ang drama, dagdagan ang crema.",
  "kung may problema, upuan muna natin.", "pwedeng magpahinga habang nagcha-charge ang phone.",
  "mas masarap ang buhay kapag may tambayan.", "ang tunay na rich ay may oras mag-chill.",
  "sana ang deadline marunong mag-adjust.", "wag magmadali, natutunaw din ang yelo.",
  "kung walang clue, iced coffee muna.", "hindi lahat ng cravings dapat pigilan.",
  "basta wag lang 'last order' na pala.", "may kape, may kwento, may dahilan bumalik."
];

function getRandomQuote(current = "") {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const start = QUOTE_STARTS[Math.floor(Math.random() * QUOTE_STARTS.length)];
    const ending = QUOTE_ENDINGS[Math.floor(Math.random() * QUOTE_ENDINGS.length)];
    const candidate = start + ending;
    if (candidate !== current) return candidate;
  }
  return QUOTE_STARTS[Math.floor(Math.random() * QUOTE_STARTS.length)] +
    QUOTE_ENDINGS[Math.floor(Math.random() * QUOTE_ENDINGS.length)];
}

export default function CupWrapPage() {
  const [selectedProductId, setSelectedProductId] = useState("spanish-22");
  const [menuSearch, setMenuSearch] = useState("");
  const selectedProduct = CUP_MENU.find((item) => item.id === selectedProductId) ?? CUP_MENU[0];
  const cup = selectedProduct.size;
  const price = String(selectedProduct.price);
  const drinkName = selectedProduct.name;
  const filteredMenu = CUP_MENU.filter((item) => (item.name + " " + item.size).toLowerCase().includes(menuSearch.toLowerCase()));
  const [quote, setQuote] = useState(() => getRandomQuote());
  const [customerName, setCustomerName] = useState("");
  const [optionalNote, setOptionalNote] = useState("");
  const [startingCash, setStartingCash] = useState("0");
  const [orderNumber, setOrderNumber] = useState("001");
  const [printQueue, setPrintQueue] = useState<PrintRecord[]>([]);
  const [orderDateTime, setOrderDateTime] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [showQr, setShowQr] = useState(true);
  const [history, setHistory] = useState<PrintRecord[]>([]);
  const [shiftLabel, setShiftLabel] = useState("Current shift");

  useEffect(() => {
    try {
      const savedCash = window.localStorage.getItem(STARTING_CASH_KEY);
      if (savedCash !== null) setStartingCash(savedCash);
      const saved = window.localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PrintRecord[];
        setHistory(parsed);
        const maxOrder = parsed.reduce((max, item) => Math.max(max, Number(item.orderNumber) || 0), 0);
        const savedNext = Number(window.localStorage.getItem(ORDER_COUNTER_KEY)) || 0;
        const next = Math.max(maxOrder + 1, savedNext || 1);
        setOrderNumber(String(next).padStart(3, "0"));
        window.localStorage.setItem(ORDER_COUNTER_KEY, String(next));
      } else {
        const savedNext = Number(window.localStorage.getItem(ORDER_COUNTER_KEY)) || 1;
        setOrderNumber(String(savedNext).padStart(3, "0"));
      }
    } catch { /* Ignore unavailable or invalid local history. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
    catch { /* Browser storage may be unavailable. */ }
  }, [history]);

  const makePrintRecord = (): PrintRecord => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    printedAt: new Date().toISOString(), cup, drinkName, price,
    customerName: customerName.trim(), orderNumber: orderNumber.trim() || "—",
    orderDateTime, quote: quote.trim(), note: optionalNote.trim(),
  });

  const resetOrderNumber = () => {
    if (!window.confirm("I-reset ang order number sa 001? Hindi nito buburahin ang print history.")) return;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, "1"); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber("001");
  };

  const updateStartingCash = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    setStartingCash(normalized);
    try { window.localStorage.setItem(STARTING_CASH_KEY, normalized); } catch { /* Ignore unavailable storage. */ }
  };

  const recordAndPrint = () => {
    const record = makePrintRecord();
    const next = (Number(orderNumber) || 0) + 1;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, String(next)); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber(String(next).padStart(3, "0"));
    setHistory((previous) => [record, ...previous]);
    setQuote(getRandomQuote(quote));
    window.setTimeout(() => window.print(), 100);
  };

  const addToPrintLayout = () => {
    if (printQueue.length >= 4) {
      window.alert("Maximum 4 wraps per print batch on the current 297mm print layout. Print this batch first, then add more.");
      return;
    }
    setPrintQueue((previous) => [...previous, makePrintRecord()]);
    const next = (Number(orderNumber) || 0) + 1;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, String(next)); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber(String(next).padStart(3, "0"));
    setQuote(getRandomQuote(quote));
  };

  const printQueued = () => {
    if (!printQueue.length) return;
    setHistory((previous) => [...printQueue.slice().reverse(), ...previous]);
    window.setTimeout(() => {
      window.print();
      setPrintQueue([]);
    }, 150);
  };

  const downloadHistory = () => {
    const header = ["Printed at", "Shift", "Cup", "Drink", "Price", "Customer", "Order #", "Order date/time", "Quote"];
    const rows = history.map((item) => [new Date(item.printedAt).toLocaleString("en-PH"), shiftLabel, item.cup, item.drinkName, item.price, item.customerName, item.orderNumber, item.orderDateTime, item.quote]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\\r\\n");
    const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `syp-cup-wrap-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (window.confirm("I-clear ang lahat ng saved print history sa browser na ito? I-export muna ang CSV kung kailangan ng kopya.")) setHistory([]);
  };

  // Starting estimates only: measure the actual cup before printing.
  const wrapLength = cup === "8oz" ? 190 : cup === "12oz" ? 210 : cup === "16oz" ? 230 : cup === "22oz" ? 250 : cup === "Small" ? 190 : cup === "Medium" ? 210 : 250;
  const wrapHeight = 45;
  const qrUrl = useMemo(
    () => "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=" + encodeURIComponent(FACEBOOK_URL),
    [],
  );

  return (
    <main className="wrap-page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: #342317; font-family: Arial, sans-serif; }
        .wrap-page { min-height: 100vh; padding: 22px; }
        .wrap-shell { max-width: 1000px; margin: 0 auto; }
        .wrap-head { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .wrap-head img { width:58px; height:58px; object-fit:contain; border-radius:12px; background:#fff; }
        .wrap-head h1 { margin:0; font-size:clamp(22px,4vw,32px); }
        .wrap-head p { margin:5px 0 0; color:#85664b; font-size:11px; font-weight:800; letter-spacing:.13em; }
        .wrap-grid { display:grid; grid-template-columns:280px minmax(0,1fr); gap:18px; align-items:start; }
        .wrap-panel { background:#fffdf9; border:1px solid #e5d4c1; border-radius:16px; padding:18px; min-width:0; }
        .wrap-panel h2 { font-size:17px; margin:0 0 8px; }
        .wrap-muted { font-size:12px; color:#856f5a; line-height:1.55; }
        .wrap-field { display:grid; gap:7px; margin:14px 0; }
        .wrap-field label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
        .wrap-field select,.wrap-field input { width:100%; border:1px solid #d9c4ac; border-radius:9px; padding:11px; background:white; color:#342317; }
        .wrap-btn { border:0; border-radius:9px; padding:12px 14px; background:#62442e; color:white; font-weight:800; cursor:pointer; }
        .wrap-btn.secondary { background:#eee1d0; color:#62442e; }
        .wrap-preview { overflow-x:auto; padding:14px; background:#e7d8c6; border-radius:12px; }
        .wrap-art { width:100%; min-width:540px; aspect-ratio:250 / 45; display:grid; grid-template-columns:1.05fr 1.05fr 1.1fr .65fr; gap:9px; align-items:center; padding:10px 14px; background:#fff; color:#000; border:2px solid #000; outline:1px solid #000; outline-offset:3px; }
        .wrap-block { height:100%; min-width:0; display:flex; flex-direction:column; justify-content:center; border-right:1px solid #aaa; padding-right:8px; }
        .wrap-script { font-family:Georgia,serif; font-style:italic; font-weight:800; font-size:clamp(14px,2vw,23px); line-height:1.05; }
        .wrap-brand { font-size:clamp(16px,2.5vw,27px); font-weight:900; letter-spacing:.03em; line-height:1; }
        .wrap-tag { font-size:9px; font-weight:800; letter-spacing:.12em; margin-top:5px; }
        .wrap-drink { font-size:clamp(17px,2.5vw,30px); font-weight:900; text-align:center; line-height:1.05; overflow-wrap:anywhere; }
        .wrap-price { font-size:clamp(12px,1.8vw,18px); font-weight:900; text-align:center; margin-top:3px; }
        .wrap-order-meta { font-size:8px; font-weight:800; line-height:1.4; margin-top:5px; overflow-wrap:anywhere; }
        .wrap-quote { font-family:Georgia,serif; font-size:clamp(12px,1.8vw,19px); font-style:italic; font-weight:800; line-height:1.12; }
        .wrap-logo { display:none!important; }
        .wrap-print-logo { display:block; width:34mm; max-width:100%; height:13mm; object-fit:contain; object-position:center; filter:grayscale(1) contrast(2); margin:0 auto 1mm; }
        .wrap-qr { width:54px; height:54px; object-fit:contain; background:white; padding:2px; }
        .wrap-social { font-size:8px; font-weight:800; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-side-date { font-size:7px; font-weight:800; text-align:center; line-height:1.2; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-notes { font-size:12px; line-height:1.55; color:#70553e; }
        @media(max-width:760px) { .wrap-page { padding:12px; } .wrap-grid { grid-template-columns:1fr; } }
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { margin:0!important; padding:0!important; background:white!important; }
          body * { visibility:hidden!important; }
          .wrap-print-target, .wrap-print-target * { visibility:visible!important; }
          .wrap-page { padding:0!important; margin:0!important; }
          .wrap-shell, .wrap-head, .wrap-grid, .wrap-panel { display:block!important; width:80mm!important; max-width:80mm!important; margin:0!important; padding:0!important; border:0!important; background:white!important; }
          .wrap-head, .wrap-controls, .wrap-preview, .wrap-instructions, .wrap-history { display:none!important; }
          .wrap-print-target { display:block!important; position:fixed!important; left:0!important; top:0!important; width:80mm!important; height:297mm!important; overflow:hidden!important; background:#fff!important; }
          .wrap-print-art { position:absolute!important; left:50%!important; top:var(--wrap-top, 50%)!important; width:${wrapLength}mm!important; height:62mm!important; transform-origin:center center!important; transform:translate(-50%,-50%) rotate(90deg)!important; display:grid!important; grid-template-columns:1.05fr 1.05fr 1.1fr .65fr!important; gap:3mm!important; padding:4mm!important; background:#fff!important; color:#000!important; border:1.2mm solid #000!important; outline:0.35mm solid #000!important; outline-offset:1mm!important; print-color-adjust:exact!important; -webkit-print-color-adjust:exact!important; }
          .wrap-print-art .wrap-script { font-size:20pt!important; }
          .wrap-print-art .wrap-brand { font-size:20pt!important; }
          .wrap-print-art .wrap-quote { font-size:17pt!important; }
          .wrap-print-art .wrap-drink { font-size:17pt!important; }
          .wrap-print-art .wrap-price { font-size:12pt!important; font-weight:900!important; text-align:center!important; margin-top:1mm!important; }
          .wrap-print-art .wrap-order-meta { font-size:6pt!important; }
          .wrap-print-art .wrap-logo { display:none!important; }
          .wrap-print-art .wrap-print-logo { width:35mm!important; height:15mm!important; object-fit:contain!important; filter:grayscale(1) contrast(2)!important; margin:0 auto 1mm!important; }
          
          .wrap-print-art .wrap-side-date { font-size:7pt!important; }
          .wrap-print-art .wrap-qr { width:16mm!important; height:16mm!important; }
          .wrap-print-art .wrap-social { font-size:6pt!important; }
          .wrap-print-art .wrap-tag { font-size:8pt!important; }
        }
      `}</style>

      <div className="wrap-shell">
        <header className="wrap-head">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Cup Wrap Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </header>

        <div className="wrap-grid">
          <section className="wrap-panel wrap-controls">
            <h2>Customize cup wrap</h2>
            <p className="wrap-muted">Compact cup wrap for 80mm thermal roll paper. Includes hot 8oz/12oz, price, and a shorter layout. Measure your cup before printing.</p>
            <div className="wrap-field">
              <label htmlFor="menu-search">Search drink from POS menu</label>
              <input id="menu-search" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Type Spanish Latte, Matcha, Hot..." />
            </div>
            <div className="wrap-field">
              <label htmlFor="menu-item">Drink &amp; size — price auto-filled</label>
              <select id="menu-item" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} size={Math.min(7, Math.max(3, filteredMenu.length))} style={{height:"auto",minHeight:48}}>
                {filteredMenu.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.size} — ₱{item.price}</option>)}
              </select>
              <p className="wrap-muted">Selected: <strong>{drinkName} · {cup} — ₱{price}</strong>. Hanapin lang at piliin ang exact size; automatic ang presyo mula sa POS menu list.</p>
            </div>
            <div className="wrap-field">
              <label htmlFor="customer-name">Customer name (optional)</label>
              <input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Alex" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-number">Order number / pang-ilan</label>
              <input id="order-number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.slice(0, 12))} maxLength={12} placeholder="e.g. 001" />
            </div>
            <div className="wrap-field">
              <label htmlFor="optional-note">Optional note</label>
              <input id="optional-note" value={optionalNote} onChange={(e) => setOptionalNote(e.target.value.slice(0, 80))} maxLength={80} placeholder="e.g. less ice, no straw" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-date-time">Order date &amp; time</label>
              <input id="order-date-time" type="datetime-local" value={orderDateTime} onChange={(e) => setOrderDateTime(e.target.value)} />
            </div>
            <div className="wrap-field">
              <label htmlFor="main-quote">Large quote · 1,000+ random Tagalog/Taglish combinations</label>
              <input id="main-quote" value={quote} onChange={(e) => setQuote(e.target.value.slice(0, 120))} maxLength={120} />
              <button type="button" className="wrap-btn secondary" onClick={() => setQuote(getRandomQuote(quote))}>🎲 Random funny quote</button>
              <p className="wrap-muted">Automatic random quote pag-open ng page. Pindutin ulit ang button para sa bagong funny line, o i-edit ang text kung gusto mo.</p>
            </div>
            <div className="wrap-field">
              <label><input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} /> Include Facebook QR</label>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button type="button" className="wrap-btn secondary" onClick={resetOrderNumber}>↺ Reset order number</button>
              <button type="button" className="wrap-btn secondary" onClick={addToPrintLayout} disabled={printQueue.length >= 4}>＋ Add to print layout</button>
              <button type="button" className="wrap-btn" onClick={recordAndPrint}>Print cup wrap + record</button>
            </div>
            <p className="wrap-muted">Nasa print layout: {printQueue.length} wrap(s). Idagdag muna ang bawat drink/quote, pagkatapos pindutin ang Print queued wraps para sabay-sabay.</p>
            <button type="button" className="wrap-btn" onClick={printQueued} disabled={!printQueue.length}>Print queued wraps ({printQueue.length})</button>
            {printQueue.length > 0 && <button type="button" className="wrap-btn secondary" onClick={() => setPrintQueue([])}>Clear print layout</button>}
            <p className="wrap-muted">Print using thermal printer with continuous 80mm paper, portrait feed, and scaling at 100% / Actual size. Test on plain paper first.</p>
          </section>

          <section className="wrap-panel">
            <h2>360° wrap preview · {cup}</h2>
            <p className="wrap-muted">Preview only. Measure your actual cup circumference and wrap height before final printing.</p>
            <div className="wrap-preview">
              <WrapArt quote={quote} showQr={showQr} qrUrl={qrUrl} drinkName={drinkName} price={price} cup={cup} customerName={customerName} orderNumber={orderNumber} orderDateTime={orderDateTime} />
            </div>
            <div className="wrap-instructions wrap-notes">
              <p><strong>Important:</strong> 190mm (8oz), 210mm (12oz), 230mm (16oz), and 250mm (22oz) are starting estimates, not guaranteed fit. Cups vary by brand and taper. Measure around the cup where the strip will sit, then adjust the length in code if needed.</p>
              <p>For ordinary thermal paper, the print will be monochrome (black on paper). The brown/cream color is a design preview; thermal printers do not print brown ink. Use the wrap as a long paper band and secure the ends with tape.</p>
              <p>Facebook destination: <strong>facebook.com/SypOnCafe</strong></p>
            </div>
          </section>
        </div>

          <section className="wrap-panel wrap-history">
            <h2>Print history &amp; shift count</h2>
            <p className="wrap-muted">Bawat pindot sa “Print cup wrap + record” ay idaragdag dito para mabilang sa shift handover.</p>
            <div className="wrap-field">
              <label htmlFor="shift-label">Shift / staff label</label>
              <input id="shift-label" value={shiftLabel} onChange={(e) => setShiftLabel(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Night shift - Alex" />
            </div>
            <div className="wrap-field">
              <label htmlFor="starting-cash">Starting cash drawer (₱)</label>
              <input id="starting-cash" inputMode="decimal" value={startingCash} onChange={(e) => updateStartingCash(e.target.value)} placeholder="e.g. 1000" />
              <p className="wrap-muted">Opening cash na laman ng drawer. Automatic na naka-save sa browser na ito at makikita ulit kapag binuksan ang page sa parehong device.</p>
            </div>
            <div style={{padding:"12px 14px",borderRadius:10,background:"#f4eee5",margin:"12px 0"}}>
              <div className="wrap-muted">SHIFT OPENING CASH</div>
              <strong style={{fontSize:24}}>₱{(Number(startingCash) || 0).toLocaleString("en-PH", {minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",margin:"12px 0"}}>
              <strong>Total recorded prints: {history.length}</strong>
              <button type="button" className="wrap-btn secondary" onClick={downloadHistory} disabled={!history.length}>Export CSV</button>
              <button type="button" className="wrap-btn secondary" onClick={clearHistory} disabled={!history.length}>Clear history</button>
            </div>
            <div className="wrap-muted">Recent prints (latest first)</div>
            {history.length === 0 ? <p className="wrap-muted">Wala pang recorded prints sa browser na ito.</p> : (
              <div style={{overflowX:"auto",marginTop:8}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,textAlign:"left"}}>
                  <thead><tr><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Print time</th><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Order / Drink</th><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Cup</th></tr></thead>
                  <tbody>{history.map((item) => <tr key={item.id}><td style={{padding:8,borderBottom:"1px solid #eee"}}>{new Date(item.printedAt).toLocaleString("en-PH")}</td><td style={{padding:8,borderBottom:"1px solid #eee"}}><strong>#{item.orderNumber}</strong> · {item.drinkName}{item.customerName ? <div className="wrap-muted">{item.customerName}</div> : null}</td><td style={{padding:8,borderBottom:"1px solid #eee"}}>{item.cup}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            <p className="wrap-muted">Note: browser-local history ito. Naka-save sa parehong device/browser lamang; hindi pa ito shared sa ibang cashier/device. Ang record ay ginagawa kapag pinindot ang print button, hindi nito makukumpirma kung lumabas talaga ang papel.</p>
          </section>
        <div className="wrap-print-target" aria-hidden="true">
          {(printQueue.length ? printQueue : [makePrintRecord()]).map((item, index) => <div className="wrap-print-art" key={item.id} style={printQueue.length ? ({"--wrap-top": `${index * 64 + 31}mm`} as CSSProperties) : undefined}>
            <div className="wrap-block">
              <div className="wrap-script">Thanks for<br />Supporting<br />Small Business!</div>
            </div>
            <div className="wrap-block">
              
              <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
              <div className="wrap-tag">STREET • ICED • BREWED</div>
              <div className="wrap-drink">{item.drinkName || "YOUR DRINK"}</div>
              <div className="wrap-price">₱{item.price || "0"} · {item.cup}</div>
              <div className="wrap-order-meta">
                {item.customerName ? <>FOR: {item.customerName}<br /></> : null}
                ORDER #{item.orderNumber || "—"}
                {item.note ? <><br />NOTE: {item.note}</> : null}
              </div>
            </div>
            <div className="wrap-block">
              <div className="wrap-quote">{item.quote || "Good Drinks, Better Days"}</div>
              <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
              <div className="wrap-social">/SypOnCafe</div>
              <div className="wrap-side-date">{item.orderDateTime ? new Date(item.orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
            </div>
          </div>)}
        </div>
      </div>
    </main>
  );
}

function WrapArt({ quote, showQr, qrUrl, drinkName, price, cup, customerName, orderNumber, orderDateTime }: { quote: string; showQr: boolean; qrUrl: string; drinkName: string; price: string; cup: string; customerName: string; orderNumber: string; orderDateTime: string }) {
  return (
    <div className="wrap-art">
      <div className="wrap-block">
        
        <div className="wrap-script">Thanks for<br />Supporting<br />Small Business!</div>
      </div>
      <div className="wrap-block">
        <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
        <div className="wrap-tag">STREET • ICED • BREWED</div>
        <div className="wrap-drink">{drinkName || "YOUR DRINK"}</div>
        <div className="wrap-order-meta">
          {customerName ? <>FOR: {customerName}<br /></> : null}
          ORDER #{orderNumber || "—"}
        </div>
      </div>
      <div className="wrap-block">
        <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
        <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
        <div className="wrap-social">/SypOnCafe</div>
        <div className="wrap-side-date">{orderDateTime ? new Date(orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
      </div>
    </div>
  );
}
