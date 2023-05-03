import { RESTMethods, RESTHandler } from "../server";
import { verifyToken } from "../utils/TetLibMini";
import {
  getDataFromFlexiSchedID,
  getDataFromID,
  setDataFromFlexiSchedID,
  setDataFromID,
} from "../utils/TokenLib";
import { TokenRefresher } from "../utils/TokenRefresher";

export const StoreToken = {
  path: "/storeToken",
  method: RESTMethods.POST,
  run: async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !verifyToken(token)) {
      return res.status(401).send("No token provided");
    }
    const { fstoken, url } = req.body;
    if (!fstoken || !url) {
      return res.status(400).send("Missing token or url");
    }
    // check if token existed
    const existing = await getDataFromID(token);
    if (existing) {
      // check if token is valid
      const req = await fetch(`${existing.dashboardURL}`, {
        headers: {
          Cookie: `flexisched_session_id=${existing.token}`,
        },
      }).then((res) => res.text());
      if (
        !req.includes("<title>FlexiSCHED Login</title>") &&
        !req.includes(
          "Your session has expired. You will be redirected to login."
        )
      ) {
        // token is already valid, ignore request to store
        return res.status(201).send("Token already valid");
      }
    }
    // test if token is valid
    const flexiReq = await fetch(`${url}`, {
      headers: {
        Cookie: `flexisched_session_id=${fstoken}`,
      },
    }).then((res) => res.text());
    if (
      flexiReq.includes("<title>FlexiSCHED Login</title>") ||
      flexiReq.includes(
        "Your session has expired. You will be redirected to login."
      )
    ) {
      return res.status(400).send("Invalid token");
    }
    // token is valid, try and find userID (declared in `id = 'userID'`)
    const userID = flexiReq.match(/id = '([^']+)'/)?.[1];
    if (!userID) {
      return res.status(400).send("Invalid token, no userID found");
    }
    // check if userID already exists
    const existingUser = await getDataFromFlexiSchedID(userID);
    if (existingUser) {
      await setDataFromFlexiSchedID(userID, {
        token: fstoken,
        dashboardURL: url,
        lastPing: Date.now(),
        flexischedUserID: userID,
      });
    } else {
      await setDataFromID(token, {
        token: fstoken,
        dashboardURL: url,
        lastPing: Date.now(),
        id: token,
        flexischedUserID: userID,
      });
    }

    // store db token

    if (!existing) {
      // queue for ping
      TokenRefresher.getInstance().queueToken(token);
    }
    if (existingUser) {
      return res.status(200).json({
        id: existingUser.id,
      });
    }
    return res.status(201).send("Token stored");
  },
} as RESTHandler;
export default StoreToken;
