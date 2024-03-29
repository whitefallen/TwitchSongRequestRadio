const path = require('path');
const {promises: fs} = require("fs");
const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();

const getSongTitleFromIssue = (issue_title) => {
  return issue_title.split('[New Song] ')[1];
}

const getSongLinkFromIssue = (issue_body) => {
  return issue_body.split('Song Link: ')[1];
}
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



async function main() {
  await addToDatabase(databaseId, songTitle, songLink)
}

main();
