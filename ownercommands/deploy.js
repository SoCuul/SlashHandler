module.exports.run = async (client, message, args, sendError) => {
    //Deploy commands
    console.log('')
    console.log(client.debugMode ? `Deploying commands to: ${client.debugGuild}...` : 'Deploying global commands...')
    let msg = await message.reply(client.debugMode ? `Deploying commands to: ${client.debugGuild}...` : 'Deploying global commands...')

    try{
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
        msg.edit(`✅ Deployed ${client.commands.size} commands!`)
    }
    catch(error){
        msg.edit(`❌ There was an error deploying ${client.commands.size} commands`)
    }
}