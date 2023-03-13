const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
const redis = require('redis');
const redisClient = redis.createClient({url:'redis://localhost:6379'});
const bodyParser = require('body-parser');

redisClient.connect();

let data = [];

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  console.log(data);
  res.send('Hello World!')
  redisClient.set('string key', 'Hello World!', redis.print)
})

app.get('/songlist/:id', (req, res) => {
  let id = req.params.id;
  if(data) {
    data.forEach((bot) => {
      if(bot.id === id) {
        res.send(bot.songList);
      } else {
        res.send(`Not Data available for ${id}`);
      }
    })
  }
})

app.post('/songlist', function (req, res) {
  if(req.body.id) {
    data.find((botData) => botData.id = req.body.id).songList = req.body.songList;
  }
  res.end();
});


redisClient.on('error', err => console.log('Redi Client Error', err));



io.on("connection", socket => {
  socket.on("connected", (...args) => {
    console.log(args);
    if(args) {
      data.push({id: args[0], songList: null});
    }
  });
});

httpServer.listen(3000);
// WARNING !!! app.listen(3000); will not work here, as it creates a new HTTP server
