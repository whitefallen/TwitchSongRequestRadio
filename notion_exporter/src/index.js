const path = require('path');
const {promises: fs} = require("fs");
const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function getFromDatabase(client, databaseId) {
  try {
    let results = [];
    const response = await notion.databases.query({
        database_id: databaseId,
    });
    response.results.forEach((page) => {
      //console.log(page.properties);
    })
    results = [...results, ...response.results];

    // while loop variables
    let hasMore = response.has_more
    let nextCursor = response.next_cursor

    // keep fetching while there are more results
    while (hasMore) {
      const response = await client.databases.query({
        database_id: databaseId,
        start_cursor: nextCursor,
      })
      results = [...results, ...response.results]
      hasMore = response.has_more
      nextCursor = response.next_cursor
    }
    return results
  } catch (error) {
      console.error(error.body);
  }
}

async function main() {
  const data = await getFromDatabase(notion, databaseId)
  const firstDataItem = data[0]
  const normalizedData = data.map((item) => normalizeDataItem(item))
  //console.log(JSON.stringify(firstDataItem.properties, null, 2))
  const normalizedDataSorted = normalizedData.reduce((group, song) => {
    const { genre } = song;
    group[genre] = group[genre] ?? [];
    group[genre].push(song);
    return group;
  }, {});
  await fs.writeFile("../songlist.json5", JSON.stringify(normalizedDataSorted,null, 2));
}

function normalizeDataItem(item) {
  const { Genre, Link, Name} = item.properties

  return {
    link: Link.url,
    genre: Genre.select.name,
    title: Name.title[0]?.plain_text ?? '',
  }
}

main();
