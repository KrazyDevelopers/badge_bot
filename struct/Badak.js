const { Client, Collection } = require("discord.js");
const { readdirSync } = require('fs');
const mongoose = require("mongoose");
const { search } = require("./Utils")
const { join } = require('path');

module.exports = class BadakBot extends Client {
  constructor(props) {
    super({
      intents: 32767,
      allowedMentions: { parse: ["users", "roles"], repliedUser: true },
      partials: ["REACTION", "MESSAGE", "CHANNEL"],
    });

    this.commands = new Collection();
    this.aliases = new Collection();
    this.slash = new Collection();
    this.categories = readdirSync(join(__dirname, "../src/commands"));

    this.prefix = "!";
    this.owners = ["893049022988845086", "723049421021118535"];
  }

  async start(token) {
    this.login(token);

    mongoose.connect("mongodb+srv://doctorcody:testyfreely@testy.dvr09.mongodb.net/?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    // event handler

    readdirSync(join(process.cwd(), "/src/events")).forEach((file) =>
      this.on(file.split(".")[0], (...args) =>
        require(`${process.cwd()}/src/events/${file}`)(this, ...args)
      )
    );

    // command handler

    for (let i = 0; i < this.categories.length; i++) {
      const commands = readdirSync(join(__dirname, `../src/commands/${this.categories[i]}`)).filter(file => file.endsWith(".js"));

      for (let j = 0; j < commands.length; j++) {
        const command = require(`../src/commands/${this.categories[i]}/${commands[j]}`);
        if (!command || !command?.data?.name || typeof (command?.run) !== "function") continue;
        command.category = this.categories[i];
        this.commands.set(command.data.name, command);
      }
    }
  }
};
