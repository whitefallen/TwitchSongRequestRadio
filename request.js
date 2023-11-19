fetch("https://api.nightbot.tv/1/song_requests/queue", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": "Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzY2VkNGJmMTA4ZGFiODUwYjhkZTg0OSIsInByb3ZpZGVyIjoidHdpdGNoIiwicHJvdmlkZXJJZCI6IjQwMDU1OTcyIiwicHJvdmlkZXJBY2Nlc3NUb2tlbiI6Ims3ajAycTVvbGNhNGxubmFlams4cmh1dnJxa3drcSIsImlhdCI6MTY3NDQ5OTI2M30.cDe-j0mJj4ixcrQTClW2-Wp8NP0LN-p4rIRKpDFSI20",
    "cache-control": "no-cache",
    "content-type": "application/json;charset=UTF-8",
    "nightbot-channel": "63ce72c8108dab850b356bb2",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "Referer": "https://nightbot.tv/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "{\"q\":\"Spiritbox - Cellar Door\"}",
  "method": "POST"
}).then(response => response.json()).then(data => console.log(data));