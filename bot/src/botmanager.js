const axios = require("axios").default;
const _ = require('lodash');
const Bot = require("./classes/bot.js").Bot;
const cron = require("node-cron");
require('json5/lib/register');
require('dotenv').config()
const JSON5 = require('json5');

// Prepare Channels List
let allChannels = process.env.CHANNELS || "";
let botChannels = [];
let botInstances = [];
let channels = allChannels.includes(',') ? allChannels.split(',') : allChannels;
if(Array.isArray(channels)) {
  botChannels = [...channels];
} else {
  botChannels.push(channels)
}

const songlistDataInitial = require('./../data/songlist.json5');
const songListData = songlistDataInitial;

botChannels.forEach((channel) => {
  let pseudoArray = [channel];
  const opts = {
    identity: {
      username: process.env.USERNAMEBOT,
      password: process.env.TOKENBOT
    },
    channels: pseudoArray
  };
  let bot = new Bot(opts, songListData);
  botInstances.push({bot: bot, channel: channel});
  bot.connectClientWithChat();
})

const updateSongList = async () => {
  return await axios("https://raw.githubusercontent.com/whitefallen/TwitchSongRequestRadio/songs/bot/data/songlist.json5");
}
/** "0 6 * * *" **/
cron.schedule('0 6 * * *', () => {
  let newSongs = updateSongList();
  newSongs.then((res) => {
    updateBotsSongList(res.data);
  })
});

const updateBotsSongList = (newSongList) => {
  botInstances.forEach((instance) => {
    instance.bot.updateSongList(JSON5.parse(newSongList));
  })
}
