import * as EventEmitter from "events";
import { User } from "../types";
import { fetcher } from "./AuthorizedFetcher";
import { extensionStorage } from "./LocalStorageHelper";
import { Cheerio, load as cload } from "cheerio";

export class UserManager extends EventEmitter {
  static instance: UserManager;
  static getInstance() {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return this.instance;
  }
  private constructor() {
    super();
    this.user = undefined;
    this.loadCached();
    this.getUser();
  }
  user: User | null | undefined;
  async loadCached() {
    const cached = await extensionStorage.get("user");
    if (cached) this.user = cached;
    this.emit("user", this.user);
  }

  async getUser() {
    const origin = await extensionStorage.get("fsorigin");
    const dashboardTxt = await fetcher(`${origin}/dashboard.php`).then((res) =>
      res.text()
    );
    if (dashboardTxt === "Token not found") {
      await extensionStorage.clear();
      globalThis?.window?.location?.reload();
    }
    const name = dashboardTxt?.match(
      /(?:<h1 class="page_heading">Student Schedule for )([^<]+)/
    )?.[1];
    const html = cload(dashboardTxt);

    const groupStrings = html("div.row div.col-6 div.card div.card-block")
      .eq(0)
      .children();
    const groups = [] as string[];
    for (let i = 0; i < groupStrings.length; i++) {
      const group = groupStrings.eq(i).text();
      groups.push(group);
    }
    this.user = {
      ...this.user,
      firstName: name?.match(/(.+?)([^ ]+$)/)?.[1].trim() ?? "Unknown",
      lastName: name?.match(/(.+?)([^ ]+$)/)?.[2].trim() ?? "Unknown",
      groups,
    };

    extensionStorage.set("user", this.user);
    this.emit("user", this.user);
    return this.user;
  }
}
