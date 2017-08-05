require('dotenv').config();
var args = require('minimist')(process.argv.slice(2));


// Setting up a webserver to bind to the port so that Heroku doesn't auto terminate
var http = require('http');
http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<h1><center>RaidControllerBot is up!<center></h1>', 'utf-8');
}).listen(process.env['PORT']);


const Discord = require('discord.js');
const client = new Discord.Client();

var raiderLists = {}
client.on('message', (message) => {
    if (message.content === '!coming') {
        if (!raiderLists.hasOwnProperty(message.channel.id)) {
            raiderLists[message.channel.id] = [];
        }

        if (raiderLists[message.channel.id].includes(message.member.displayName)) {
            message.reply('Noted!');
            return;
        }
        
        raiderLists[message.channel.id].push(message.member.displayName);
        message.reply('Noted.');
    }

    if (message.content === '!notcoming') {
        if (!raiderLists.hasOwnProperty(message.channel.id)) {
            raiderLists[message.channel.id] = [];
        }

        if (!raiderLists[message.channel.id].includes(message.member.displayName)) {
            message.reply('Okay.');
            return;
        }
        
        raiderLists[message.channel.id].splice(raiderLists[message.channel.id].indexOf(message.member.displayName), 1);
        message.reply('Noted.');
    }

    if (message.content === '!whocoming') {
        if (!raiderLists.hasOwnProperty(message.channel.id) || raiderLists[message.channel.id].length == 0) {
            message.channel.send('No one');
            return;
        }

        var comingList = raiderLists[message.channel.id].join('\n');
        message.channel.send(comingList);
    }
});

client.on('ready', () => {
  console.log('Ready!');
});

client.login(process.env['DISCORD_BOT_TOKEN'])
.catch(e => {
    console.error(e.message);
    process.exit(1);
});

if (args['test']) {
    setTimeout(
        () => process.exit(0), 
        Number.isInteger(args['test']) ? args['test'] : 1000
    );
}
