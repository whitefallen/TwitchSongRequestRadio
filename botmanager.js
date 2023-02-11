const tmi = require('tmi.js');
const axios = require("axios").default;
const _ = require('lodash');
const Bot = require("./bot.js").Bot;
require('dotenv').config()

// Prepare Channels List
let allChannels = process.env.CHANNELS;
let botChannels = [];
let channels = allChannels.includes(',') ? allChannels.split(',') : allChannels;
if(Array.isArray(channels)) {
  botChannels = [...channels];
} else {
  botChannels.push(channels)
}

const songlistDataInitial = require("./songlist.json");
let songListData = songlistDataInitial;

let botInstances = [];
botChannels.forEach((channel) => {
  let pseudoArray = [channel];
  const opts = {
    identity: {
      username: process.env.USERNAME,
      password: process.env.TOKEN
    },
    channels: pseudoArray
  };
  let bot = new Bot(opts, songListData);
  bot.connectClientWithChat();
})
