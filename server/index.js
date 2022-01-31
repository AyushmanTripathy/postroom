import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const members = {};
let msgs = [];

io.on("connection", (socket) => {
  socket.on("join", ({ name }) => {
    console.log(name + " joined");
    members[socket.id] = name;
    msgs.push({ system: true, text: `${name} joined the room.` });
    io.emit("join", { name, members, msgs });
  });

  socket.on("msg", (msg) => {
    console.log(msg.name + ": " + msg.text);
    msgs.push(msg);
    if (msgs.length > 10) msgs = msgs.slice(-10);
    const online = Object.values(members).length;
    io.emit("msg", { online, msg });
  });

  socket.on("disconnect", () => {
    io.emit("leave", { name: members[socket.id] });
    msgs.push({ system: true, text: `${members[socket.id]} left the room.` });
    console.log(members[socket.id] + " left");
    delete members[socket.id];
  });
});

server.listen(PORT, () => {
  console.log("listening on " + PORT);
});
