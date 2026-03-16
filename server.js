import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectToDB from "./db/db.js";
import app from "./app.js";
import { initializeSocket } from "./socket.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);

connectToDB();
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));