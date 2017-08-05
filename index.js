require('dotenv').config();
var args = require('minimist')(process.argv.slice(2));

const Discord = require('discord.js');
const client = new Discord.Client();

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