const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const { Octokit, App } = require("octokit");
const dotenv = require('dotenv');
dotenv.config();

const Twig = require("twig");

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: `${process.env.GITHUB_TOKEN}` });

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for

app.set("twig options", {
  allowAsync: true, // Allow asynchronous compiling
  strict_variables: false
});

app.get('/', (req, res) => {
  res.render('index.twig');
});

app.post('/sendToGitHub', (req, res) => {
  const link = req.body.songLink;
  const info = req.body.songInfo;
  const genre = req.body.songGenre;
  octokit.request('POST /repos/{owner}/{repo}/issues', {
    owner: 'whitefallen',
    repo: 'TwitchSongRequestRadio',
    title: `[New Song] ${info}`,
    body: `Genre: ${genre} | Song Link: ${link}`,
    assignees: [
      'whitefallen'
    ],
    labels: [
      'new song'
    ],
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  res.redirect('/');
});


httpServer.listen(3003);