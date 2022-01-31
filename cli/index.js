#!/usr/bin/env node
import io from "socket.io-client";
import { grey, yellow, green, red } from "btss";
import { createInterface } from "readline";
import { writeFileSync, readFileSync, existsSync } from "fs";

globalThis.log = (str) => console.log(str);
globalThis.error = (str) => {
  throw `${red("[ERROR] ")} ${str}`;
};
let config_path = process.env.HOME + "/.config/postroom.json";

try {
  init(parseArgs(process.argv.splice(2)));
} catch (e) {
  log(e);
  process.exit(1);
}
function init({ words, options }) {
  for (const option in options) {
    switch (option) {
      case "h":
        return help();
      default:
        error("unknown option " + option);
    }
  }

  if (!existsSync(config_path)) resetConfig();
  let config;
  try {
    config = JSON.parse(readFileSync(config_path, "utf-8"));
  } catch (e) {
    error("unable to parse postman.json\n" + e.message);
  }

  if (config.name == "user_name")
    log("set your username in $HOME/.config/postroom.json");
  if (!words[0]) error("no room selected.");
  if (!config.rooms[words[0]]) error(words[0] + " is not defined.");
  return enter(words[0], config.rooms[words[0]], config.name);
}

function resetConfig() {
  const data = readFileSync(new URL("../postroom.json", import.meta.url));
  writeFileSync(config_path, data);
}

function enter(room, host, name) {
  let firstTime = true;
  log(yellow("connecting to " + host));
  setTimeout(() => {
    if (!firstTime) return;
    log(red("could not connect to the server."));
    process.exit(1);
  }, 20000);

  // connect
  const socket = io(host);
  socket.on("connect", () => {
    socket.emit("join", { name });
  });
  socket.on("join", ({ name, members, msgs }) => {
    members = Object.values(members);
    if (firstTime) {
      log(yellow(`${room} | ${members.length} | ${members.join(",")}`));
      for (const msg of msgs) {
        if (!msg.system) log(yellow(`[${msg.name}] `) + msg.text);
        else log(grey(msg.text));
      }
      log(grey("you joined the room."));
      firstTime = false;
    } else {
      log(grey(name + " joined the room."));
    }
  });
  socket.on("msg", ({ online, msg }) => {
    log(yellow(`[${msg.name},${online}] `) + msg.text);
  });
  socket.on("leave", ({ name }) => {
    log(grey(name + " left the room."));
  });

  createInterface({
    input: process.stdin,
    output: process.stdout,
  }).on("line", (text) => socket.emit("msg", { name, text }));
}
function help() {
  log(readFileSync(new URL("../help.txt", import.meta.url), "utf-8"));
}
function parseArgs(args) {
  const options = {};
  const words = [];

  let temp;
  for (const arg of args) {
    if (arg.startsWith("-")) {
      temp = arg.substring(1);
      options[temp] = true;
    } else if (temp) {
      options[temp] = arg;
      temp = null;
    } else {
      words.push(arg);
    }
  }

  return { options, words };
}
