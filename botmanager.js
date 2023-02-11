const tmi = require('tmi.js');
const axios = require("axios").default;
const _ = require('lodash');
const Bot = require("./bot.js").Bot;
const cron = require("node-cron");
require('dotenv').config()

// Prepare Channels List
let allChannels = process.env.CHANNELS;
let botChannels = [];
let botInstances = [];
let channels = allChannels.includes(',') ? allChannels.split(',') : allChannels;
if(Array.isArray(channels)) {
  botChannels = [...channels];
} else {
  botChannels.push(channels)
}

const songlistDataInitial = require("./songlist.json");
let songListData = songlistDataInitial;

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
  botInstances.push({bot: bot, channel: channel});
  bot.connectClientWithChat();
})

const updateSongList = async () => {
  let response = await axios("https://raw.githubusercontent.com/whitefallen/TwitchSongRequestRadio/master/songlist.json");
  console.log(response);
  return response;
}

cron.schedule('* * * * *', () => {
  updateSongList();
});
