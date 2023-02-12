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

  disconnectClientFromChat = () => {
    this.client.disconnect();
  }

  updateSongList = (songs) => {
    console.log(songs);
    console.log(`Updated ${this.channel}'s songlist`);
    this.songlistData = JSON.parse(JSON.stringify(songs));
  }

  onMessageHandler = (target, context, msg, self) => {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const msgArr = msg.split(' ');
    // Command name [!white-radio] args
    const commandName = msgArr[0];
    // Command name !white-radio [args]
    const commandValue = msgArr[1];
    // Command name !white-radio args1 [args2]
    const commandAmount = msgArr[2] || 1;
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
          this.sendRandomSongsFromGenre(channel, commandValue, commandAmount);
        } else {
          this.client.say(channel, `I dont have music for that genre, sorry :(`);
        }
      } else {
        this.sendRandomSongs(channel, commandAmount);
      }

      console.log(`* Executed ${commandName} command`);
    }
  }
  sendRandomSongs = (channel, amount) => {
    let songs = this.pickRandomAcrossGenres(amount);
    this.handlingSendingSong(channel, songs);
  }
  sendRandomSongsFromGenre = (channel, genre, amount) => {
    let songs = this.pickRandomGenres(genre, amount);
    this.handlingSendingSong(channel, songs);
  }
  handlingSendingSong = (channel, songs) => {
    songs.forEach((song, index) => {
      this.removePickedSong(song);
      setTimeout(() => {
        this.sendingSong(channel, song)
      }, 6000*index);
    })
  }
  sendingSong = (channel, song) => {
    this.client.say(channel, `!sr ${song}`);
  }
  pickRandomAcrossGenres = (amount) => {
    let songlist = [];
    for(let genre in this.songlistData) {
      songlist.push(this.songlistData[genre]);
    }
    return _.sampleSize(_.flattenDeep(songlist).filter((el) => el !== null), amount);
  }

  pickRandomGenres = (genre, amount) => {
    let songlist = [];
    songlist.push(this.songlistData[genre]);
    return _.sampleSize(_.flattenDeep(songlist).filter((el) => el !== null), amount);
  }

  removePickedSong = (song) => {
    for(let genre in this.songlistData) {
      _.remove(this.songlistData[genre], (songs) => { return songs === song})
    }
  }

  onConnectedHandler = (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler = () => {

  }
}


module.exports = {Bot: Bot}
