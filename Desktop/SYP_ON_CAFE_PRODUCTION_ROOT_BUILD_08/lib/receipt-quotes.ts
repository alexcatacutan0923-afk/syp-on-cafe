export type ReceiptQuote = {
  id: number;
  text: string;
  category: "funny" | "coffee" | "sweet" | "serious" | "late-night" | "seasonal";
};

const openers = [
  "Kape muna",
  "Dahan-dahan lang",
  "One sip at a time",
  "Kapag pagod",
  "Bago magdesisyon",
  "Sa dami ng problema",
  "Hindi ka late",
  "Okay lang mapagod",
  "Adulting check",
  "Good vibes lang",
  "Kapag tahimik ang mundo",
  "Sa bawat higop",
  "Hindi lahat ng bitter",
  "Reminder lang",
  "Ngayong gabi",
  "Bukas ulit",
  "Minsan kailangan mo lang",
  "Kung hindi mo alam ang sagot",
  "Kapag mabigat ang araw",
  "Hindi man perfect ang araw",
  "Small win today",
  "Keep going",
  "Huminga ka muna",
  "Chill lang, KaSYP",
  "Tiwala lang",
  "Kung puyat ka",
  "Kapag cold ang reply",
  "Sa tamang timpla",
  "May dahilan ang lahat",
  "Hindi ka nag-iisa",
  "Kahit traffic ang buhay",
  "Isang paalala",
  "Ngayong may kape ka na",
  "Bawal sumuko",
  "Kung gusto mong gumaan",
  "Kahit anong oras",
  "Sa gitna ng kaguluhan",
  "Kapag walang energy",
  "Hindi kailangan magmadali",
  "SYP says"
];

const closers = [
  "tsaka na ang overthinking.",
  "kaya mo 'yan.",
  "may bukas pa.",
  "hindi lahat kailangang sagutin ngayon.",
  "deserve mo itong pahinga.",
  "ang importante, hindi ka sumuko.",
  "mas okay ang araw kapag may kape.",
  "wag kalimutang ngumiti.",
  "kahit maliit, progress pa rin.",
  "hindi masamang magpahinga.",
  "basta huwag kalimutan ang sukli.",
  "hindi lahat ng problema kailangan ng extra shot.",
  "pero minsan extra shot talaga ang sagot.",
  "masarap ka pa rin kausap, promise.",
  "tulog din kapag may time.",
  "ingat sa pag-uwi.",
  "balik ka ulit, hindi kami galit.",
  "salamat sa pagsuporta sa local.",
  "sana masarap ang ulam mo mamaya.",
  "hindi ka failure, low battery ka lang.",
  "recharge muna bago rumaket ulit.",
  "may free drink din sa dulo ng loyalty card.",
  "one cup closer ka na sa reward.",
  "huwag iwan ang resibo, may QR 'yan.",
  "scan mo ang QR bago mawala sa bulsa.",
  "member ka na ba? Scan mo na.",
  "ang tunay na green flag minsan matcha.",
  "fries are cheaper than therapy, minsan.",
  "hindi ka maarte, specific ka lang.",
  "valid ang feelings mo, pati order mo.",
  "steady lang, hindi karera ang buhay.",
  "today is still worth celebrating.",
  "your future self will thank you.",
  "small steps count.",
  "keep the receipt, keep the memory.",
  "salamat, KaSYP.",
  "see you sa next cup.",
  "hindi official receipt, pero official ang saya.",
  "masaya kami na dumaan ka.",
  "you made a good choice today."
];

const standalone: Omit<ReceiptQuote, "id">[] = [
  { text: "Hindi lahat ng green flag tao. Minsan Matcha.", category: "funny" },
  { text: "Mas okay nang malamig ang kape kaysa cold reply.", category: "funny" },
  { text: "Libre mang mangarap, hindi libre ang extra shot.", category: "funny" },
  { text: "Kung binabasa mo ito, sana hindi pa ubos ang kape mo.", category: "funny" },
  { text: "Hindi ka late. Advanced lang ang oras.", category: "funny" },
  { text: "Sana all paid. Salamat sa payment!", category: "funny" },
  { text: "Tulog ka rin minsan. Concerned lang kami.", category: "late-night" },
  { text: "Alas-dose na? Kape pa rin? Respect.", category: "late-night" },
  { text: "Bawal ma-stress. May kape ka na.", category: "coffee" },
  { text: "Good coffee, good mood, good luck sa adulting.", category: "coffee" },
  { text: "Ang importante, nakapag-kape.", category: "coffee" },
  { text: "Fries before worries.", category: "funny" },
  { text: "Sharing fries is optional. Walang pilitan.", category: "funny" },
  { text: "One more cup won't hurt. Probably.", category: "coffee" },
  { text: "Salamat sa pagdaan. Sana gumaan ang araw mo.", category: "sweet" },
  { text: "Ingat pauwi, KaSYP. Balik ka ulit.", category: "sweet" },
  { text: "Supporting local means more than you think. Salamat.", category: "serious" },
  { text: "You do not have to fix everything tonight.", category: "serious" },
  { text: "Rest is part of progress.", category: "serious" },
  { text: "Small wins are still wins.", category: "serious" },
  { text: "Hindi lahat ng araw magaan, pero hindi ka nag-iisa.", category: "serious" },
  { text: "May mga araw na sapat nang bumangon ka.", category: "serious" },
  { text: "Hindi kailangang mabilis. Kailangan lang tuloy.", category: "serious" },
  { text: "Kapag pagod, pahinga. Hindi pagsuko.", category: "serious" },
  { text: "Sana masarap ang ulam mo at mabilis ang Wi-Fi mo.", category: "funny" },
  { text: "Congratulations! May resibo ka na.", category: "funny" },
  { text: "Huwag itapon agad. Malay mo, collectible.", category: "funny" },
  { text: "Smile. Hindi ka namin nakikita, pero smile pa rin.", category: "funny" },
  { text: "Mas mahalaga ka kaysa total ng order mo.", category: "sweet" },
  { text: "Hindi lahat ng bitter coffee. Minsan experience.", category: "funny" },
];

function categoryFor(index: number): ReceiptQuote["category"] {
  if (index % 11 === 0) return "serious";
  if (index % 7 === 0) return "sweet";
  if (index % 5 === 0) return "late-night";
  if (index % 3 === 0) return "coffee";
  return "funny";
}

export const receiptQuotes: ReceiptQuote[] = [
  ...standalone.map((quote, index) => ({ ...quote, id: index + 1 })),
  ...openers.flatMap((opener, openerIndex) => closers.map((closer, closerIndex) => ({
    id: standalone.length + openerIndex * closers.length + closerIndex + 1,
    text: `${opener}, ${closer}`,
    category: categoryFor(openerIndex * closers.length + closerIndex),
  }))),
];

export type SeasonalReceiptTheme = {
  key: string;
  title: string;
  message: string;
  quoteBoost: string[];
};

export function getSeasonalReceiptTheme(date = new Date()): SeasonalReceiptTheme | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 1) return { key: "new-year", title: "NEW YEAR, NEW SYP", message: "Bagong taon, bagong cups to collect.", quoteBoost: ["New year, same favorite coffee.", "Start small. Sip first."] };
  if (month === 2) return { key: "valentines", title: "LOVE BREWS HERE", message: "Kape ang consistent. Promise.", quoteBoost: ["Sana all mainit, tulad ng kape.", "Love yourself. Order what you like."] };
  if (month === 3 || month === 4 || month === 5) return { key: "summer", title: "SYP INTO SUMMER", message: "Stay cool. Stay caffeinated.", quoteBoost: ["Mainit ang panahon, chill ang cup.", "Summer body? Coffee body muna."] };
  if (month === 6 || month === 8 || month === 9) return { key: "rainy", title: "RAINY NIGHT, COZY SYP", message: "Ingat sa ulan, KaSYP.", quoteBoost: ["Rainy weather hits different with coffee.", "Ulan lang 'yan. May kape ka."] };
  if (month === 7 && day >= 7 && day <= 15) return { key: "anniversary", title: "SYP ANNIVERSARY WEEK", message: "Salamat sa bawat cup at tambay.", quoteBoost: ["Another year, another thousand cups.", "Kasama ka sa kuwento ng SYP."] };
  if (month === 10) return { key: "halloween", title: "SPOOKY SYP SEASON", message: "Mas nakakatakot ang walang kape.", quoteBoost: ["No coffee? Scary.", "Boo! May loyalty stamp ka na ba?"] };
  if (month === 11) return { key: "thank-you", title: "THANK YOU, KASYP", message: "Local support keeps us brewing.", quoteBoost: ["Grateful for every order.", "Salamat sa paulit-ulit na pagbabalik."] };
  if (month === 12) return { key: "christmas", title: "MERRY SYP-MAS", message: "Warm wishes, cold drinks, happy hearts.", quoteBoost: ["Mas masaya ang Pasko may kape.", "Gift yourself a good cup."] };
  return null;
}

const HISTORY_KEY = "syp.receipt.quote.history.v1";

export function chooseReceiptQuote(date = new Date()): ReceiptQuote {
  const theme = getSeasonalReceiptTheme(date);
  const seasonal = theme?.quoteBoost.map((text, index) => ({
    id: receiptQuotes.length + index + 1,
    text,
    category: "seasonal" as const,
  })) ?? [];
  const pool = [...receiptQuotes, ...seasonal];

  let history: number[] = [];
  try {
    history = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const recent = new Set(history.slice(-180));
  const available = pool.filter((quote) => !recent.has(quote.id));
  const candidates = available.length ? available : pool;
  const selected = candidates[Math.floor(Math.random() * candidates.length)] ?? receiptQuotes[0];

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([...history.slice(-179), selected.id]));
  } catch {
    // Receipt still prints even when browser storage is unavailable.
  }

  return selected;
}
