const tmi = require('tmi.js');
const axios = require("axios").default;
const _ = require('lodash');

class Bot {
  constructor(opts, songListData) {
    this.opts = opts;
    this.songlistData = JSON.parse(JSON.stringify(songListData));
    this.client = this.createClient();
    this.channel = opts.channels;
  }
  createClient = () => {
    const botClient = new tmi.client(this.opts);
    botClient.on('message', this.onMessageHandler);
    botClient.on('connected', this.onConnectedHandler);
    botClient.on('disconnected', this.onDisconnectedHandler);
    return botClient;
  }
  connectClientWithChat = () => {
    this.client.connect();
  }

  onMessageHandler = (target, context, msg, self) => {
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

    const allGenresAvailable = Object.keys(this.songlistData).filter(key => this.songlistData[key].length)
    // If the command is known, let's execute it
    if (commandName.startsWith("!") && commandName === '!white-radio') {
      // save SongRequest
      if(commandValue) {
        if(allGenresAvailable.includes(commandValue)) {
          this.sendRandomSongFromGenre(channel, commandValue);
        } else {
          this.client.say(channel, `I dont have music for that genre, sorry :(`);
        }
      } else {
        this.sendRandomSong(channel);
      }

      console.log(`* Executed ${commandName} command`);
    }
  }
  sendRandomSong = (channel) => {
    let song = this.pickRandomAcrossGenres();
    this.removePickedSong(song);
    this.client.say(channel, `!sr ${song}`);
  }
  sendRandomSongFromGenre = (channel, genre) => {
    let song = this.pickRandomGenres(genre);
    this.removePickedSong(song);
    this.client.say(channel, `!sr ${song}`);
  }
  pickRandomAcrossGenres = () => {
    let songlist = [];
    for(let genre in this.songlistData) {
      songlist.push(this.songlistData[genre]);
    }
    console.log(songlist);
    return _.sample(_.flattenDeep(songlist).filter((el) => el !== null));
  }

  removePickedSong = (song) => {
    for(let genre in this.songlistData) {
      _.remove(this.songlistData[genre], (songs) => { return songs === song})
    }
  }

  pickRandomGenres = (genre) => {
    let songlist = [];
    songlist.push(this.songlistData[genre]);
    return _.sample(_.flattenDeep(songlist).filter((el) => el !== null));
  }
  onConnectedHandler = (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler = () => {

  }
}


module.exports = {Bot: Bot}
