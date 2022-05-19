module.exports = async (bot, message) => {
  try {
    if (!message.content.startsWith("?") || message.author.bot) return;

    const args = message.content.slice(1).split(/ +/g), cmdName = args.shift()?.toLowerCase(), command = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

    if (!command) return;

    if (command.permissions?.length > 0 && !(command.permissions.some(v => message.member.permissions.has(v)))) return message.reply({ content: `You do not have any of the required permissions to use this command, required permissions : ${command.permissions.join(", ")}` })

    command.run(bot, message, args);
  } catch (e) {
    console.log(e);
    message.reply({ content: "There was an issue in executing the command" });
  }
}