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
const createListForChannelIfNotExists = require('./functions').createListForChannelIfNotExists;
const addDefaultRaiderToRaiderListIfNotExist = require('./functions').addDefaultRaiderToRaiderListIfNotExist;
const addDefaultRaiderTallyToTallyListIfNotExist = require('./functions').addDefaultRaiderTallyToTallyListIfNotExist;

var raiderLists = {};
var tallyLists = {};
client.on('message', (message) => {
    if (message.content === '?help') {
        var helpText = '';
        helpText += '!coming [x2]- mark yourself (or x2) as coming to the raid.\n';
        helpText += '!here - mark yourself as present at the raid.\n';
        helpText += '!notcoming - unmark yourself.\n';
        helpText += '!whocoming - list who is coming or here.\n';
        helpText += '!caught - lets the bot know that the pokemon was caught.\n';
        helpText += '!ran - lets the bot know that the pokemon ran.\n';
        helpText += '!tally - Shows the tally for who caught it or it ran from.\n';
        message.channel.send(helpText);
    }

    if (/^!coming( x\d)?$/.test(message.content)) {
        var match = message.content.match(/^!coming x(\d)$/);
        var count = 1;
        if (match != null && match.length == 2) {
            count = parseInt(match[1]);
        }

        if (count == 0) {
            message.reply('If you\'re not coming use !notcoming instead');
            return;
        }

        raiderLists = createListForChannelIfNotExists(raiderLists, message.channel.id);
        raiderLists[message.channel.id] = addDefaultRaiderToRaiderListIfNotExist(raiderLists[message.channel.id], message.member.displayName);
        
        raiderLists[message.channel.id][raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].count = count;
        message.reply('Noted.');
    }

    if (message.content === '!notcoming') {
        raiderLists = createListForChannelIfNotExists(raiderLists, message.channel.id);

        if (!raiderLists[message.channel.id].map(raider => raider.name).includes(message.member.displayName)) {
            message.reply('Okay.');
            return;
        }
        
        raiderLists[message.channel.id].splice(raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName), 1);
        message.reply('Noted.');
    }

    if (message.content === '!here') {
        raiderLists = createListForChannelIfNotExists(raiderLists, message.channel.id);
        raiderLists[message.channel.id] = addDefaultRaiderToRaiderListIfNotExist(raiderLists[message.channel.id], message.member.displayName);
        
        raiderLists[message.channel.id][raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].here = true;
        message.reply('Noted.');
    }

    if (message.content === '!whocoming') {
        if (!raiderLists.hasOwnProperty(message.channel.id) || raiderLists[message.channel.id].length == 0) {
            message.channel.send('No one');
            return;
        }

        var raiderCount = raiderLists[message.channel.id].reduce((sum, raider) => sum + raider.count, 0);
        var raiderCountString = '*' + raiderCount + ' Player' + (raiderCount != 1 ? 's' : '') + '*\n';
        var comingList = raiderLists[message.channel.id].reduce((list, raider) => list + raider.name + (raider.count > 1 ? ' *x' + raider.count + '*': '') + (raider.here ? ' - *Here*\n' : '\n'), '');
        message.channel.send(raiderCountString + comingList);
    }

    if (/^!caught( x\d)?$/.test(message.content)) {
        var match = message.content.match(/^!caught x(\d)$/);
        var count = 1;
        if (match != null && match.length == 2) {
            count = parseInt(match[1]);
        }

        tallyLists = createListForChannelIfNotExists(tallyLists, message.channel.id);
        tallyLists[message.channel.id] = addDefaultRaiderTallyToTallyListIfNotExist(tallyLists[message.channel.id],  message.member.displayName);

        tallyLists[message.channel.id][tallyLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].caught = count;
        message.reply('Congrats' + (count > 0 ? '!'.repeat(count) : '?'));
    }

    if (/^!ran( x\d)?$/.test(message.content)) {
        var match = message.content.match(/^!ran x(\d)$/);
        var count = 1;
        if (match != null && match.length == 2) {
            count = parseInt(match[1]);
        }

        tallyLists = createListForChannelIfNotExists(tallyLists, message.channel.id);
        tallyLists[message.channel.id] = addDefaultRaiderTallyToTallyListIfNotExist(tallyLists[message.channel.id],  message.member.displayName);
        
        tallyLists[message.channel.id][tallyLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].ran = count;
        message.reply('better luck next raid.');
    }

    if (message.content === '!tally') {
        if (!tallyLists.hasOwnProperty(message.channel.id) || tallyLists[message.channel.id].length == 0) {
            message.channel.send('**Tally:** Caught: 0, Ran:0');
            return;
        }

        var caughtCount = tallyLists[message.channel.id].reduce((sum, raider) => sum + raider.caught, 0);
        var ranCount = tallyLists[message.channel.id].reduce((sum, raider) => sum + raider.ran, 0);
        var tallyString = '**Tally:** Caught: ' + caughtCount + ', Ran: ' + ranCount;
        message.channel.send(tallyString);
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
