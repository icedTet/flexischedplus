import EventEmitter from "events";
import nfetch from "./FixedNodeFetch";
import {
  UserData,
  deleteEntryFromID,
  getAllEntries,
  getDataFromID,
  setDataFromID,
} from "./TokenLib";
type TokenData = {
  id: string;
  nextPing: number;
};
// Return the index of the token with the earliest nextPing time
const binarySearch = (arr: TokenData[], target: number) => {
  let start = 0;
  let end = arr.length - 1;
  if (end < start || arr[0].nextPing > target) return -1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (arr[mid].nextPing === target || start === end) {
      return mid;
    }
    if (arr[mid].nextPing < target) {
      start = mid + 1;
    }
    if (arr[mid].nextPing > target) {
      end = mid - 1;
    }
  }
  return -1;
};

export class TokenRefresher extends EventEmitter {
  static instance: TokenRefresher;
  static getInstance() {
    if (!TokenRefresher.instance) {
      TokenRefresher.instance = new TokenRefresher();
    }
    return TokenRefresher.instance;
  }
  private constructor() {
    super();
    this.loadTokens().then(() => {
      this.pingLoop();
    });
  }
  tokenQueue: TokenData[] = [];
  queueToken(token: string, nextPing?: number) {
    const next = nextPing || Date.now() + 1000 * 5; //* 60 * 30; // 30 minutes
    this.tokenQueue.push({ id: token, nextPing: next });
    this.emit("tokenQueued", token);
  }
  async loadTokens() {
    await getAllEntries();
    console.log("Loading tokens");
    const tokens = await getAllEntries();
    console.log("Loaded tokens", tokens);
    tokens.forEach((token) => {
      this.queueToken(token.id, 100);
    });
    tokens.forEach((token) => {
      this.queueToken(token.id);
    });
    console.log(`Loaded ${tokens.length} tokens`);
  }
  async pingLoop() {
    while (true) {
      const now = Date.now();
      const toPingIndex = binarySearch(this.tokenQueue, now);
      const toPing = this.tokenQueue.splice(0, toPingIndex + 1);
      for (const token of toPing) {
        try {
          const data = await getDataFromID(token.id);
          if (!data) continue;
          const { token: oldToken, lastPing, dashboardURL } = data;
          if (lastPing > Date.now() + 1000 * 60 * 60 * 24 * 90) continue; // 90 days
          //update token
          const dashbaordReq = await nfetch(dashboardURL, {
            headers: {
              cookie: `flexisched_session_id=${oldToken}`,
            },
          });
          const dashboardHTML = await dashbaordReq.text();
          if (dashboardHTML.includes("<title>FlexiSCHED Login</title>")) {
            deleteEntryFromID(token.id); // token expired
            continue;
          }

          const newToken = dashbaordReq.headers
            .get("set-cookie")
            ?.match(/flexisched_session_id=([^;]+)/)?.[1];
          if (!newToken) continue;
          await setDataFromID(token.id, {
            token: newToken,
          });
          // push token back into queue after 30 minutes
          this.autoSched(data, newToken);
          this.queueToken(token.id);
        } catch (error) {
          console.error(error);
        }
      }
      //if no tokens to ping, wait 30 seconds
      if (toPingIndex === -1)
        await new Promise((r) => setTimeout(r, 1000 * 30));
    }
  }
  async autoSched(data: UserData, token: string) {
    if (data.preferredClass) {
      const origin = data.dashboardURL.match(/https?:\/\/[^/]+/)?.[0];
      const res = await nfetch(`${origin}/clickToSched.php`, {
        method: "POST",
        headers: {
          cookie: `flexisched_session_id=${token}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: `flex=${encodeURIComponent(data.preferredClass)}&day=1&period=1`,
      });
      if (!res.ok) {
        return "Failed to auto sched class";
      }
      return await res.text();
    }
  }
}
