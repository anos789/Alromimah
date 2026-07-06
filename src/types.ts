export interface BotDeal {
  id: number;
  asset: string;
  pair: string;
  type: "Long" | "Short" | "Mirror";
  leverage: string;
  profit: string;
  amount: number;
}

export interface MexcKeys {
  apiKey: string;
  secretKey: string;
  ipAddress: string;
  verified: boolean;
}

export interface BotState {
  running: boolean;
  mode: "cloud" | "manual";
  lastRewardClaim: number;
  claimedRewardsCount: number;
  claimedRewardsUSDT: number;
  activeDeals: BotDeal[];
  mexcKeys: MexcKeys;
}

export interface NewsAlert {
  title: string;
  content: string;
  source: string;
  impact: "positive" | "negative" | "neutral";
  time: string;
  asset: string;
}

export interface KeystoreDetails {
  filename: string;
  password: string;
  alias: string;
  owner: string;
  orgUnit: string;
  org: string;
  city: string;
  state: string;
  country: string;
  createdDate: string;
  validity: string;
  keySize: string;
  signatureAlgorithm: string;
  base64Snippet: string;
}
