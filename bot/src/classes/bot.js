const tmi = require('tmi.js');
const _ = require('lodash');
const io = require("socket.io-client");
const {v4: uuidv4} = require('uuid');
const {default: axios} = require("axios");

class Bot {
  constructor(opts, songListData) {
    this.id = uuidv4();
    this.opts = opts;
    this.songlistData = JSON.parse(JSON.stringify(songListData));
    this.client = this.createClient();
    this.channel = opts.channels;
    this.currentChannel = this.channel;
    this.socket = this.createSocketIoClient();
  }
  createClient = () => {
    const botClient = new tmi.client(this.opts);
    botClient.on('message', this.onMessageHandler);
    botClient.on('connected', this.onConnectedHandler);
    botClient.on('disconnected', this.onDisconnectedHandler);
    return botClient;
  }

  createSocketIoClient = () => {
    const socket = io("http://fallen-web-api:3000");
    socket.on("connect", () => {
      socket.emit("connected", {id: this.id, songList: this.songlistData, channel: this.currentChannel});
    })
    socket.on("disconnect", () => {
      socket.emit("disconnected-instance", {id: this.id});
    })
    return socket;
  }

  connectClientWithChat = () => {
    this.client.connect();
  }

  disconnectClientFromChat = () => {
    this.client.disconnect();
  }

  updateSongList = async (songs) => {
    console.log(`Updated ${this.channel}'s songlist`);
    this.songlistData = JSON.parse(JSON.stringify(songs));
    await reportSongList();
  }

  onMessageHandler = (target, context, msg, self) => {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const msgArr = msg.split(' ');
    // Command name [!white-radio] args
    const commandName = msgArr[0];
    if(commandName !== '!white-radio') {
      return;
    }
    // Command name !white-radio [args]
    const commandValue = msgArr[1] || 1;
    // Command name !white-radio args1 [args2]
    const commandAmount = msgArr[2] || 1;
    // Get username
    // const sender = context.username;
    // Get Channel the command was issued
    this.currentChannel = target.substring(1, target.length);

    this.radioCommand(commandName, commandValue, commandAmount);

  }
  sendRandomSongs = (amount) => {
    if(amount > 5) {
      amount = 5;
    }
    let songs = this.pickRandomAcrossGenres(amount);
    this.handlingSendingSong(songs);
  }
  sendRandomSongsFromGenre = (genre, amount) => {
    if(amount > 5) {
      amount = 5;
    }
    let songs = this.pickRandomGenres(genre, amount);
    this.handlingSendingSong(songs);
  }
  handlingSendingSong = (songs) => {
    songs.forEach((song, index) => {
      this.removePickedSong(song);
      setTimeout(() => {
        this.sendingSong(song)
      }, 6000*index);
    })
  }
  sendingSong = (song) => {
    this.client.say(this.currentChannel, `!sr ${song}`);
    this.reportRequestedSong(song);
    this.reportSongList();
  }

  reportSongList = async () => {
    await axios.post("http://fallen-web-api:3000/songlist", {id: this.id, songList: this.songlistData});
  }
  pickRandomAcrossGenres = (amount) => {
    let songlist = [];
    for(let genre in this.songlistData) {
      songlist.push(this.songlistData[genre]);
    }
    return this.pickSong(songlist, amount);
  }

  pickRandomGenres = (genre, amount) => {
    let songlist = [];
    songlist.push(this.songlistData[genre]);
    return this.pickSong(songlist, amount);
  }

  pickSong = (songlist, amount) => {
    return _.sampleSize(_.flattenDeep(songlist).filter((el) => el !== null), amount)
  }

  removePickedSong = (song) => {
    for(let genre in this.songlistData) {
      _.remove(this.songlistData[genre], (songs) => { return songs === song})
    }
  }

  radioCommand = (cName, cValue, cAmount) => {
    let allGenresAvailable = this.genresInList();
    let cValueParsed = parseInt(cValue) || 1;
    // Wenn keine Zahl dann ist es ein String
    if(isNaN(parseInt(cValue)) && cValue !== undefined) {
      if(cValue === "list") {
        this.client.say(this.currentChannel, `Available categories are ${this.listGenres()}`);
      } else if(allGenresAvailable.includes(cValue)) {
        this.sendRandomSongsFromGenre(cValue, cAmount);
      } else {
        this.client.say(this.currentChannel, `I dont have music for that genre, sorry :(`);
      }
    } else {
      this.sendRandomSongs(cValueParsed);
    }
    console.log(`* Executed ${cName} with ${cValue} and ${cAmount} command`);
  }

  listGenres = () => {
    let allGenresAvailable = this.genresInList();
    let splitedString = _.toString(allGenresAvailable).split(",");
    let templateString = "";
    splitedString.forEach((genre, index) => {
      // check if last element
      if(allGenresAvailable.length-1 === index) {
        templateString = templateString + genre + "("+ this.songlistData[genre].length +")";
      } else {
        templateString = templateString + genre + "("+ this.songlistData[genre].length +"),";
      }

    })
    return templateString;
  }

  genresInList = () => {
    return Object.keys(this.songlistData).filter(key => this.songlistData[key].length);
  }

  onConnectedHandler = (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
  }

  onDisconnectedHandler = () => {

  }

  reportRequestedSong = (song) => {
    this.socket.emit("sending song", {channel: this.channel, song: song});
  }
}

module.exports = {Bot: Bot}
