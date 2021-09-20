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
client.random = arr => arr[Math.floor(Math.random() * arr.length)]
client.sendError = function (input) {
    if(!input) return
    
    return new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle('Error')
    .setDescription(input)
    .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
}

//Check config configuration
if(client.config){
    //Presence
    if (typeof client.config.presence !== 'object' || Array.isArray(client.config.presence)) {
        console.log('[Config Error] "presence" must be an object')
        process.exit(0)
    }
    //Presence: Activities
    if (typeof client.config.presence.activities !== 'object' || !Array.isArray(client.config.presence.activities)) {
        console.log('[Config Error] "presence.activities" must be an array')
        process.exit(0)
    }
    //Presence: Switch Activity Interval
    if (typeof client.config.presence.switchActivityInterval !== 'number') {
        console.log('[Config Error] "presence.switchActivityInterval" must be an number')
        process.exit(0)
    }
    //Presence: Status
    if (typeof client.config.presence.status !== 'string') {
        console.log('[Config Error] "presence.status" must be an string')
        process.exit(0)
    }

    //Owner
    if (typeof client.config.owner !== 'object' || Array.isArray(client.config.owner)) {
        console.log('[Config Error] "owner" must be an object')
        process.exit(0)
    }
    //Owner: IDs
    if (typeof client.config.owner.ids !== 'object' || !Array.isArray(client.config.owner.ids)) {
        console.log('[Config Error] "owner.ids" must be an array')
        process.exit(0)
    }
    //Owner: Prefix
    if (typeof client.config.owner.prefix !== 'string') {
        console.log('[Config Error] "owner.prefix" must be an string')
        process.exit(0)
    }
}

//Load modules
if(fs.existsSync('./modules.js')){
    require('./modules.js')(client)
}

//Debug settings
if(client.config.debug.enabled && client.config.debug.guild && Number(client.config.debug.guild)){
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