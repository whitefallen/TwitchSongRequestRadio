FROM node:16.3.0-alpine

RUN mkdir -p /app
WORKDIR /app
COPY . /app

RUN npm install

RUN npm install nodemon -g  
RUN npm install pm2 -g 

#ENTRYPOINT ["nodemon","-L","bot.js"]
CMD ["pm2-runtime", "./src/botmanager.js"]
