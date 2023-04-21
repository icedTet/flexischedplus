import express, { NextFunction, Request, Response } from "express";
const server = express();
import https from "https";
import cors from "cors";
import { MongoClient } from "mongodb";

import { env } from "./../env";
import { read, readFileSync, watch } from "fs";
import { lstat, readdir } from "fs/promises";
import { TokenRefresher } from "./utils/TokenRefresher";
declare global {
  var MongoDB: MongoClient | null;
}
export interface RESTHandler {
  path: string;
  method: RESTMethods;
  sendUser: boolean;
  run: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void | Promise<void> | any | Promise<any>;
}
export enum RESTMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}
globalThis.MongoDB = null;
process.env = Object.assign(process.env, env);

/** @type {import('./Helpers/Databases')} */
const MongoConnection = new MongoClient(env.mongo, {});
console.log("Establishing Mongo Connection...");
const importAllHandlers = async (path: string, failedImports: string[]) => {
  await Promise.all(
    (
      await readdir(path)
    ).map(async (file) => {
      console.log(`Importing ${file}`);
      if ((await lstat(`${path}/${file}`)).isDirectory()) {
        console.log(`Importing Folder ${path}/${file}`);
        return await importAllHandlers(`${path}/${file}`, failedImports);
      }
      if (!file.endsWith(".ts") && !file.endsWith(".js")) {
        return;
      }
      import(`${path}/${file}`)
        .then((module) => {
          console.log(`${file} imported`);
          const handler = module.default as RESTHandler;
          if (!handler) {
            return failedImports.push(`${file} is not a REST handler`);
          }
          console.log(handler);
          server[handler.method](handler.path, async (req, res, next) => {
            handler.run(req as Request, res as Response, next);
          });
          console.log(`Loaded ${file}`);
        })
        .catch((err) => {
          console.error(`Failed to import ${file}`);
          console.error(err);
          failedImports.push(`${file} failed to import`);
        });
    })
  );
};

MongoConnection.connect().then(async (db) => {
  //check if "usertokens" collection exists in the database
  console.log("Established Mongo Connection... Running setups");
  const database = await db.db("FlexiSchedMain");
  const collections = await database.listCollections().toArray();
  if (!collections.find((collection) => collection.name === "usertokens")) {
    //create the collection
    console.log("Could not find usertokens collection, creating...");
    await database.createCollection("usertokens");
    //create the hashed index
    await database.collection("usertokens").createIndex({ userID: "hashed" });
    console.log("Created usertokens collection");
  } else {
    console.log("Found usertokens collection");
  }
  TokenRefresher.getInstance();
  globalThis.MongoDB = db;
  server.use(
    cors({
      exposedHeaders: ["filename", "updatedat"],
    })
  );
  server.use(express.json({ limit: "100mb" }));
  const failedImports = [] as string[];
  importAllHandlers(`${__dirname}/RESTAPI`, failedImports).then(() => {
    console.log("Loaded all handlers");
    console.log(
      `${failedImports.length} handlers failed to load`,
      failedImports
    );
  });
  //Import all REST Endpoints

  if (env?.webserver) {
    function readCertsSync() {
      return {
        key: readFileSync(env.webserver?.keyPath),
        cert: readFileSync(env.webserver?.certPath),
      };
    }

    // Refresh httpd's certs when certs change on disk. The timeout stuff
    // "ensures" that all 3 relevant files are updated, and accounts for
    // sometimes trigger-happy fs.watch.

    const httpsServer = https.createServer(readCertsSync(), server);
    httpsServer.listen(env.port, () => {
      console.log(`Listening on port ${env.port}`);
    });
    let waitForCertAndFullChainToGetUpdatedTooTimeout: NodeJS.Timeout;
    watch(env.webserver?.keyPath, () => {
      clearTimeout(waitForCertAndFullChainToGetUpdatedTooTimeout);
      waitForCertAndFullChainToGetUpdatedTooTimeout = setTimeout(() => {
        httpsServer.setSecureContext(readCertsSync());
      }, 5000);
    });
  } else {
    console.log(`HTTP Server running on port ${env.port}`);
    server.listen(env.port, () => {
      console.log(`Listening on port ${env.port}`);
    });
  }
});
process.on("unhandledRejection", (reason, p) => {
  console.trace("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});
// (async ()=>{

//   let msg = await MailTransporter.sendMail({
//     from: '\'Tet from Disadus\' no-reply@disadus.app',
//     to: 'ic3dplasma@gmail.com',
//     subject: '[Disadus] (694200) Verify your email!',
//     text: 'Your security code is 694200. It expires in 15 minutes.',
//   });
//   console.log('Msg sent!');

// })();
