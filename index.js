const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const taxChannels = new Map();

client.on('ready', () => {
    console.log(`✅ البوت شغال بنجاح باسم: ${client.user.tag}`);
    client.user.setActivity('حساب الضريبة 💰', { type: 0 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    if (command === '#set-tax' || command === '#تحديد-الروم') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر للأدمن فقط.');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            taxChannels.delete(message.guild.id);
            return message.reply('✅ تم إلغاء تحديد الروم، يمكنك الآن استخدام أمر الضريبة في أي روم.');
        }

        taxChannels.set(message.guild.id, channel.id);
        return message.reply(`✅ تم تحديد روم الضريبة بنجاح: ${channel}`);
    }

    const allowedChannelId = taxChannels.get(message.guild.id);
    if (allowedChannelId && message.channel.id !== allowedChannelId) return;

    if (command === 'ضريبة' || command === 'tax' || command === '#ضريبة' || command === '#tax') {
        let amountStr = args[1];

        if (!amountStr) {
            return message.reply('❌ يرجى كتابة المبلغ! مثال: `ضريبة 50k` أو `ضريبة 10000`');
        }

        amountStr = amountStr.toLowerCase().replace(/k/g, '000').replace(/m/g, '000000');
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ يرجى كتابة رقم صحيح ومقبول!');
        }

        const tax = Math.floor(amount * 20 / 19) + 1;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('💳 حساب ضريبة بروبوت')
            .addFields(
                { name: '💰 المبلغ الصافي:', value: `\`${amount.toLocaleString()}\``, inline: true },
                { name: '💳 المبلغ مع الضريبة:', value: `\`${tax.toLocaleString()}\``, inline: true }
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
