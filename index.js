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
const schedule = require('node-schedule');
var moment = require('moment-timezone');

const createListForChannelIfNotExists = require('./functions').createListForChannelIfNotExists;
const addDefaultRaiderToRaiderListIfNotExist = require('./functions').addDefaultRaiderToRaiderListIfNotExist;
const addDefaultRaiderTallyToTallyListIfNotExist = require('./functions').addDefaultRaiderTallyToTallyListIfNotExist;
const superSay = require('./functions').superSay;

var raiderLists = {};
var tallyLists = {};
var maxCP = {
    'ho-oh':'2222',
    'raikou':'1913',
    'suicune':'1613',
    'entei':'1930',
    'mewtwo':'2275',
    'lugia':'2056',
    'articuno':'1676',
    'zapdos':'1902',
    'moltres':'1870',
    'tyranitar':'2097',
    'snorlax':'1917',
    'lapras':'1487',
    'golem':'1666',
    'victreebel':'1296',
    'poliwrath':'1395',
    'nidoking':'1363',
    'nidoqueen':'1336',
};

client.on('message', (message) => {
    if (message.content === '?help') {
        var helpText = '';
        helpText += '!coming [x2]- mark yourself (or x2) as coming to the raid.\n';
        helpText += '!here - mark yourself as present at the raid.\n';
        helpText += '!notcoming - unmark yourself.\n';
        helpText += '!whocoming - list who is coming or here.\n';
        helpText += '!wholate - list who is coming but not here.\n';
        helpText += '!caught - lets the bot know that the pokemon was caught.\n';
        helpText += '!ran - lets the bot know that the pokemon ran.\n';
        helpText += '!tally - Shows the tally for who caught it or it ran from.\n';
        helpText += '!maxcp pokemon - Shows the Max Encounter CP for raid pokemon.\n';
        message.channel.send(helpText);
    }

    if (/^!coming( x\d)?$/.test(message.content)) {
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

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
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

        raiderLists = createListForChannelIfNotExists(raiderLists, message.channel.id);

        if (!raiderLists[message.channel.id].map(raider => raider.name).includes(message.member.displayName)) {
            message.reply('Okay.');
            return;
        }
        
        raiderLists[message.channel.id].splice(raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName), 1);
        message.reply('Noted.');
    }

    if (message.content === '!here') {
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

        raiderLists = createListForChannelIfNotExists(raiderLists, message.channel.id);
        raiderLists[message.channel.id] = addDefaultRaiderToRaiderListIfNotExist(raiderLists[message.channel.id], message.member.displayName);
        
        raiderLists[message.channel.id][raiderLists[message.channel.id].map(raider => raider.name).indexOf(message.member.displayName)].here = true;
        message.reply('Noted.');
    }

    if (message.content === '!whocoming') {
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

        if (!raiderLists.hasOwnProperty(message.channel.id) || raiderLists[message.channel.id].length == 0) {
            message.channel.send('No one');
            return;
        }

        var raiderCount = raiderLists[message.channel.id].reduce((sum, raider) => sum + raider.count, 0);
        var raiderCountString = '*' + raiderCount + ' Player' + (raiderCount != 1 ? 's' : '') + '*\n';
        var comingList = raiderLists[message.channel.id].reduce((list, raider) => list + raider.name + (raider.count > 1 ? ' *x' + raider.count + '*': '') + (raider.here ? ' - *Here*\n' : '\n'), '');
        message.channel.send(raiderCountString + comingList);
    }

    if (message.content === '!wholate') {
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

        if (!raiderLists.hasOwnProperty(message.channel.id) || raiderLists[message.channel.id].length == 0) {
            message.channel.send('No one');
            return;
        }

        var lateList = raiderLists[message.channel.id].filter(raider => !raider.here);
        if (lateList.length == 0) {
            message.channel.send('Everyone\'s Here.');
            return;
        }

        var lateListString = lateList.reduce((list, raider) => list + raider.name + (raider.count > 1 ? ' *x' + raider.count + '*\n': '\n'), '');
        message.channel.send(lateListString);
    }

    if (/^!caught( x\d)?$/.test(message.content)) {
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

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
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

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
        if (message.channel.name == 'general') {
            message.reply('you should post this in the raid channel');
            return;
        }

        if (!tallyLists.hasOwnProperty(message.channel.id) || tallyLists[message.channel.id].length == 0) {
            message.channel.send('**Tally:** Caught: 0, Ran:0');
            return;
        }

        var caughtCount = tallyLists[message.channel.id].reduce((sum, raider) => sum + raider.caught, 0);
        var ranCount = tallyLists[message.channel.id].reduce((sum, raider) => sum + raider.ran, 0);
        var tallyString = '**Tally:** Caught: ' + caughtCount + ', Ran: ' + ranCount;
        message.channel.send(tallyString);
    }

    if (message.content.startsWith('!maxcp')) {
        var matches = message.content.match(/^!maxcp(.*)$/);
        if (!matches) {
            return;
        }
        var pokemon = matches[1].trim().toLowerCase();
        if (pokemon in maxCP) {
            message.reply(maxCP[pokemon]);
        } else {
            message.channel.send('**Ho-oh** *2222*\n**Raikou** *1913*\n**Suicune** *1613*\n**Entei** *1930*\n**Mewtwo:** *2275*\n**Tyranitar:** *2097*\n**Lugia:** *2056*\n**Snorlax:** *1917*\n**Zapdos:** *1902*\n**Moltres:** *1870*\n**Articuno:** *1676*\n**Lapras:** *1487*');
        }
    }

    var channelsToListenTo = [
        'announcements-north',
        'announcements-south',
    ];
    if (message.author.username == 'GymHuntrBot') {
        if (channelsToListenTo.includes(message.channel.name)) {
            if (message.hasOwnProperty('embeds')) {
                if (message.embeds.length == 0) {
                    return;
                }
                if (!('description' in message.embeds[0])) {
                    return;
                }

                // Egg Mode
                if (/^\*\*(.+)\.\*\*\n\*Raid Starting: (\d+) hours (\d+) min (\d+) sec\*$/.test(message.embeds[0].description)) {
                    var tier = message.embeds[0].title.match(/^Level (\d) Raid is starting soon!$/)[1];
                    var matches = message.embeds[0].description.match(/^\*\*(.+)\.\*\*\n\*Raid Starting: (\d+) hours (\d+) min (\d+) sec\*$/);
                    var gym = matches[1].trim();
                    var startingHours = matches[2];
                    var startingMinutes = matches[3];
                    var startingSeconds = matches[4];
                    var raidStarting = new Date(message.createdTimestamp);

                    raidStarting = moment(raidStarting).add({hours: startingHours, minutes: startingMinutes, seconds: startingSeconds});
                    var raidEnding = moment(raidStarting).add({minutes: 45});
                    var raidStartingString = raidStarting.tz('America/Barbados').format('LT');
                    var raidEndingString = raidEnding.tz('America/Barbados').format('LT');

                    var raidStarted = moment(raidEnding).subtract({hours: 1, minutes: 45});

                    var eggEmbed = new Discord.RichEmbed()
                        .setTitle('Level ' + tier + ' Raid is starting soon!')
                        .setColor(255 + (128*256))
                        .setDescription('**' + gym + '**\n*Raid Starting: ' + raidStartingString + '*' + '\n*Raid Ending: ' + raidEndingString + '*')
                        .setThumbnail(message.embeds[0].thumbnail.url)
                        .setURL(message.embeds[0].url)
                        .setTimestamp();

                    message.guild.channels.find(channel => channel.name == 'announcements').send({embed: eggEmbed}).catch( e => console.error('Message Not Sent', e) );
                }

                // Raid Started
                if (/^\*\*(.+)\.\*\*\n(.+)\nCP: (\d+)\.\n\*Raid Ending: (\d+) hours (\d+) min (\d+) sec\*$/.test(message.embeds[0].description)) {
                    var tier = message.embeds[0].title.match(/^Level (\d) Raid has started!$/)[1];
                    var matches = message.embeds[0].description.match(/^\*\*(.+)\.\*\*\n(.+)\nCP: (\d+)\.\n\*Raid Ending: (\d+) hours (\d+) min (\d+) sec\*$/);
                    var gym = matches[1].trim();
                    var pokemon = matches[2].trim();
                    var cp = matches[3];
                    var endingHours = matches[4];
                    var endingMinutes = matches[5];
                    var endingSeconds = matches[6]; 
                    
                    var raidEnding = new Date(message.createdTimestamp);
                    raidEnding = moment(raidEnding).add({hours: endingHours, minutes: endingMinutes, seconds: endingSeconds});
                    var raidStarted = moment(raidEnding).subtract({hours: 1, minutes: 45});
                    var raidEndingString = raidEnding.tz('America/Barbados').format('LT');

                    var raidEmbed = new Discord.RichEmbed()
                        .setTitle('Level ' + tier + ' Raid has started!')
                        .setColor(255*256)
                        .setDescription('**' + gym + '**\n' + pokemon + '\nCP: ' + cp + '.\n*Raid Ending: ' + raidEndingString + '*')
                        .setThumbnail(message.embeds[0].thumbnail.url)
                        .setURL(message.embeds[0].url)
                        .setTimestamp();

                    message.guild.channels.find(channel => channel.name == 'announcements').send({embed: raidEmbed}).catch(e => console.error('Message Not Sent', e));
                }

            }
        }
    }

    if (message.content.startsWith('!say')) {
        if (message.guild.id != process.env['AUTHORISED_SERVER']) {
            return;
        }

        var matches = message.content.match(/^!say `(.*)`\.`(.*)`(.*)/);
        if (!matches) {
            return;
        }
        var serverToSpeakIn = matches[1];
        var channelToSpeakIn = matches[2];
        var whatToSay = matches[3].trim();

        if (whatToSay == '') {
            return;
        }

        try {
            superSay(client, serverToSpeakIn, channelToSpeakIn, whatToSay);
        } catch (err) {
            message.reply(err.message);
        }
    }
});

client.on('channelCreate', (channel) => {
    superSay(client, channel.guild.name, 'general', `@everyone new raid channel, ${channel}`);
});

client.on('ready', () => {
    console.log('Ready!');
    var j = schedule.scheduleJob('0 0 0 * * 5', () => {
        try {
            superSay(client, 'Pokemon Go Raids Barbados','general', 'Reminder to reactivate GymHuntrBot');
        } catch (err) {
            console.log(err);
        }
    });
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
