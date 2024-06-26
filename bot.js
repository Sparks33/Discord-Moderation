const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const config = require("./config.json");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.ThreadMember,
  ],
});

bot.once("ready", () => {
  console.log("Loaded up!");
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "help") {
    const helpEmbed = new EmbedBuilder()
      .setTitle(`${bot.user.username}'s commands`)
      .setDescription(`**Prefix:** ${config.prefix}`)
      .addFields({ name: "`ping`", value: "Check your bot's ping" })
      .addFields({
        name: "`kick`",
        value: `Usage: **${config.prefix}kick [@User]**\n**${config.prefix}kick [@User][Reason]**`,
        inline: true,
      })
      .addFields({
        name: "`ban`",
        value: `Usage: **${config.prefix}ban [@User]**\n**${config.prefix}ban [@User][Reason]**`,
        inline: true,
      })
      .addFields({
        name: "`add`",
        value: `Adds a role to a user \nUsage: **${config.prefix}add [@User] [Role]**`,
        inline: true,
      })
      .addFields({
        name: "`remove`",
        value: `Removes a role from a user \nUsage: **${config.prefix}remove [@User] [Role]**`,
        inline: true,
      })
      .addFields({
        name: "`purge`",
        value: `Clears a number of messages between 2 or 100 \nUsage: **${config.prefix}purge [number]**`,
        inline: true,
      })
      .addFields({
        name: "`rps`",
        value: "Play rock paper scissors",
        inline: true,
      })
      .addFields({
        name: "`say`",
        value: "Have the bot say something",
        inline: true,
      });
    message.channel.send({ embeds: [helpEmbed] });
  }

  if (command === "ping") {
    message.channel.send(
      `Pong **(${Date.now() - message.createdTimestamp}ms)**`
    );
  }

  if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.channel
        .send("Insufficient permissions (Requires permission `Kick members`)")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel
        .send("You have not mentioned a user")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    if (!member.kickable)
      return message.channel.send("This user is unkickable").then((msg) => {
        setTimeout(() => msg.delete(), 30000);
      });
    const reason = args.slice(1).join(" ");
    if (member) {
      if (!reason)
        return member.kick().then((member) => {
          message.channel.send(
            `${member.user.tag} was kicked, no reason was provided`
          );
        });

      if (reason)
        return member.kick(reason).then((member) => {
          message.channel.send(`${member.user.tag} was kicked for ${reason}`);
        });
    }
  }

  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.channel
        .send("Insufficient permissions (Requires permission `Ban members`)")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel
        .send("You have not mentioned a user")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    if (!member.bannable)
      return message.channel.send("This user is unbannable").then((msg) => {
        setTimeout(() => msg.delete(), 30000);
      });
    const reason = args.slice(1).join(" ");
    if (member) {
      if (!reason)
        return member.ban().then((member) => {
          message.channel.send(
            `${member.user.tag} was banned, no reason was provided`
          );
        });

      if (reason)
        return member.ban({ reason }).then((member) => {
          message.channel.send(`${member.user.tag} was banned for ${reason}`);
        });
    }
  }

  if (command === "add") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.channel
        .send("Insufficient permissions (Requires permission `Manage roles`)")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    const member = message.mentions.members.first();
    if (!member)
      return message.channel
        .send("You have not mentioned a user")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    const roleArg = args[1];
    if (!roleArg)
      return message.channel
        .send("You have not specified a role")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    let roleAdd;

    // Check if role is mentioned
    if (roleArg.startsWith("<@&") && roleArg.endsWith(">")) {
      const roleId = roleArg.slice(3, -1);
      roleAdd = message.guild.roles.cache.get(roleId);
    } else {
      // Check if role is specified by name
      const roleName = args.slice(1).join(" ");
      roleAdd = message.guild.roles.cache.find(
        (role) => role.name === roleName
      );
    }

    if (!roleAdd)
      return message.channel
        .send(`The role "${roleArg}" does not exist`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    if (member.roles.cache.has(roleAdd.id))
      return message.channel
        .send(`This user already has the "${roleAdd.name}" role`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    member.roles
      .add(roleAdd)
      .then(() => {
        message.channel.send(
          `The role "${roleAdd.name}" has been added to ${member.displayName}`
        );
      })
      .catch((error) => {
        console.error(`Failed to add role: ${error}`);
        message.channel.send(
          `There was an error adding the role. Please check my permissions and try again.`
        );
      });
  }

  if (command === "remove") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.channel
        .send("Insufficient permissions (Requires permission `Manage roles`)")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    const member = message.mentions.members.first();
    if (!member)
      return message.channel
        .send("You have not mentioned a user")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    const roleArg = args[1];
    if (!roleArg)
      return message.channel
        .send("You have not specified a role")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    let roleRemove;

    // Check if role is mentioned
    if (roleArg.startsWith("<@&") && roleArg.endsWith(">")) {
      const roleId = roleArg.slice(3, -1);
      roleRemove = message.guild.roles.cache.get(roleId);
    } else {
      // Check if role is specified by name
      const roleName = args.slice(1).join(" ");
      roleRemove = message.guild.roles.cache.find(
        (role) => role.name === roleName
      );
    }

    if (!roleRemove)
      return message.channel
        .send(`The role "${roleArg}" does not exist`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    if (!member.roles.cache.has(roleRemove.id))
      return message.channel
        .send(`This user does not have the "${roleRemove.name}" role`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });

    member.roles
      .remove(roleRemove)
      .then(() => {
        message.channel.send(
          `The role "${roleRemove.name}" has been removed from ${member.displayName}`
        );
      })
      .catch((error) => {
        console.error(`Failed to remove role: ${error}`);
        message.channel.send(
          `There was an error removing the role. Please check my permissions and try again.`
        );
      });
  }

  if (command === "say") {
    const text = args.join(" ");
    if (!text)
      return message.channel
        .send("You have not specified something to say")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    message.channel.send(text);
    await message.delete();
  }

  if (command === "purge") {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    )
      return message.channel
        .send(
          "Insufficient permissions (Requires permission `Manage messages`)"
        )
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    const number = parseInt(args[0], 10);
    if (!number || number < 2 || number > 100)
      return message.channel
        .send("You must specify a number between 2 and 100")
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    message.channel.bulkDelete(number, true).catch(console.error);
    await message.channel.send(`Deleted ${number} messages successfully.`);
  }

  if (command === "rps") {
    const options = [
      { name: "rock", emoji: "🪨" },
      { name: "paper", emoji: "📄" },
      { name: "scissors", emoji: "✂️" },
    ];

    const choice = args[0]?.toLowerCase();
    const userChoice = options.find((opt) => opt.name === choice);

    if (!userChoice) {
      return message.channel
        .send(
          `Invalid choice, please choose one of the following: ${options
            .map((opt) => `${opt.name} ${opt.emoji}`)
            .join(", ")}`
        )
        .then((msg) => {
          setTimeout(() => msg.delete(), 30000);
        });
    }

    const botChoice = options[Math.floor(Math.random() * options.length)];

    let resultMessage;
    if (userChoice.name === botChoice.name) {
      resultMessage = `It's a tie! We both chose ${userChoice.name} ${userChoice.emoji}`;
    } else if (
      (userChoice.name === "rock" && botChoice.name === "scissors") ||
      (userChoice.name === "paper" && botChoice.name === "rock") ||
      (userChoice.name === "scissors" && botChoice.name === "paper")
    ) {
      resultMessage = `You win! I chose ${botChoice.name} ${botChoice.emoji}`;
    } else {
      resultMessage = `You lose! I chose ${botChoice.name} ${botChoice.emoji}`;
    }

    return message.channel.send(resultMessage);
  }
});

bot.login(config.token);
