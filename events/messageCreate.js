const { MessageEmbed } = require('discord.js');
function truncateString(str, num) {
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + '...'
}

module.exports = async (client, message) => {
    //Restrict non-owners
    if (!client.config.owner.ids.includes(message.author.id)) return

    //Check for valid command instance
    if (!message.guild || message.author.bot) return

    //Ignore messages without prefixes
    let prefix = client.config.owner.prefix
    if (!message.content.startsWith(prefix)) return;

    //Get command name/args
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //Error Messages
    function sendError(input, cmd) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Error')
        .setDescription(input)
        .addField('Usage', `\`${prefix}${cmd}\``)
        .setFooter(client.user.username, client.user.avatarURL({ dynamic: true }))
        message.reply({
            embeds: [embed]
        })
    }

    //Grab the command data from the client.ownerCommands map
    const cmd = client.ownerCommands.get(command)
  
    //If that command doesn't exist, return
    if (!cmd) return

    //Run the command
    try {
        await cmd.run(client, message, args, sendError)
    }
    catch (error) {
        //Send embed
        const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Execution Error')
        .setDescription('There was an error running the command.')
        .addField('Error', truncateString(error.toString(), 1021))
        .setTimestamp()
        message.reply({
            embeds: [embed]
        })
    }
};