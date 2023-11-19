const axios = require("axios").default;
const _ = require('lodash');
const Bot = require("./classes/bot.js").Bot;
const cron = require("node-cron");
require('dotenv').config()

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

const songListDataInitial = require('./../data/songlist.json');
const songListData = songListDataInitial;

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
  return await axios("https://raw.githubusercontent.com/whitefallen/TwitchSongRequestRadio/master/bot/data/songlist.json5");
}
/** "*\/2 * * * *" */
/** "0 6 * * *" **/
cron.schedule('"0 6 * * *', () => {
  let newSongs = updateSongList();
  newSongs.then((res) => {
    updateBotsSongList(res.data);
  })
});

const updateBotsSongList = (newSongList) => {
  botInstances.forEach((instance) => {
    instance.bot.updateSongList(JSON.parse(newSongList));
  })
}
