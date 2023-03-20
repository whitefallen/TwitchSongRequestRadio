const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
const redis = require('redis');
const redisClient = redis.createClient({url:'redis://localhost:6379'});
const bodyParser = require('body-parser');

const Twig = require("twig")

const data = [];

redisClient.connect();
redisClient.on('error', err => console.log('Redi Client Error', err));

//TODO USE TWIG TO RENDER LIST OF ACTIVE INSTANCES; AND SONGS

io.on("connection", socket => {
  socket.on("connected", (...args) => {
    if(args) {
      data.push({id: args[0].id, songList: args[0].songList});
    }
  });
  socket.on("sending song", (...args) => {
    if(args) {
      redisClient.get(args[0]).then((data) => {
        let tempNumb = Number(data);
        tempNumb++
        redisClient.set(args[0], tempNumb);
      });
    }
  })
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set("twig options", {
  allowAsync: true, // Allow asynchronous compiling
  strict_variables: false
});

app.get('/', (req, res) => {
  res.render('index.twig', {
    message : "Hello World"
  });
});

app.get('/songlist/:id', (req, res) => {
  let id = req.params.id;
  let bot = data.find((botInstance) => botInstance.id === id);
  if(bot) {
    res.send(bot.songList);
  } else {
    res.send(`Not Data available for ${id}`);
  }
});

app.post('/songlist', function (req, res) {
  if(req.body.id) {
    data.find((botData) => botData.id = req.body.id).songList = req.body.songList;
  }
  res.end();
});

httpServer.listen(3000);
// WARNING !!! app.listen(3000); will not work here, as it creates a new HTTP server
