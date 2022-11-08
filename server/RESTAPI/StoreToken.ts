import { RESTMethods, RESTHandler } from "../server";
import { verifyToken } from "../utils/TetLibMini";
import { getDataFromID, setDataFromID } from "../utils/TokenLib";
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
    // store db token
    await setDataFromID(token, {
      token: fstoken,
      dashboardURL: url,
      lastPing: Date.now(),
      id: token,
    });
    if (!existing) {
      // queue for ping
      TokenRefresher.getInstance().queueToken(token);
    }
    // queueToken
    return res.status(200).send("Token stored");
  },
} as RESTHandler;
export default StoreToken;
