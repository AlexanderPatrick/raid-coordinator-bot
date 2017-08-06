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
    if (message.content === '!help') {
        var helpText = '';
        helpText += '!coming - mark yourself as coming to the raid.\n';
        helpText += '!here - mark yourself as present at the raid.\n';
        helpText += '!notcoming - unmark yourself.\n';
        helpText += '!whocoming - list who is coming or here.\n';
        message.channel.send(helpText);
    }

    if (message.content === '!coming') {
        if (!raiderLists.hasOwnProperty(message.channel.id)) {
            raiderLists[message.channel.id] = [];
        }

        if (raiderLists[message.channel.id].map(raider => raider.name).includes(message.member.displayName)) {
            message.reply('Noted!');
            return;
        }
        
        raiderLists[message.channel.id].push({name: message.member.displayName, here: false});
        message.reply('Noted.');
    }

    if (message.content === '!notcoming') {
        if (!raiderLists.hasOwnProperty(message.channel.id)) {
            raiderLists[message.channel.id] = [];
        }

        if (!raiderLists[message.channel.id].map(raider => raider.name).includes(message.member.displayName)) {
            message.reply('Okay.');
            return;
        }
        
        raiderLists[message.channel.id].splice(raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName), 1);
        message.reply('Noted.');
    }

    if (message.content === '!here') {
        if (!raiderLists.hasOwnProperty(message.channel.id)) {
            raiderLists[message.channel.id] = [];
        }

        if (!raiderLists[message.channel.id].map(raider => raider.name).includes(message.member.displayName)) {
            raiderLists[message.channel.id].push({name: message.member.displayName, here: true});
            message.reply('Noted.');
            return;
        }
        
        raiderLists[message.channel.id][raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].here = true;
        message.reply('Noted.');
    }

    if (message.content === '!whocoming') {
        if (!raiderLists.hasOwnProperty(message.channel.id) || raiderLists[message.channel.id].length == 0) {
            message.channel.send('No one');
            return;
        }

        var comingList = raiderLists[message.channel.id].reduce((list, raider) => list + raider.name + (raider.here ? ' *Here*\n' : '\n'), '');
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
