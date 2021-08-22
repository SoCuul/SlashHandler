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

    //Online message
    console.log(`${client.user.tag} is online.`)
    console.log(`${client.guilds.cache.size} servers`)
    console.log(`${client.guilds.cache.reduce((a, c) => a + c.memberCount, 0)} users`)

    //Set first status
    try{
        client.user.setPresence({
            activities: [
                {
                    name: client.config.presence.activity,
                    type: client.config.presence.type
                }
            ]
        })
    }
    catch(error){
        console.log('[Status Error] Could not set status')
    }

    //Set status each hour
    while (true) {
        await client.wait(3600000)

        //Set status
        try{
            client.user.setPresence({
                activities: [
                    {
                        name: client.config.presence.activity,
                        type: client.config.presence.type
                    }
                ]
            })
        }
        catch(error){
            console.log('[Status Error] Could not set status')
        }
    }
};