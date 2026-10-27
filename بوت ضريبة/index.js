const { 
    Client, 
    GatewayIntentBits, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const taxChannels = new Map();

client.on('ready', () => {
    console.log(`✅ [TAX BOT] متصل بنجاح باسم: ${client.user.tag}`);
    client.user.setActivity('حساب الضرائب 💰', { type: 0 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    // أمر تحديد الروم (للأدمن)
    if (command === '#set-tax' || command === '#تحديد-الروم') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ عذراً، هذا الأمر مخصص للأدمن فقط.');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            taxChannels.delete(message.guild.id);
            return message.reply('✅ تم إلغاء قيد الروم، أصبح يعمل في كل رومات السيرفر.');
        }

        taxChannels.set(message.guild.id, channel.id);
        return message.reply(`✅ تم تعيين روم الضريبة بنجاح: ${channel}`);
    }

    const allowedChannelId = taxChannels.get(message.guild.id);
    if (allowedChannelId && message.channel.id !== allowedChannelId) return;

    // أوامر الضريبة
    if (command === 'ضريبة' || command === 'tax' || command === '#ضريبة' || command === '#tax') {
        let amountStr = args[1];

        if (!amountStr) {
            return message.reply('❌ يرجى كتابة المبلغ! مثال: `ضريبة 100k` أو `ضريبة 50000`');
        }

        amountStr = amountStr.toLowerCase()
            .replace(/k/g, '000')
            .replace(/m/g, '000000')
            .replace(/b/g, '000000000');

        let amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ يرجى كتابة رقم صحيح وصالح للحساب!');
        }

        const tax = Math.floor(amount * 20 / 19) + 1;
        const taxPaidBySender = tax - amount;

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: `حساب ضريبة ProBot`, iconURL: message.client.user.displayAvatarURL() })
            .addFields(
                { name: '📥 المبلغ المطلوب:', value: `\`\`\`fix\n${amount.toLocaleString()}\`\`\``, inline: false },
                { name: '📤 المبلغ الصافي للمستلم:', value: `\`\`\`yaml\n${amount.toLocaleString()}\`\`\``, inline: true },
                { name: '💸 رسوم التحويل (5%):', value: `\`\`\`yaml\n${taxPaidBySender.toLocaleString()}\`\`\``, inline: true },
                { name: '💳 المبلغ الإجمالي مع الضريبة:', value: `\`\`\`ansi\n\u001b[1;32m${tax.toLocaleString()}\u001b[0m\`\`\``, inline: false }
            )
            .setFooter({ text: `طلب بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('copy_tax')
                .setLabel('نسخ المبلغ مع الضريبة')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('tax_info')
                .setLabel('طريقة الحساب')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️')
        );

        const sentMsg = await message.reply({ embeds: [embed], components: [row] });

        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ هذا الزر ليس لك!', ephemeral: true });
            }

            if (i.customId === 'copy_tax') {
                await i.reply({ 
                    content: `📋 **المبلغ مع الضريبة للنسخ السريع:**\n\`\`\`${tax}\`\`\``, 
                    ephemeral: true 
                });
            } else if (i.customId === 'tax_info') {
                await i.reply({ content: 'ℹ️ المعادلة المعتمدة: (المبلغ × 20 ÷ 19) + 1 لضمان وصول المبلغ كاملاً بعد خصم 5% بروبوت.', ephemeral: true });
            }
        });
    }
});

// تشغيل البوت باستخدام التوكن المخفي في ملف .env
client.login(process.env.TOKEN);