const path = require('path');
const {promises: fs} = require("fs");
const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const songTitle = getSongTitleFromIssue(process.env.ISSUE_TITLE) ?? 'error';
const songLink = getSongLinkFromIssue(process.env.ISSUE_BODY) ?? 'error';

async function addToDatabase(databaseId, songName, songList,) {
  try {
      await notion.pages.create({
          parent: {
              database_id: databaseId,
          },
          properties: {
              'Name': {
                  type: 'title',
                  title: [
                  {
                      type: 'text',
                      text: {
                          content: songName,
                      },
                  },
                  ],
              },
              'Link' : {
                      type: 'url',
                      url: songList,
                      
              },
          }    
      });
  } catch (error) {
      console.error(error.body);
  }
}

const getSongTitleFromIssue = (issue_title) => {
  return issue_title.substr(issue_title.indexOf('[New Song] '));
}

const getSongLinkFromIssue = (issue_body) => {
  return issue_body.substr(issue_body.indexOf('Song Link: '));
}

async function main() {
  await addToDatabase(databaseId, songTitle, songLink)
}

main();
