export type MemberReward = {
  id: string;
  title: string;
  description: string;
  status: "available" | "locked" | "claimed";
  claimedAt?: string;
};

export type MemberOrder = {
  id: string;
  name: string;
  detail: string;
  price: number;
  date: string;
};

export type MemberNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

export type MemberProfile = {
  id: string;
  name: string;
  mobile: string;
  birthday: string;
  pin: string;
  stamps: number;
  totalVisits: number;
  rewardsClaimed: number;
  referrals: number;
  joinedAt: string;
  favoriteDrink: string;
  visits: string[];
  orders: MemberOrder[];
  rewards: MemberReward[];
  spinAvailableAt?: string;
  notifications: MemberNotification[];
};

const MEMBERS_KEY = "sypMembersV2";
const SESSION_KEY = "sypMemberSessionV2";

/**
 * Default rewards for members.
 *
 * Welcome Reward was intentionally removed.
 */
function createDefaultRewards(): MemberReward[] {
  return [
    {
      id: "loyalty",
      title: "Loyalty Free Drink",
      description: "Complete 10 stamps to unlock",
      status: "locked",
    },
    {
      id: "birthday",
      title: "Birthday Treat",
      description: "Free drink during your birthday period",
      status: "locked",
    },
  ];
}

const demoMember: MemberProfile = {
  id: "SYP0021",
  name: "Juan Dela Cruz",
  mobile: "09171234567",
  birthday: "1998-07-28",
  pin: "2026",
  stamps: 6,
  totalVisits: 43,
  rewardsClaimed: 4,
  referrals: 3,
  joinedAt: "2026-02-12",
  favoriteDrink: "Spanish Latte",
  visits: [
    "2026-07-02",
    "2026-07-05",
    "2026-07-06",
    "2026-07-09",
    "2026-07-12",
    "2026-07-13",
    "2026-07-16",
    "2026-07-18",
    "2026-07-20",
    "2026-07-22",
    "2026-07-23",
  ],
  orders: [
    {
      id: "ORD-2401",
      name: "Spanish Latte",
      detail: "16oz • Less ice • Cash",
      price: 89,
      date: "2026-07-24T01:24:00+08:00",
    },
    {
      id: "ORD-2348",
      name: "Biscoff Matcha",
      detail: "22oz • Regular sweetness",
      price: 139,
      date: "2026-07-22T23:42:00+08:00",
    },
    {
      id: "ORD-2287",
      name: "Hot Salted Caramel",
      detail: "12oz • Hot",
      price: 99,
      date: "2026-07-20T20:16:00+08:00",
    },
  ],
  rewards: createDefaultRewards(),
  notifications: [
    {
      id: "n1",
      title: "Welcome back, KaSyp!",
      message: "Your member dashboard is ready.",
      date: "2026-07-24T20:00:00+08:00",
      read: false,
    },
    {
      id: "n2",
      title: "4 stamps to go",
      message: "Keep sipping to unlock your next free drink.",
      date: "2026-07-23T21:30:00+08:00",
      read: false,
    },
  ],
};

function canUseStorage() {
  return (
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined"
  );
}

/**
 * Removes obsolete/demo rewards from accounts already saved in localStorage.
 */
function cleanMemberRewards(
  rewards: MemberReward[] | undefined,
): MemberReward[] {
  const safeRewards = Array.isArray(rewards)
    ? rewards
    : createDefaultRewards();

  return safeRewards.filter((reward) => {
    const rewardId = String(reward.id || "").toLowerCase();
    const rewardTitle = String(reward.title || "").toLowerCase();

    return (
      rewardId !== "welcome" &&
      rewardTitle !== "welcome reward"
    );
  });
}

/**
 * Makes old local member records compatible with the current structure.
 */
function normalizeMember(member: MemberProfile): MemberProfile {
  return {
    ...member,
    stamps: Number(member.stamps ?? 0),
    totalVisits: Number(member.totalVisits ?? 0),
    rewardsClaimed: Number(member.rewardsClaimed ?? 0),
    referrals: Number(member.referrals ?? 0),
    favoriteDrink: member.favoriteDrink || "Not selected",
    visits: Array.isArray(member.visits) ? member.visits : [],
    orders: Array.isArray(member.orders) ? member.orders : [],
    rewards: cleanMemberRewards(member.rewards),
    notifications: Array.isArray(member.notifications)
      ? member.notifications
      : [],
  };
}

export function getMembers(): MemberProfile[] {
  if (!canUseStorage()) return [];

  const raw = localStorage.getItem(MEMBERS_KEY);

  if (!raw) {
    const initialMembers = [normalizeMember(demoMember)];

    localStorage.setItem(
      MEMBERS_KEY,
      JSON.stringify(initialMembers),
    );

    return initialMembers;
  }

  try {
    const parsed = JSON.parse(raw) as MemberProfile[];

    if (!Array.isArray(parsed)) {
      const fallbackMembers = [normalizeMember(demoMember)];

      localStorage.setItem(
        MEMBERS_KEY,
        JSON.stringify(fallbackMembers),
      );

      return fallbackMembers;
    }

    const cleanedMembers = parsed.map(normalizeMember);

    // Save again so old Welcome Reward entries are permanently removed.
    localStorage.setItem(
      MEMBERS_KEY,
      JSON.stringify(cleanedMembers),
    );

    return cleanedMembers;
  } catch {
    const fallbackMembers = [normalizeMember(demoMember)];

    localStorage.setItem(
      MEMBERS_KEY,
      JSON.stringify(fallbackMembers),
    );

    return fallbackMembers;
  }
}

export function saveMembers(members: MemberProfile[]) {
  if (!canUseStorage()) return;

  const cleanedMembers = members.map(normalizeMember);

  localStorage.setItem(
    MEMBERS_KEY,
    JSON.stringify(cleanedMembers),
  );
}

export function findMember(
  identity: string,
  pin?: string,
): MemberProfile | undefined {
  const normalized = identity
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  return getMembers().find((member) => {
    const idMatch =
      member.id.toLowerCase() === normalized;

    const mobileMatch =
      member.mobile.replace(/\D/g, "") ===
      normalized.replace(/\D/g, "");

    const pinMatch =
      pin === undefined || member.pin === pin;

    return (idMatch || mobileMatch) && pinMatch;
  });
}

export function createMember(input: {
  name: string;
  mobile: string;
  birthday: string;
  pin: string;
}): MemberProfile {
  const members = getMembers();

  const numericIds = members
    .map((member) =>
      Number(member.id.replace(/\D/g, "")),
    )
    .filter(Number.isFinite);

  const next = Math.max(0, ...numericIds) + 1;

  const member: MemberProfile = {
    id: `SYP${String(next).padStart(4, "0")}`,
    name: input.name.trim(),
    mobile: input.mobile.replace(/\D/g, ""),
    birthday: input.birthday,
    pin: input.pin,
    stamps: 0,
    totalVisits: 0,
    rewardsClaimed: 0,
    referrals: 0,
    joinedAt: new Date().toISOString().slice(0, 10),
    favoriteDrink: "Not selected",
    visits: [],
    orders: [],
    rewards: createDefaultRewards(),
    notifications: [
      {
        id: crypto.randomUUID(),
        title: "Welcome to SYP ON CAFÉ",
        message:
          "Your digital membership is now active.",
        date: new Date().toISOString(),
        read: false,
      },
    ],
  };

  saveMembers([...members, member]);

  return member;
}

export function setMemberSession(memberId: string) {
  if (!canUseStorage()) return;

  localStorage.setItem(SESSION_KEY, memberId);
  localStorage.setItem("sypMemberDemoSession", "1");
}

export function getCurrentMember(): MemberProfile | null {
  if (!canUseStorage()) return null;

  const memberId = localStorage.getItem(SESSION_KEY);

  if (
    !memberId &&
    localStorage.getItem("sypMemberDemoSession")
  ) {
    setMemberSession("SYP0021");

    return (
      getMembers().find(
        (member) => member.id === "SYP0021",
      ) ?? null
    );
  }

  return (
    getMembers().find(
      (member) => member.id === memberId,
    ) ?? null
  );
}

export function updateCurrentMember(
  updater: (member: MemberProfile) => MemberProfile,
): MemberProfile | null {
  const current = getCurrentMember();

  if (!current) return null;

  const members = getMembers();
  const updated = normalizeMember(updater(current));

  saveMembers(
    members.map((member) =>
      member.id === current.id ? updated : member,
    ),
  );

  return updated;
}

export function clearMemberSession() {
  if (!canUseStorage()) return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("sypMemberDemoSession");
}

export function saveCloudMember(input: {
  member_code: string;
  name: string;
  mobile: string;
  birthday: string | null;
  stamps: number;
  total_visits: number;
  favorite_drink: string;
  joined_at: string;
}): MemberProfile {
  const members = getMembers();

  const existing = members.find(
    (member) =>
      member.id === input.member_code ||
      member.mobile === input.mobile,
  );

  const base =
    existing ??
    createMember({
      name: input.name,
      mobile: input.mobile,
      birthday:
        input.birthday ??
        new Date().toISOString().slice(0, 10),
      pin: "cloud",
    });

  const updated: MemberProfile = normalizeMember({
    ...base,
    id: input.member_code,
    name: input.name,
    mobile: input.mobile,
    birthday: input.birthday ?? base.birthday,
    stamps: Number(input.stamps ?? 0),
    totalVisits: Number(input.total_visits ?? 0),
    favoriteDrink:
      input.favorite_drink || base.favoriteDrink,
    joinedAt: input.joined_at
      ? input.joined_at.slice(0, 10)
      : base.joinedAt,

    // Ensures the removed Welcome Reward cannot return after cloud refresh.
    rewards: cleanMemberRewards(base.rewards),
  });

  const latest = getMembers().filter(
    (member) =>
      member.id !== updated.id &&
      member.mobile !== updated.mobile,
  );

  saveMembers([...latest, updated]);

  return updated;
}