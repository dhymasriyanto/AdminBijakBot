// Express
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// Initialize
var Discord = require("discord.js");
var logger = require("winston");
const ytdl = require("ytdl-core");
var fs = require("fs");
var commandsList = fs.readFileSync("./commands.md", "utf8");
const queue = new Map();
const prefix = "!";
const YouTube = require("discord-youtube-api");

const youtube = new YouTube("AIzaSyDjk5Q6_HjqhQzTcOLSyH5wffvgxOa3TF0");

const newUsers = [];
// async function testAll() {
//   const video1 = await youtube.getVideo(
//     "https://www.youtube.com/watch?v=5NPBIwQyPWE"
//   );
//   const video2 = await youtube.getVideoByID("5NPBIwQyPWE");
//   const video3 = await youtube.searchVideos("big poppa biggie smalls");
//   const videoArray1 = await youtube.getPlaylist("https://www.youtube.com/playlist?list=PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");
//   const videoArray2 = await youtube.getPlaylistByID("PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");
//   console.log(video3);
//   console.log(video1, video2, video3, videoArray1, videoArray2);
// }

// Help commands template
const commandsEmbed = new Discord.MessageEmbed()
  .setTitle("Ini Help!")
  .setColor("#0099ff")
  .setDescription("Pokoknya menu help!")
  .addFields({ name: "List : ", value: commandsList, inline: true })
  .setThumbnail("https://i.imgur.com/mSzUj1E.jpg")
  .setTimestamp()
  .setFooter("admin bijak bot");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true
});
logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client();

bot.on("ready", () => {
  logger.info("Connected");
  logger.info("Logged in as: ");
  logger.info(bot.username + " - (" + bot.id + ")");
  bot.user.setPresence({
    activity: { name: "!help", type: "LISTENING" },
    status: "idle"
  });
});

bot.on("message", async message => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}ping`)) {
    var ping = Date.now() - message.createdTimestamp;
    message.reply("latensi kamu ialah `" + ping + "ms`");
    return;
  } else if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send(commandsEmbed);
    return;
  } else if (message.content.startsWith(`${prefix}play`)) {
    const usermsg = message.content.split(" ");
    var isReady = false;
    if (message.channel.type !== "text") return;

    if (message.member.voice.channel == null) {
      return message.reply("masuk ke voice channel dulu cuk!");
    } else {
      message.member.voice.channel.join().then(async connection => {
        let url = await searchYouTubeAsync(usermsg, message);
        let stream = ytdl(url, { filter: "audioonly" });

        let dispatcher = connection.play(stream);

        dispatcher.on("end", () => message.member.voice.channel.leave());
        isReady = true;
      });
    }
    return;
  } else if(message.content.startsWith(`${prefix}rules`)){
    message.reply("baca <#699427228961865799>!");
  }
  else if(message.content.startsWith(`${prefix}infochannel`)){
    message.reply("baca <#724321926519980092>!");
  }
  else {
    message.reply("ngetik `command` yang bener njir!");
    return;
  }
});

async function searchYouTubeAsync(args, message) {
  var video = await youtube.searchVideos(args.toString().replace(/,/g, " "));
  // console.log(video.url);
  // console.log(typeof String(video.url));
  console.log(video);

  const playEmbed = new Discord.MessageEmbed()
    .setTitle("Ini Musik!")
    .setColor("#0099ff")
    .setDescription("Sedang memutar")
    .addFields({
      name: video.title,
      value: "Durasi " + toTime(video.durationSeconds),
      inline: true
    })
    .setThumbnail("https://img.youtube.com/vi/" + video.id + "/sddefault.jpg")
    .setTimestamp()
    .setFooter("admin bijak bot");
  message.channel.send(playEmbed);

  return String(video.url);
}

function toTime(num) {
  var sec_num = parseInt(num, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

bot.on("guildMemberAdd", member => {
      member.guild.channels.get('699427228961865799').send("Hai! Baca <#699427228961865799> dulu say!"); 
  console.log(member)
});

bot.login(process.env.TOKEN);
