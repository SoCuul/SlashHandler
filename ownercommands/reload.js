const path = require('path');

module.exports.run = async (client, message, args, sendError) => {
    if (!args[0]) return sendError('Please provide a command to reload.', 'reload <command>')
            
    const commandName = args[0].toLowerCase();
    const command = message.client.commands.get(commandName)

    if (!command) return sendError('Please provide a valid command to reload.', 'reload <command>')

    try {
        let cmdsPath = path.join(path.dirname(require.main.filename) + '/commands/')

        delete require.cache[require.resolve(`${cmdsPath}${commandName}.js`)];

        const newCommand = require(`${cmdsPath}${commandName}.js`);
        client.commands.set(commandName, newCommand);

        message.channel.send(`✅ \`${commandName}\` reloaded successfully`);
    }
    catch (error) {
        message.channel.send(`❌ There was an error reloading \`${commandName}\``);
    }
}