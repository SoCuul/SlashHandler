const { MessageEmbed } = require('discord.js');
const ms = require('ms');
function truncateString(str, num) {
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + '...'
}

module.exports = async (client, i) => {
    //Filter out non-commands
    if(!i.isCommand()) return

    //Respond to non-guild commands
    if(!i.inGuild()) return i.reply('You can only use commands in servers.')

    //Error Messages
    function sendError(input) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Error')
        .setDescription(input)
        .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
        i.reply({
            embeds: [embed]
        })
    }
  
    //Grab the command data from the client.commands map
    const cmd = client.commands.get(i.commandName)
  
    //If that command doesn't exist, return error
    if(!cmd) return i.reply('That command doesn\'t exist!\nTry running the command again later.')

    //Permissions
    if(cmd.perms){
        if(cmd.perms.user && cmd.perms.user.requirePerm && cmd.perms.user.permType && cmd.perms.user.perm){
            //Check for permission type
            switch(cmd.perms.user.permType.toLowerCase()) {
                case 'rolename':
                    if(!i.member.roles.cache.some(role => role.name === cmd.perms.user.perm.toString())){
                        const embed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Missing Permission')
                        .setDescription(`You must have the **${truncateString(cmd.perms.user.perm, 100)}** role to use this command.`)
                        .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                        return i.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    break;

                case 'roleid':
                    if(!i.member.roles.cache.some(role => role.id === cmd.perms.user.perm.toString())){
                        const embed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Missing Permission')
                        .setDescription(`You must have the role with the id of **${truncateString(cmd.perms.user.perm, 100)}** to use this command.`)
                        .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                        return i.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    break;

                case 'discord':
                    if(!i.member.permissionsIn(i.channel).has(cmd.perms.user.perm.toString())){
                        const embed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Missing Permission')
                        .setDescription(`You must have the **${truncateString(cmd.perms.user.perm, 100)}** permission to use this command.`)
                        .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                        return i.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    break;

                case 'user':
                    if(i.user.id !== cmd.perms.user.perm.toString()){
                        try{
                            let user = await client.users.fetch(cmd.perms.user.perm.toString())

                            const embed = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('Missing Permission')
                            .setDescription(`Only **${user.tag}** can use this command.`)
                            .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                            return i.reply({
                                embeds: [embed],
                                ephemeral: true
                            })
                        }
                        catch(e){
                            const embed = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('Missing Permission')
                            .setDescription(`Only the user with an id of **${truncateString(cmd.perms.user.perm, 100)}** can use this command.`)
                            .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                            return i.reply({
                                embeds: [embed],
                                ephemeral: true
                            })
                        }
                    }
                    break;

                default:
                    break;
            } 
        }
        else if(cmd.perms.bot && cmd.perms.bot.requirePerm && cmd.perms.bot.perms && cmd.perms.bot.perms.length){
            if(!i.guild.me.permissionsIn(i.channel).has(cmd.perms.bot.perms)){
                const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Missing Permission')
                .setDescription(`I\'m missing one of the following permissions:\n\`${truncateString(cmd.perms.bot.perms.join(', '), 200)}\`\nPlease ask a server admin to make sure I have these permissions.`)
                .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                return i.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            }
        }
    }

    //Cooldowns
    if(cmd.cooldown && cmd.cooldown.enabled && cmd.cooldown.type && cmd.cooldown.length && Number(cmd.cooldown.length)){
        if(cmd.cooldown.type === 'user'){
            client.cooldowns.ensure(i.user.id, [], i.guild.id)

            //Check for valid cooldown
            if(client.cooldowns.includes(i.user.id, cmd.info.name, i.guild.id)){
                const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Command Cooldown')
                .setDescription(`You can only run this command every ${ms(cmd.cooldown.length, { long: true })}.`)
                .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                return i.reply({
                    embeds: [embed]
                })
            }
            else{
                //Add to cooldown db
                client.cooldowns.push(i.user.id, cmd.info.name, i.guild.id)

                //Wait for cooldown to finish
                client.wait(cmd.cooldown.length)

                //Remove from cooldown db
                .then(() => client.cooldowns.remove(i.user.id, cmd.info.name, i.guild.id))
            }
        }
        else if(cmd.cooldown.type === 'guild'){
            client.cooldowns.ensure(i.guild.id, [])

            //Check for valid cooldown
            if(client.cooldowns.includes(i.guild.id, cmd.info.name)){
                const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Command Cooldown')
                .setDescription(`This command can only be run every ${ms(cmd.cooldown.length, { long: true })} in this server.`)
                .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
                return i.reply({
                    embeds: [embed]
                })
            }
            else{
                //Add to cooldown db
                client.cooldowns.push(i.guild.id, cmd.info.name)

                //Wait for cooldown to finish
                client.wait(cmd.cooldown.length)

                //Remove from cooldown db
                .then(() => client.cooldowns.remove(i.guild.id, cmd.info.name))
            }
        }
    }
  
    //Run the command
    try{
        await cmd.run(client, i, sendError)
    }
    catch(error){
        //Send embed
        const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Execution Error')
        .setDescription('There was an error running the command.')
        .addField('Error', truncateString(error.toString(), 1021))
        .setTimestamp()
        i.channel.send({
            embeds: [embed]
        })
    }
};