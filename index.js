const Discord = require("discord.js");
const enmap = require("enmap");
const config = require("./config.json");
const ms = require("ms")

const client = new Discord.Client();
const eco = new enmap({
    name: "economy",
    cloneLevel: "deep",
    fetchAll: false,
    autoFetch: true
});

const cooldowns = new enmap({
    name: "cooldowns",
    cloneLevel: "deep",
    fetchAll: false,
    autoFetch: true
});

client.on("ready", () => {
    console.log("Ready")
});

client.on('message', async message => {
    if(!message.content.startsWith(config.prefix)) return;
    if(message.author.bot) return;
    if(!message.guild) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "daily") {
        const cooldowndata = await cooldowns.get(`${message.author.id}-daily`);
        if(parseInt(cooldowndata) > Date.now()) return message.reply(`Please wait ${ms(parseInt(cooldowndata) - Date.now(), {long: true})} to claim your daily reward again.`)

        await eco.ensure(`${message.author.id}`, 0);
        const currentBalance = await eco.get(`${message.author.id}`);
        eco.set(`${message.author.id}`, currentBalance + 10);

        message.channel.send(new Discord.MessageEmbed()
            .setTitle("💵 Daily Reward!")
            .setDescription(`You have claimed your daily reward! Your new balance is now ${currentBalance + 10}!`).setColor("00ff00")
        )

        cooldowns.set(`${message.author.id}-daily`, Date.now() + ms("1d"))
    }

    if(command == "bal") {
        await eco.ensure(`${message.author.id}`, 0);
        const currentBalance = await eco.get(`${message.author.id}`);

        message.channel.send(new Discord.MessageEmbed()
            .setTitle("💵 Your Balance!")
            .setDescription(`Your current balance is \`${currentBalance}\``).setColor("00ff00")
        )
    }

   if(command == "claim") {
        const cooldowndata = await cooldowns.get(`${message.author.id}-hourly`);
        if(parseInt(cooldowndata) > Date.now()) return message.reply(`Please wait ${ms(parseInt(cooldowndata) - Date.now(), {long: true})}`)

        await eco.ensure(`${message.author.id}`, 1);
        const currentBalance = await eco.get(`${message.author.id}`);
        eco.set(`${message.author.id}`, currentBalance + 5);

        message.channel.send(new Discord.MessageEmbed()
            .setTitle("💵 Hourly Reward!")
            .setDescription(`You have claimed your hourly reward! Your new balance is now ${currentBalance + 5}!`).setColor("00ff00")
        )

        cooldowns.set(`${message.author.id}-hourly`, Date.now() + ms("0.0417d"))
    }

});

client.login(config.token)