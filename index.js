const fs = require('fs');
const Enmap = require('enmap');

const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ],
    allowedMentions: { repliedUser: false }
});

require('dotenv').config();

//Cooldowns
client.cooldowns = new Enmap()

//Attach to client
client.config = require('./config.json');
client.wait = ms => new Promise(resolve => setTimeout(resolve, ms));

//Load modules
if(fs.existsSync('./modules.js')){
    require('./modules.js')(client)
}

//Debug settings
if(client.config.debug.enabled && client.config.debug.guild){
    client.debugMode = true
    client.debugGuild = client.config.debug.guild
}

//Load events
fs.readdir('./events/', (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];

        client.on(eventName, event.bind(null, client));
        console.log(`Event loaded: ${eventName}`);
    });
});

client.commands = new Discord.Collection();
client.ownerCommands = new Discord.Collection();

//Load commands
fs.readdir('./commands/', async (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        let props = require(`./commands/${file}`);
        let commandName = file.split('.')[0];

        client.commands.set(props.info.name, props);
        console.log(`Command loaded: ${props.info.name}`);
    });
});

//Load owner commands
fs.readdir('./ownercommands/', async (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        let props = require(`./ownercommands/${file}`);
        let commandName = file.split('.')[0];

        client.ownerCommands.set(commandName, props);
        console.log(`Owner command loaded: ${commandName}`);
    });
});


//Client Login
try{
    client.login(process.env.TOKEN)
}
catch(error){
    console.log('[Error] Could not login. Please make sure the token is valid.')
    process.exit(1)
}