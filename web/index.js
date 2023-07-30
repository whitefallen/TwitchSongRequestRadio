const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const redis = require('redis');
const redisClient = redis.createClient({url: 'redis://redis-stack:6379'});
const bodyParser = require('body-parser');
const path = require('path');

const Twig = require("twig")

let data = [];

redisClient.connect();
redisClient.on('error', err => console.log('Redi Client Error', err));

io.on("connection", socket => {
  socket.on("connected", (...args) => {
    if(args) {
      data.push({id: args[0].id, songList: args[0].songList, socketId: socket.id, channel: args[0].channel});
      console.log(`Connection reviced with songlist for channel ${args[0].channel}`);
    }
  });
  socket.on("sending song", (...args) => {
    if(args) {
      redisClient.get(`${args[0].channel}_${args[0].song}`).then((data) => {
        let tempNumb = Number(data);
        tempNumb++
        redisClient.set(`${args[0].channel}_${args[0].song}`, tempNumb);
      });
    }
  })
  socket.on("disconnected-instance", (...args) => {
    data = data.filter((elements) => {return elements.id !== socket.id});
  })
  socket.on("disconnecting", () => {
    data = data.filter((elements) => {return elements.id !== socket.id});
  })
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set("twig options", {
  allowAsync: true, // Allow asynchronous compiling
  strict_variables: false
});

app.get('/', (req, res) => {
  res.render('index.twig', {
    data : data
  });
});

app.get('/songlist/:id', async (req, res) => {
  let id = req.params.id;
  let bot = data.find((botInstance) => botInstance.id === id);
  let songs = null;
  let channel = null;
  let dbData = [];
  if(bot) {
    let dbDataKeys = await redisClient.keys(`${bot.channel[0]}_*`);
    for(const dbKey of dbDataKeys) {
      await redisClient.get(dbKey).then((data) => {
        dbData.push({name: dbKey.split('_')[1], count: data});
      });
    };
    songs = bot.songList
    channel = bot.channel
  }
  res.render('./songs/list.twig', {
    songs,
    channel,
    history:dbData
  })
});

app.post('/songlist', function (req, res) {
  if(req.body.id) {
    data.find((botData) => botData.id = req.body.id).songList = req.body.songList;
    console.log(`Recived songlist for ${req.body.id}`);
  }
  res.end();
});

httpServer.listen(3000);
