const tmi = require('tmi.js');
const axios = require("axios").default;
const _ = require('lodash');
let channelsSongArray = [];

// Prepare Channels List
let allChannels = process.env.CHANNELS;
let channels = allChannels.includes(',') ? allChannels.split(',') : allChannels;

const songlistData = require("./songlist.json");

// Define configuration options
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.TOKEN
  },
  channels: channels
};


// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const msgArr = msg.split(' ');
  // Command name [!white-radio] args
  const commandName = msgArr[0];
  // Command name !white-radio [args]
  const commandValue = msgArr[1];
  // Get username
  const sender = context.username;
  // Get Channel the command was issued
  const channel = target.substring(1, target.length);

  const allGenresAvailable = Object.keys(songlistData).filter(key => songlistData[key].length)
  // If the command is known, let's execute it
  if (commandName.startsWith("!") && commandName === '!white-radio') {
    // save SongRequest
    if(commandValue) {
      if(allGenresAvailable.includes(commandValue)) {
        sendRandomSongFromGenre(channel, commandValue);
      } else {
       client.say(channel, `I dont have music for that genre, sorry :(`);
      }
    } else {
      sendRandomSong(channel);
    }

    console.log(`* Executed ${commandName} command`);
  }
}

async function sendRandomSong(channel) {
  let song = pickRandomAcrossGenres();
  client.say(channel, `!sr ${song}`);
}

async function sendRandomSongFromGenre(channel, genre) {
  let song = pickRandomGenres(genre);
  client.say(channel, `!sr ${song}`);
}

function pickRandomAcrossGenres() {
  let songlist = [];
  for(let genre in songlistData) {
    songlist.push(songlistData[genre]);
  }
  return _.sample(_.flattenDeep(songlist).filter((el) => el !== null));
}

function pickRandomGenres(genre) {
  return _.sample(songlistData[genre].filter((el) => el !== null));
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler() {

}
