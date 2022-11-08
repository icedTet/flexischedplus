//! RENAME THIS FILE TO env.ts
export const env = {
  mongo:
    "mongodb+srv://<username>:<password>@<url>/?retryWrites=true&w=majority", // ! REPLACE THIS WITH YOUR MONGO URL
  port: 443, // ! Replace with desired port, 443 for https default and 80 for http
  webserver: {
    keyPath: "", //Path to HTTPS private key
    certPath: "", //Path to HTTP private key
  }, //Can also be set to null if you don't want to use HTTPS
  
};
