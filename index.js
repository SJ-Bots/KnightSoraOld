const Discord = require('discord.js');
const knightsora = new Discord.Client();
require('dotenv').config();
const prefix = process.env.prefix;
const mysql = require('mysql');

//Include Extensions

//SQL Connection
var connection = mysql.createConnection({
	host: process.env.address,
	user: process.env.account,
	password: process.env.password,
	database: process.env.database,
});
connection.connect((err) => {
	if (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') connect();
		else throw err;
	}
	console.log('DB has been connected.');
});

//EXP Generate
function generateExperiencePoint() {
	let MinEXP = 10;
	let MaxEXP = 30;

	return Math.floor(Math.random() * (MaxEXP - MinEXP + 1)) + MinEXP;
}

//Bot Settings
knightsora.on('ready', () => {
	//Set Presence
	console.log(`Logged in as ${knightsora.user.tag}!`);
	knightsora.user.setPresence({ activity: { name: 'Powered by 結城あやの | Using /help', type: 'STREAMING' }, status: 'idle' });
});

//Command Entry
knightsora.on('message', (msg) => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) {
		connection.query(`SELECT * FROM knightsora.xp WHERE ID = '${msg.author.id}' AND GuildID = '${msg.guild.id}';`, (err, rows) => {
			if (err) throw err;

			let sql;

			if (rows.length < 1) {
				sql = `INSERT INTO knightsora.xp (ID, GuildID, ExperiencePoint) VALUES('${msg.author.id}','${msg.guild.id}',${generateExperiencePoint()})`;
			} else {
				let ExperiencePoint = rows[0].ExperiencePoint;
				sql = `UPDATE knightsora.xp SET ExperiencePoint = ${ExperiencePoint + generateExperiencePoint()} WHERE ID = '${msg.author.id}' AND GuildID = '${msg.guild.id}'`;
			}
			connection.query(sql);
		});
	}
	const args = msg.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'ping') {
		msg.channel.send(`Pong!\n延遲${0 - (Date.now() - msg.createdTimestamp)}ms`);
	} else if (command === 'help' || command === 'h') {
		const help = new Discord.MessageEmbed()
			.setColor('#0F1D57')
			.setTitle('Help')
			.setDescription('Powered By 結城あやの')
			.addFields(
				{
					name: '核心功能',
					value: 'help: 顯示此列表',
				},
				{
					name: '實用功能',
					value: 'ping: 測試延遲',
				},
				{
					name: '管理功能',
					value: '尚未實裝',
					//value: 'warn: 警告使用者\nkick: 踢出使用者\nban: 封禁使用者\nmute: 水桶使用者',
				},
				{
					name: '娛樂功能',
					value: '尚未實裝',
					// inline: true,
				}
			)
			.setFooter('Copyright © 結城あやの From SJ Bots');
		msg.channel.send(help);
	}
});

//Bot Login
knightsora.login(process.env.token);
