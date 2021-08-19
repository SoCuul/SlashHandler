module.exports = async (client) => {
    //Deploy commands
    console.log('')
    console.log(client.debugMode ? `Deploying commands to: ${client.debugGuild}...` : 'Deploying global commands...')

    //Deploy debug guild commands
    if(client.debugMode){
        let guild = await client.guilds.fetch(client.debugGuild)
        await guild.commands.set(client.commands.map(command => command.info))
    }
    //Deploy global commands
    else{
        await client.application?.commands.set(client.commands.map(command => command.info))
    }

    console.log(`Deployed ${client.commands.size} commands!`)

    //Send logged in messaged
    console.log(`Bot is online.`);
};