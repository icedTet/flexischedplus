import { RESTMethods, RESTHandler } from "../server";
import nfetch from "../utils/FixedNodeFetch";
import { verifyToken } from "../utils/TetLibMini";
import { getDataFromID } from "../utils/TokenLib";

export const FlexiReq = {
  path: "/flexiRequest/*",
  method: RESTMethods.GET,
  run: async (req, res, next) => {
    const path = req.path.replace("/flexiRequest", "");
    const token = req.headers.authorization;
    if (!token || !verifyToken(token)) {
      return res.status(401).send("No token provided/invalid token");
    }
    const tokendata = await getDataFromID(token);
    if (!tokendata) {
      return res.status(401).send("Token not found");
    }
    const baseReqURL = tokendata.dashboardURL.match(/^https?:\/\/[^\/]+/)![0];
    const responseData = await nfetch(`${baseReqURL}${path}`, {
      headers: {
        Cookie: `flexisched_session_id=${tokendata.token}`,
      },
    });
    const resText = await responseData.text();
    if (resText.includes("<title>FlexiSCHED Login</title>")) {
      return res.status(401).send("Outdated token");
    }
    return res.status(responseData.status).send(resText);
  },
} as RESTHandler;
export default FlexiReq;
