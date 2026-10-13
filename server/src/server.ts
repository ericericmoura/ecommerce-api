import https from "https"
import fs from "fs";
import { app } from "./app.js";

// HTTPS Configuration
const privateKey = fs.readFileSync('certificate/server.key', 'utf8');
const certificate = fs.readFileSync('certificate/server.crt', 'utf8');

var credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
  console.log("App listening on https://localhost:3000.");
})