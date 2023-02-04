const tmi = require('tmi.js');
const axios = require("axios").default;
// Prepare Channels List
const channels = process.env.CHANNELS.split(',');

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

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const msgArr = msg.split(' ');
  // Command name [!bsr] args
  const commandName = msgArr[0];
  // Command Args !bsr [args]
  const commandArgs = msgArr[1];
  // Get username
  const sender = context.username;
  // Get Channel the command was issued
  const channel = target.substring(1, target.length);

  // If the command is known, let's execute it
  if (commandName === '!white-radio') {
    // save SongRequest
    sendRandomSong(sender, channel);

    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

async function sendRandomSong(username, channel) {
  client.say(channel, `!sr https://www.youtube.com/watch?v=WvmnqWBczHo`);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
