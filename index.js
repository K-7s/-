const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DATA_DIR = path.join(__dirname, 'Commands', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STOCKS_FILE = path.join(DATA_DIR, 'stocks.json');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

function loadJSON(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}
function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

function getUser(users, id) {
    if (!users[id]) {
        users[id] = {
            cash: 1000,
            bank: 0,
            xp: 0,
            level: 1,
            items: {},
            stocks: {},
            job: 'عاطل',
            marriage: null,
            reputation: 0,
            dailyCD: 0,
            workCD: 0,
            robCD: 0,
            crimeCD: 0,
            slapCD: 0
        };
    }
    return users[id];
}

client.on('ready', () => {
    console.log(`✅ [BANK 50 CMDS] البوت شغال بنجاح | تطوير s7le`);
    client.user.setActivity('نظام البنك والمالية 💳 | تطوير s7le', { type: 0 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // تحديد الروم الخاصة بالبنك فقط
    const targetChannel = process.env.BANK_CHANNEL_ID;
    if (targetChannel && message.channel.id !== targetChannel) return;

    const content = message.content.trim();
    const args = content.split(/ +/);
    const cmd = args.shift().toLowerCase();

    let users = loadJSON(USERS_FILE);
    let stocks = loadJSON(STOCKS_FILE);
    let dataStore = loadJSON(DATA_FILE);

    const u = getUser(users, message.author.id);
    const now = Date.now();

    // ==========================================
    // 📋 أمر المساعدة الشامل (HELP)
    // ==========================================
    if (cmd === 'مساعدة' || cmd === 'هيلب' || cmd === 'اوامر' || cmd === 'أوامر' || cmd === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🏛️ قائمة أوامر البنك والاقتصاد الشاملة (50 أمر)')
            .setDescription('اختر القسم من القائمة السفلية لعرض الأوامر الخاصة به:\n\n💳 **المطور:** s7le\n⚙️ **النظام:** يعمل بدون بريفكس وفي هذه الروم فقط!')
            .setFooter({ text: 'حقوق البوت محفوظة لـ s7le' })
            .setTimestamp();

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('📜 اختر قسم الأوامر...')
                .addOptions([
                    { label: '💰 الأوامر المالية الأساسية (10)', value: 'cat_finance', emoji: '💳' },
                    { label: '🎰 الألعاب والرهانات (10)', value: 'cat_games', emoji: '🎲' },
                    { label: '📈 الأسهم والاستثمار (10)', value: 'cat_stocks', emoji: '📊' },
                    { label: '🛒 المتجر والممتلكات (10)', value: 'cat_store', emoji: '🏡' },
                    { label: '👥 التفاعل والتسلية (10)', value: 'cat_social', emoji: '🎭' }
                ])
        );

        return message.reply({ embeds: [embed], components: [menu] });
    }

    // ==========================================
    // 💰 1. الأوامر المالية الأساسية (10)
    // ==========================================
    if (cmd === 'رصيدي' || cmd === 'فلوسي' || cmd === 'حسابي' || cmd === 'رصيد') {
        const target = message.mentions.users.first() || message.author;
        const targetU = getUser(users, target.id);
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`💳 حساب ${target.username} المالي`)
            .addFields(
                { name: '💵 الكاش (المحفظة):', value: `\`${targetU.cash.toLocaleString()}\` 🪙`, inline: true },
                { name: '🏦 البنك:', value: `\`${targetU.bank.toLocaleString()}\` 🪙`, inline: true },
                { name: '📊 المجموع:', value: `\`${(targetU.cash + targetU.bank).toLocaleString()}\` 🪙`, inline: true }
            )
            .setFooter({ text: 'تطوير s7le' });
        saveJSON(USERS_FILE, users);
        return message.reply({ embeds: [embed] });
    }

    if (cmd === 'راتب' || cmd === 'عمل') {
        if (now < u.workCD) {
            const left = Math.ceil((u.workCD - now) / 1000 / 60);
            return message.reply(`⏳ يجب أن تنتظر \`${left}\` دقيقة للحصول على الراتب القادم.`);
        }
        const earn = Math.floor(Math.random() * 400) + 200;
        u.cash += earn;
        u.workCD = now + 10 * 60 * 1000; // 10 دقائق
        saveJSON(USERS_FILE, users);
        return message.reply(`💼 عملت بجد واستلمت \`${earn}\` 🪙 كراتب في محفظتك!`);
    }

    if (cmd === 'يومي' || cmd === 'مكافأة') {
        if (now < u.dailyCD) {
            const left = Math.ceil((u.dailyCD - now) / 1000 / 60 / 60);
            return message.reply(`⏳ باقي \`${left}\` ساعة لاستلام مكافأتك اليومية.`);
        }
        const reward = 2000;
        u.cash += reward;
        u.dailyCD = now + 24 * 60 * 60 * 1000;
        saveJSON(USERS_FILE, users);
        return message.reply(`🎁 استلمت مكافأتك اليومية بقيمة \`${reward}\` 🪙!`);
    }

    if (cmd === 'إيداع' || cmd === 'ايداع') {
        let amount = args[0] === 'الكل' ? u.cash : parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) return message.reply('❌ حدد مبلغاً صحيحاً أو اكتب `إيداع الكل`.');
        if (u.cash < amount) return message.reply('❌ لا تملك هذا المبلغ في كاش محفظتك.');
        u.cash -= amount;
        u.bank += amount;
        saveJSON(USERS_FILE, users);
        return message.reply(`✅ تم إيداع \`${amount.toLocaleString()}\` 🪙 في حسابك البنكي.`);
    }

    if (cmd === 'سحب') {
        let amount = args[0] === 'الكل' ? u.bank : parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) return message.reply('❌ حدد مبلغاً صحيحاً أو اكتب `سحب الكل`.');
        if (u.bank < amount) return message.reply('❌ لا تملك هذا المبلغ في البنك.');
        u.bank -= amount;
        u.cash += amount;
        saveJSON(USERS_FILE, users);
        return message.reply(`✅ تم سحب \`${amount.toLocaleString()}\` 🪙 إلى محفظتك.`);
    }

    if (cmd === 'تحويل' || cmd === 'تحويلات') {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!target || isNaN(amount) || amount <= 0) return message.reply('❌ اكتب الأمر هكذا: `تحويل @المستخدم 500`.');
        if (target.id === message.author.id) return message.reply('❌ لا يمكنك التحويل لنفسك!');
        if (u.cash < amount) return message.reply('❌ ليس لديك كاش كافٍ للتحويل.');
        const targetU = getUser(users, target.id);
        u.cash -= amount;
        targetU.cash += amount;
        saveJSON(USERS_FILE, users);
        return message.reply(`💸 تم تحويل \`${amount.toLocaleString()}\` 🪙 بنجاح إلى ${target.username}.`);
    }

    if (cmd === 'تكتيك' || cmd === 'عقود') {
        u.cash += 50;
        saveJSON(USERS_FILE, users);
        return message.reply('📈 قمت بإبرام عقد سريع وحصلت على `50` 🪙!');
    }

    if (cmd === 'غرامة') {
        const fee = 100;
        if (u.cash < fee) return message.reply('❌ لا يوجد لديك مبلغ كاف لدفع الغرامة.');
        u.cash -= fee;
        saveJSON(USERS_FILE, users);
        return message.reply('🚨 قمت بدفع غرامة مخالفة مرورية بقيمة `100` 🪙.');
    }

    if (cmd === 'زكاة') {
        const zakat = Math.floor(u.bank * 0.025);
        if (zakat <= 0) return message.reply('❌ لا يكتمل النصاب لخصم الزكاة.');
        u.bank -= zakat;
        saveJSON(USERS_FILE, users);
        return message.reply(`🕌 تم إخراج زكاة أموالك بقيمة \`${zakat.toLocaleString()}\` 🪙 من البنك.`);
    }

    if (cmd === 'قرض') {
        if (u.bank > 5000) return message.reply('❌ لديك أموال كافية ولا يمكنك أخذ قرض.');
        u.bank += 1000;
        saveJSON(USERS_FILE, users);
        return message.reply('🏛️ حصلت على قرض بنكي بقيمة `1000` 🪙 تم إضافته لبنكك!');
    }

    // ==========================================
    // 🎰 2. الألعاب والرهانات (10)
    // ==========================================
    if (cmd === 'روليت' || cmd === 'مراهنة') {
        const bet = parseInt(args[0]);
        if (isNaN(bet) || bet <= 0 || u.cash < bet) return message.reply('❌ حدد مبلغ رهان صحيح من الكاش معك.');
        const win = Math.random() > 0.5;
        if (win) {
            u.cash += bet;
            saveJSON(USERS_FILE, users);
            return message.reply(`🎉 مبروك! فزت بالرهان وضاعفت مبلغك وزدت \`${bet}\` 🪙!`);
        } else {
            u.cash -= bet;
            saveJSON(USERS_FILE, users);
            return message.reply(`💔 للأسف خست الرهان وخسرت \`${bet}\` 🪙.`);
        }
    }

    if (cmd === 'حفل' || cmd === 'حفظ') {
        const chance = Math.floor(Math.random() * 500);
        u.cash += chance;
        saveJSON(USERS_FILE, users);
        return message.reply(`🎉 شاركت في حفل جمعية وحصلت على \`${chance}\` 🪙!`);
    }

    if (cmd === 'حظ' || cmd === 'حظي') {
        const luck = Math.floor(Math.random() * 100);
        return message.reply(`🎯 نسبة حظك اليوم هي: \`${luck}%\`!`);
    }

    if (cmd === 'سرقة') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) return message.reply('❌ من تريد سرقته؟ `سرقة @المستخدم`.');
        if (now < u.robCD) return message.reply('⏳ الكوب أجهزة الأمن تراقبك، انتظر كولداون!');
        const targetU = getUser(users, target.id);
        if (targetU.cash < 300) return message.reply('❌ هذا الشخص مفلس لا يملك كاش يستحق السرقة.');
        
        u.robCD = now + 15 * 60 * 1000;
        if (Math.random() > 0.5) {
            const stolen = Math.floor(targetU.cash * 0.4);
            targetU.cash -= stolen;
            u.cash += stolen;
            saveJSON(USERS_FILE, users);
            return message.reply(`🥷 نجحت في سرقة \`${stolen}\` 🪙 من ${target.username}!`);
        } else {
            u.cash = Math.max(0, u.cash - 200);
            saveJSON(USERS_FILE, users);
            return message.reply(`🚔 كشفتك الشرطة وتم دفع غرامة \`200\` 🪙!`);
        }
    }

    if (cmd === 'جريمة') {
        if (now < u.crimeCD) return message.reply('⏳ انتظر حتى تهدأ الأوضاع للمخاطرة بجريمة جديدة.');
        u.crimeCD = now + 20 * 60 * 1000;
        if (Math.random() > 0.6) {
            const gain = 1500;
            u.cash += gain;
            saveJSON(USERS_FILE, users);
            return message.reply(`💣 قمت بعملية سرقة بنك ناجحة وحصلت على \`${gain}\` 🪙!`);
        } else {
            u.cash = Math.max(0, u.cash - 500);
            saveJSON(USERS_FILE, users);
            return message.reply(`🚑 فشلت الجريمة وأصبت وتم علاجك بـ \`500\` 🪙.`);
        }
    }

    if (cmd === 'تخمين') {
        const secret = Math.floor(Math.random() * 5) + 1;
        const guess = parseInt(args[0]);
        if (!guess || guess < 1 || guess > 5) return message.reply('❌ خمن رقماً من 1 إلى 5. مثال: `تخمين 3`.');
        if (guess === secret) {
            u.cash += 800;
            saveJSON(USERS_FILE, users);
            return message.reply(`🎯 خيالك واسع! التخمين صحيح وفزت بـ \`800\` 🪙!`);
        } else {
            return message.reply(`❌ تخمين خاطئ، الرقم الصحيح كان \`${secret}\`.`);
        }
    }

    if (cmd === 'نرد') {
        const dice = Math.floor(Math.random() * 6) + 1;
        return message.reply(`🎲 رميت النرد وحصلت على رقم: \`${dice}\`!`);
    }

    if (cmd === 'عملة' || cmd === 'قرعة') {
        const outcome = Math.random() > 0.5 ? 'ملك 👑' : 'كتابة 📜';
        return message.reply(`🪙 نتيجة القرعة هي: **${outcome}**!`);
    }

    if (cmd === 'صيد') {
        const fishPrice = Math.floor(Math.random() * 200) + 50;
        u.cash += fishPrice;
        saveJSON(USERS_FILE, users);
        return message.reply(`🎣 اصطدت سمكة وبعتها في السوق بـ \`${fishPrice}\` 🪙!`);
    }

    if (cmd === 'تنجيب' || cmd === 'تعدين') {
        const ore = Math.floor(Math.random() * 400) + 100;
        u.cash += ore;
        saveJSON(USERS_FILE, users);
        return message.reply(`⛏️ استخرجت معادن ونحاس وبعتها بـ \`${ore}\` 🪙!`);
    }

    // ==========================================
    // 📈 3. الأسهم والاستثمار (10)
    // ==========================================
    if (cmd === 'الأسهم' || cmd === 'اسهم' || cmd === 'بورصة') {
        let text = '📊 **قائمة أسعار الأسهم الحالية:**\n\n';
        for (let s in stocks) {
            text += `🔹 **${s}**: \`${stocks[s]}\` 🪙\n`;
        }
        text += '\nلشراء سهم: `شراء-سهم [اسم السهم]`';
        return message.reply(text);
    }

    if (cmd === 'شراء-سهم') {
        const symbol = args[0]?.toUpperCase();
        if (!symbol || !stocks[symbol]) return message.reply('❌ حدد سهم صحيح. اكتب `الأسهم` لرؤية القائمة.');
        const price = stocks[symbol];
        if (u.cash < price) return message.reply('❌ لا تملك كاش كافٍ لشراء هذا السهم.');
        u.cash -= price;
        u.stocks[symbol] = (u.stocks[symbol] || 0) + 1;
        saveJSON(USERS_FILE, users);
        return message.reply(`📈 اشتريت سهم واحد من **${symbol}** بسعر \`${price}\` 🪙.`);
    }

    if (cmd === 'بيع-سهم') {
        const symbol = args[0]?.toUpperCase();
        if (!symbol || !u.stocks[symbol] || u.stocks[symbol] <= 0) return message.reply('❌ لا تملك أسهم في هذه الشركة.');
        const price = stocks[symbol];
        u.stocks[symbol] -= 1;
        u.cash += price;
        saveJSON(USERS_FILE, users);
        return message.reply(`📉 بعت سهم واحد من **${symbol}** واستلمت \`${price}\` 🪙.`);
    }

    if (cmd === 'محفظتي-الأسهم' || cmd === 'اسهمي') {
        let text = '💼 **محفظتك في سوق الأسهم:**\n\n';
        let count = 0;
        for (let s in u.stocks) {
            if (u.stocks[s] > 0) {
                text += `• **${s}**: \`${u.stocks[s]}\` سهم\n`;
                count++;
            }
        }
        if (count === 0) text = '❌ لا تملك أي أسهم حالياً.';
        return message.reply(text);
    }

    if (cmd === 'تحديث-البورصة') {
        for (let s in stocks) {
            const change = Math.floor(Math.random() * 40) - 20;
            stocks[s] = Math.max(10, stocks[s] + change);
        }
        saveJSON(STOCKS_FILE, stocks);
        return message.reply('🔄 تم تحديث جميع أسعار أسهم البورصة بنجاح!');
    }

    if (cmd === 'مستثمر') {
        u.xp += 10;
        saveJSON(USERS_FILE, users);
        return message.reply('🏅 ارتفع تقييمك الاستثماري وزادت نقاط خبرتك `+10 XP`!');
    }

    if (cmd === 'تداول') {
        const profit = Math.floor(Math.random() * 600) - 300;
        u.cash = Math.max(0, u.cash + profit);
        saveJSON(USERS_FILE, users);
        return message.reply(`📈 نتيجة التداول السريع: \`${profit >= 0 ? '+' : ''}${profit}\` 🪙!`);
    }

    if (cmd === 'بنك-الأرباح') {
        const profit = Math.floor(u.bank * 0.01);
        u.bank += profit;
        saveJSON(USERS_FILE, users);
        return message.reply(`🏦 أرباح ودائعك البنكية المضافة لحسابك: \`+${profit}\` 🪙.`);
    }

    if (cmd === 'تحليل') {
        return message.reply('🔍 التحليل المالي يتوقع ارتفاع أسهم **BITCOIN** و **GOLD** هذا الأسبوع!');
    }

    if (cmd === 'توصية') {
        return message.reply('💡 توصية الاستثمار اليوم: اشترِ أسهم **TESLA** قبل الارتفاع!');
    }

    // ==========================================
    // 🛒 4. المتجر والممتلكات (10)
    // ==========================================
    if (cmd === 'المتجر' || cmd === 'متجر' || cmd === 'سوق') {
        let text = '🛒 **سوق الممتلكات والأغراض:**\n\n';
        for (let item in dataStore.stores) {
            text += `🔹 **${item}**: \`${dataStore.stores[item]}\` 🪙\n`;
        }
        text += '\nللشراء: `شراء [اسم الغرض]`';
        return message.reply(text);
    }

    if (cmd === 'شراء') {
        const item = args.join(' ');
        if (!item || !dataStore.stores[item]) return message.reply('❌ اكتب اسم الغرض بشكل صحيح من `المتجر`.');
        const price = dataStore.stores[item];
        if (u.cash < price) return message.reply('❌ لا تملك كاش كافٍ لشراء هذا الغرض.');
        u.cash -= price;
        u.items[item] = (u.items[item] || 0) + 1;
        saveJSON(USERS_FILE, users);
        return message.reply(`🛍️ مبروك! اشتريت **${item}** بنجاح بسعر \`${price}\` 🪙.`);
    }

    if (cmd === 'حقيبتي' || cmd === 'أغراضي' || cmd === 'ممتلكاتي') {
        let text = '🎒 **محتويات حقيبتك:**\n\n';
        let count = 0;
        for (let item in u.items) {
            if (u.items[item] > 0) {
                text += `• **${item}**: \`${u.items[item]}\` قطعة\n`;
                count++;
            }
        }
        if (count === 0) text = '🎒 حقيبتك فارغة، يمكنك الشراء من `المتجر`.';
        return message.reply(text);
    }

    if (cmd === 'بيع') {
        const item = args.join(' ');
        if (!item || !u.items[item] || u.items[item] <= 0) return message.reply('❌ لا تملك هذا الغرض لبيعه.');
        const price = Math.floor(dataStore.stores[item] * 0.7); // بيع بـ 70% من السعر
        u.items[item] -= 1;
        u.cash += price;
        saveJSON(USERS_FILE, users);
        return message.reply(`🏷️ بعت **${item}** واستلمت \`${price}\` 🪙.`);
    }

    if (cmd === 'وظيفة' || cmd === 'مهنة') {
        const jobs = ['مهندس', 'طبيب', 'تاجر', 'مطور', 'محامي'];
        const j = jobs[Math.floor(Math.random() * jobs.length)];
        u.job = j;
        saveJSON(USERS_FILE, users);
        return message.reply(`👨‍💼 تم توظيفك رسمياً بمهنة: **${j}**!`);
    }

    if (cmd === 'مهنتي') {
        return message.reply(`👨‍💼 مهنتك الحالية هي: **${u.job}**.`);
    }

    if (cmd === 'ترقية') {
        if (u.cash < 1000) return message.reply('❌ تحتاج 1000 🪙 في الكاش لطلب ترقية.');
        u.cash -= 1000;
        u.level += 1;
        saveJSON(USERS_FILE, users);
        return message.reply(`⭐ مبروك! تمت ترقية مستواك المالي إلى Level \`${u.level}\`!`);
    }

    if (cmd === 'مستواي') {
        return message.reply(`⭐ مستواك المالي الحالي: Level \`${u.level}\` | الخبرة: \`${u.xp} XP\`.`);
    }

    if (cmd === 'هدية') {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ اختر شخص لإهدائه: `هدية @المستخدم`.');
        return message.reply(`🎁 أرسلت هدية لطيفة إلى ${target.username}!`);
    }

    if (cmd === 'مزاد') {
        return message.reply('🏛️ المزاد المالي المغلق سيفتح قريباً بحضور المطور s7le!');
    }

    // ==========================================
    // 👥 5. التفاعل والتسلية (10)
    // ==========================================
    if (cmd === 'زواج') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) return message.reply('❌ من تريد الزواج به؟ `زواج @المستخدم`.');
        if (u.marriage) return message.reply('❌ أنت متزوج بالفعل!');
        u.marriage = target.username;
        saveJSON(USERS_FILE, users);
        return message.reply(`💍 ألف مبروك! تم عقد زواجك على ${target.username}!`);
    }

    if (cmd === 'طلاق') {
        if (!u.marriage) return message.reply('❌ أنت غير متزوج أساساً!');
        const ex = u.marriage;
        u.marriage = null;
        saveJSON(USERS_FILE, users);
        return message.reply(`💔 تم الطلاق رسمياً من ${ex}.`);
    }

    if (cmd === 'زوجتي' || cmd === 'زوجي') {
        if (!u.marriage) return message.reply('❌ أنت غير متزوج حالياً.');
        return message.reply(`❤️ شريك حياتك هو: **${u.marriage}**.`);
    }

    if (cmd === 'سمعة' || cmd === 'لايك') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) return message.reply('❌ لمن تريد إعطاء نقطة سمعة؟ `سمعة @المستخدم`.');
        const targetU = getUser(users, target.id);
        targetU.reputation += 1;
        saveJSON(USERS_FILE, users);
        return message.reply(`🌟 أعطيت نقطة سمعة لـ ${target.username}! (السمعة: ${targetU.reputation})`);
    }

    if (cmd === 'صفعة' || cmd === 'كف') {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ اختر من تريد صفعه: `صفعة @المستخدم`.');
        return message.reply(`👋 وجهت صفعة قوية على وجه ${target.username}!`);
    }

    if (cmd === 'حضن') {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ اختر شخصاً: `حضن @المستخدم`.');
        return message.reply(`🫂 قمت باحتضان ${target.username} بكل دفء!`);
    }

    if (cmd === 'تاجر-السيرفر' || cmd === 'التاجر') {
        return message.reply('👑 تاجر السيرفر الأكبر والأغنى حالياً هو المطور **s7le**!');
    }

    if (cmd === 'توب' || cmd === 'الأغنياء' || cmd === 'الاغنياء') {
        let sorted = Object.keys(users)
            .map(id => ({ id, total: (users[id].cash || 0) + (users[id].bank || 0) }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        let text = '🏆 **قائمة أغنى 5 أعضاء في البنك:**\n\n';
        sorted.forEach((item, index) => {
            text += `**#${index + 1}** <@${item.id}> - \`${item.total.toLocaleString()}\` 🪙\n`;
        });
        return message.reply(text);
    }

    if (cmd === 'المطور' || cmd === 'حقوق') {
        return message.reply('👑 **برمجة وتطوير:** البوت مطور بالكامل بواسطة **s7le**.');
    }

    if (cmd === 'بنك') {
        return message.reply('🏛️ أهلاً بك في نظام البنك المركزي! اكتب `مساعدة` لرؤية الأوامر.');
    }

    saveJSON(USERS_FILE, users);
});

// التعامل مع قائمة المساعدة التفاعلية
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'help_menu') {
        const val = interaction.values[0];
        let embed = new EmbedBuilder().setColor('#2b2d31').setFooter({ text: 'حقوق البوت محفوظة لـ s7le' });

        if (val === 'cat_finance') {
            embed.setTitle('💰 الأوامر المالية الأساسية (10 أوامر)')
                .setDescription('• `رصيدي` - معرفة كاش وبنك حسابك\n• `راتب` - الحصول على راتبك الدائم\n• `يومي` - مكافأة كل 24 ساعة\n• `إيداع [المبلغ]` - وضع الكاش بالبنك\n• `سحب [المبلغ]` - سحب من البنك للكاش\n• `تحويل [@عضو] [مبلغ]` - تحويل كاش لغيرك\n• `تكتيك` - كسب سريع للثواني\n• `غرامة` - دفع مخالفة مرورية\n• `زكاة` - إخراج زكاة أموال البنك\n• `قرض` - أخذ قرض بنكي محدد');
        } else if (val === 'cat_games') {
            embed.setTitle('🎰 الألعاب والرهانات (10 أوامر)')
                .setDescription('• `روليت [مبلغ]` - مراهنة بالكاش\n• `حفل` - جمعية وأرباح عشوائية\n• `حظي` - نسبة حظك اليومي\n• `سرقة [@عضو]` - سرقة كاش شخص آخر\n• `جريمة` - مخاطرة سرقة بنك كبرى\n• `تخمين [رقم]` - تخمين رقم من 1 إلى 5\n• `نرد` - رمي زهر النرد\n• `عملة` - قرعة ملك أم كتابة\n• `صيد` - صيد أسماك وبيعها\n• `تعدين` - تنقيب عن المعادن وبيعها');
        } else if (val === 'cat_stocks') {
            embed.setTitle('📈 الأسهم والاستثمار (10 أوامر)')
                .setDescription('• `الأسهم` - عرض أسعار بورصة الأسهم\n• `شراء-سهم [اسم]` - شراء سهم شركة\n• `بيع-سهم [اسم]` - بيع سهم تملكه\n• `اسهمي` - عرض محفظتك للأسهم\n• `تحديث-البورصة` - تغير أسعار الأسهم\n• `مستثمر` - كسب نقاط خبرة XP\n• `تداول` - مضاربة سريعة ومخاطرة\n• `بنك-الأرباح` - أرباح الودائع البنكية\n• `تحليل` - نظرة وتحليل للأسهم\n• `توصية` - توصية شراء اليوم');
        } else if (val === 'cat_store') {
            embed.setTitle('🛒 المتجر والممتلكات (10 أوامر)')
                .setDescription('• `المتجر` - عرض أغراض وسوق السيرفر\n• `شراء [اسم]` - شراء غرض من المتجر\n• `حقيبتي` - عرض الأغراض التي تملكها\n• `بيع [اسم]` - بيع غرض للبنك\n• `وظيفة` - التقديم على مهنة عمل\n• `مهنتي` - عرض مهنتك الحالية\n• `ترقية` - رفع مستواك المالي (Level)\n• `مستواي` - عرض مستواك والـ XP\n• `هدية [@عضو]` - إرسال هدية لعضو\n• `مزاد` - المزاد المالي في السيرفر');
        } else if (val === 'cat_social') {
            embed.setTitle('👥 التفاعل والتسلية (10 أوامر)')
                .setDescription('• `زواج [@عضو]` - طلب زواج من عضو\n• `طلاق` - الانفصال وفسخ عقد الزواج\n• `زوجتي` - معرفة شريك حياتك\n• `سمعة [@عضو]` - إعطاء تقييم سمعة\n• `صفعة [@عضو]` - إعطاء كف لعضو\n• `حضن [@عضو]` - احتضان عضو في السيرفر\n• `التاجر` - معرفة أغنى شخصية بالبرمجة\n• `توب` - قائمة أغنى 5 أعضاء بالبنك\n• `المطور` - عرض حقوق البرمجة (s7le)\n• `بنك` - نبذة سريعة عن البنك المركزي');
        }

        await interaction.update({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
