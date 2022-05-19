const Utils = require("../../../struct/Utils.js");
const badges = require("../../models/nerd.js");
const users = require("../../models/user");
const { MessageEmbed } = require("discord.js");
const { hasEmoji } = require('node-emoji');

module.exports.run = async (bot, message, args) => {
  const subcommand = args[0].toLowerCase();


  let name = args[2],
    emoji = args[3],
    id = args[1],
    user = message.mentions.users.first(),
    userData = user ? await users.findOne({ user: user?.id }) || await users.create({ user: user?.id }) : null,
    badge = await badges.findOne({ id });

  if (subcommand === "create") {
    if (!isEmoji(bot, args[2])) return message.reply("Give valid emoji");

    badge = await badges.create({
      id: Utils.genId(8),
      name: args[1],
      emoji: args[2],
      createdAt: Date.now()
    });

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badge Created")
          .setDescription(`Created badge ${badge.name} with emoji ${badge.emoji}`)
          .setColor("#ff8c00")
          .addFields({ name: "ID", value: badge.id }, { name: "Created At", value: badge.createdAt })
      ]
    })
  } else if (subcommand === "edit") {
    if (!badge) return message.reply(":x: Provide valid badge id");

    name = name || badge.name;
    emoji = emoji || badge.emoji;

    if (!isEmoji(bot, args[3])) return message.reply("Give valid emoji");

    badge = await badges.findOneAndUpdate({ id }, { name, emoji, createdAt: Date.now() }, { new: true });

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badge Edited")
          .setDescription(`Edited badge ${badge.name} with emoji ${badge.emoji}`)
          .setColor("#ff8c00")
          .addFields({ name: "ID", value: badge.id }, { name: "Created At", value: badge.createdAt })
      ]
    })
  } else if (subcommand === "delete") {
    if (!badge) return message.reply(":x: Provide valid badge id");

    await badges.findOneAndDelete({ id });

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badge Deleted")
          .setDescription(`Deleted badge ${badge.name} with emoji ${badge.emoji}`)
          .setColor("#ff8c00")
      ]
    })
  } else if (subcommand === "give") {
    if (!badge) return message.reply(":x: Provide valid badge id");

    if (!user) return message.reply(":x: Provide valid user");

    if (userData?.badges?.includes(badge.id)) return message.reply(":x: User already has this badge");

    await users.findOneAndUpdate({ user: message.id }, { $push: { badges: badge.id } });

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badge Given")
          .setDescription(`Gave badge ${badge.name} with emoji ${badge.emoji} to ${user.tag}`)
          .setColor("#ff8c00")
      ]
    })
  } else if (subcommand === "take") {
    if (!badge) return message.reply(":x: Provide valid badge id");
    if (!user) return message.reply(":x: Provide valid user");

    if (!userData?.badges?.includes(badge.id)) return message.reply(":x: User does not have this badge");

    await users.findOneAndDelete({ user: user.id }, { $pull: { badges: badge.id } });

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badge Taken")
          .setDescription(`Took badge ${badge.name} with emoji ${badge.emoji} from ${user.tag}`)
          .setColor("#ff8c00")
      ]
    })

  } else if (subcommand === "list") {
    const badg = await badges.find();

    if (badg.length === 0) return message.reply(":x: No badges found");

    let str = "";

    for (let i = 0; i < badg.length; i++) {
      const bg = badg[i];

      str += `${bot.emojis.cache.get(bg?.emoji)?.toString() || bg?.emoji} **${bg?.name}**\n`
    }

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Badges")
          .setDescription(str)
          .setColor("#ff8c00")
      ]
    })
  }
};

module.exports.data = {
  name: "badge",
};

function isEmoji(bot, emoji) {
  return hasEmoji(emoji) || bot.emojis.cache.get(/\d+/.exec(emoji) + "");
}
