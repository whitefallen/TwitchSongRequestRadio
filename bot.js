const tmi = require('tmi.js');
const _ = require('lodash');

class Bot {
  constructor(opts, songListData) {
    this.opts = opts;
    this.songlistData = JSON.parse(JSON.stringify(songListData));
    this.client = this.createClient();
    this.channel = opts.channels;
    this.currentChannel = this.channel;
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
    // const sender = context.username;
    // Get Channel the command was issued
    this.currentChannel = target.substring(1, target.length);

    this.radioCommand(commandName, commandValue, commandAmount);

    console.log(`* Executed ${commandName} command`);

  }
  sendRandomSongs = (amount) => {
    let songs = this.pickRandomAcrossGenres(amount);
    this.handlingSendingSong(songs);
  }
  sendRandomSongsFromGenre = (genre, amount) => {
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
    if(cName !== '!white-radio') {
      return;
    }
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
}

module.exports = {Bot: Bot}
