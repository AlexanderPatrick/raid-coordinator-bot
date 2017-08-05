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
