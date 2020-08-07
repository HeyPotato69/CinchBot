require('dotenv').config();
const sendbird = require('sendbird');
const os = require('os');
const fs = require('fs');
const axios = require('axios');
const FormData = require("form-data");
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const version = "version 1.0.2";
const moderators = ["CinchBot", "TheDefault1"];
const {
	CookieJar
} = require("tough-cookie");
const got = require("got");
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

// Launch
let credentials = {
	userid: process.env.REDDIT_ID,
	username: process.env.REDDIT_USER,
	passwd: process.env.REDDIT_PASS,
};
let sb = new sendbird({
	appId: "2515BDA8-9D3A-47CF-9325-330BC37ADA13"
});
const form = new FormData();
form.append("user", credentials.username);
form.append("passwd", credentials.passwd);
form.append("api_type", "json");

console.log("Connecting to sendbird...");
got.post({
	body: form,
	url: "https://ssl.reddit.com/api/login",
}).then(res => {
	const cookieJar = new CookieJar();
	cookieJar.setCookieSync("reddit_session=" + encodeURIComponent(JSON.parse(res.body).json.data.cookie), "https://s.reddit.com");
	got({
		cookieJar,
		method: "get",
		url: "https://s.reddit.com/api/v1/sendbird/me",
	}).then(sbRes => {
		const sbInfo = JSON.parse(sbRes.body);
		sb.connect(credentials.userid, sbInfo.sb_access_token).then(userInfo => {
			console.log("Successfully connected to sendbird with u/" + userInfo.nickname + "!");
		}).catch(err => {
			console.error("Error while trying to connect to sendbird. Error: " + err);
		});
	}).catch(err => {
		console.error("Error while trying to get access token. Error: " + err);
	});
}).catch(err => {
	console.error("Error while trying to get session token. Error: " + err);
});

// Data
let miscCommands = JSON.parse(fs.readFileSync("src/MiscCommands.json"));
var helpMessages = fs.readFileSync("data/help.txt", encoding = "utf8").split("SPLITHERE");
let newsMessageMessage = "Hottest news of the day: " + os.EOL + os.EOL + "%(NEWSMESSAGETITLE)" + os.EOL + os.EOL + "Read more here %(NEWSMESSAGELINKTOPOST)";
let ch = new sb.ChannelHandler();
let newsMessage = async (count, channelUrl, channel) => {
	if (isUndefined(channelUrl)) {
		let channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
		channelListQuery.includeEmpty = false;
		channelListQuery.limit = 100;

		if (channelListQuery.hasNext) {
			channelListQuery.next(function(channelList, error) {
				if (error) {
					console.error(error);
					return;
				}
				axios.get("http://www.reddit.com/r/news/top.json?limit=" + count.toString()).then((newsPostJson) => {
					let newsPost = newsPostJson.data.data.children[Math.floor(Math.random() * newsPostJson.data.data.children.length)].data;
					newMessage = makerandomthing(7) + newsMessageMessage;
					var newMessage = newsMessageMessage.replace("%(NEWSMESSAGETITLE)", newsPost.title);
					newMessage = newMessage.replace("%(NEWSMESSAGELINK)", newsPost.url);
					newMessage = newMessage.replace("%(NEWSMESSAGELINKTOPOST)", "https://reddit.com" + newsPost.permalink);
					newMessage = newMessage + makerandomthing(7);
					for (let i = 0; i < channelList.length; i++) {
						setTimeout(() => {
							channelList[i].sendUserMessage(newMessage, (message, error) => {
								if (error) {
									console.error(error);
								}
							});
						}, i * 1000);
					}
				});
			});
		}
	} else {
		axios.get("http://www.reddit.com/r/news/top.json?limit=" + count.toString()).then((newsPostJson) => {
			let newsPost = newsPostJson.data.data.children[Math.floor(Math.random() * newsPostJson.data.data.children.length)].data;
			let newMessage = newsMessageMessage.replace("%(NEWSMESSAGETITLE)", newsPost.title);
			newMessage = newMessage.replace("%(NEWSMESSAGELINK)", newsPost.url);
			newMessage = newMessage.replace("%(NEWSMESSAGELINKTOPOST)", "https://reddit.com" + newsPost.permalink);
			sendMsgWithChannel(channel, newMessage);
		});
	}
};
let memesMessageMessage = "%(MEMESMESSAGELINKTOPOST)";
let memesMessage = async (count, channelUrl, channel) => {
	if (isUndefined(channelUrl)) {
		let channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
		channelListQuery.includeEmpty = false;
		channelListQuery.limit = 100;

		if (channelListQuery.hasNext) {
			channelListQuery.next(function(channelList, error) {
				if (error) {
					console.error(error);
					return;
				}
				axios.get("http://www.reddit.com/r/dankmemes/top.json?limit=" + count.toString()).then((memesPostJson) => {
					let memesPost = memesPostJson.data.data.children[Math.floor(Math.random() * memesPostJson.data.data.children.length)].data;
					newMessage = makerandomthing(7) + memesMessageMessage;
					var newMessage = memesMessageMessage.replace("%(MEMESMESSAGETITLE)", memesPost.title);
					newMessage = newMessage.replace("%(MEMESMESSAGELINK)", memesPost.url);
					newMessage = newMessage.replace("%(MEMESMESSAGELINKTOPOST)", "https://reddit.com" + memesPost.permalink);
					newMessage = newMessage + makerandomthing(7);
					for (let i = 0; i < channelList.length; i++) {
						setTimeout(() => {
							channelList[i].sendUserMessage(newMessage, (message, error) => {
								if (error) {
									console.error(error);
								}
							});
						}, i * 1000);
					}
				});
			});
		}
	} else {
		axios.get("http://www.reddit.com/r/dankmemes/top.json?limit=" + count.toString()).then((memesPostJson) => {
			let memesPost = memesPostJson.data.data.children[Math.floor(Math.random() * memesPostJson.data.data.children.length)].data;
			let newMessage = memesMessageMessage.replace("%(MEMESMESSAGETITLE)", memesPost.title);
			newMessage = newMessage.replace("%(MEMESMESSAGELINK)", memesPost.url);
			newMessage = newMessage.replace("%(MEMESMESSAGELINKTOPOST)", "https://reddit.com" + memesPost.permalink);
			sendMsgWithChannel(channel, newMessage);
		});
	}
};
let currentAnswer = {};
let timeOfSendingOfLastTrivia = {};
let currentTrustfaller = {};
let msgNotAvb = "I'm sorry, this feature is currently unavailable.";
let triviaMessage = "TRIVIA!" + os.EOL + "Category: %(CATEGORY)" + os.EOL + "Difficulty: %(DIFFICULTY)" + os.EOL + "Question: %(QUESTION)" + os.EOL + "%(ANSWERS)";
ch.onUserJoined = async function(channel, user) {
	sendMsgWithChannel(channel, `u/${user.nickname} has joined the chat`);
}
ch.onUserLeft = async function(channel, user) {
		sendMsgWithChannel(channel, `u/${user.nickname} has left the chat`);
}
ch.onUserEntered = ch.onUserJoined;
ch.onUserExited = ch.onUserLeft;
ch.onMessageReceived = async function(channel, message) {
	let messageText = message.message.replace(/[^\r\n\t\x20-\x7E\xA0-\xFF]/g, " ").trim();
	if (messageText.toLowerCase().includes("good bot")) {
		sendMsgWithChannel(channel, "Thank you!");
	}
	if (messageText.startsWith("-") || messageText.startsWith("/")) {
		let cleanMessageText = messageText.toLowerCase().slice(1).trim();
		let args = messageText.split(" ").slice(1);
		let command = cleanMessageText.split(" ")[0];
		switch (command) {
			case "setjoinmessage":
			case "setjoinmsg":
				sendMsgWithChannel(channel, msgNotAvb);	
				break;
			case "setexitmessage":
			case "setexitmsg":
				sendMsgWithChannel(channel, msgNotAvb);
				break;
			case "quote":
				sendMsgWithChannel(channel, msgNotAvb);
				break;
			case "addquote":
				sendMsgWithChannel(channel, msgNotAvb);
				break;
			case "rules":
				sendMsgWithChannel(channel, msgNotAvb);
				break;
			case "setrules":
				sendMsgWithChannel(channel, msgNotAvb);
				break;
			case "id":
				if (!isUndefined(args[0])) {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					var userToGet = args[0];
					axios.get(`https://www.reddit.com/user/${userToGet}/about.json`).then((result) => {
						sendMsgWithChannel(channel, isUndefined(result.data.error) ? `${userToGet}'s reddit ID is: \n${result.data.data.id.split("?")[0]}` : `Couldn't find this person, sorry`);
					});
				}else {
					sendMsgWithChannel(channel, `Your reddit ID is: ${message._sender.userId}`);
				}
				break;
			case "restart":
				if ("thedefault1".includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "Restarting...");
					console.log(`Restarting ${userInfo.nickname}...\npid: ${process.pid}`);
					setTimeout(function () {
    					process.on("exit", function () {
        					require("child_process").spawn(process.argv.shift(), process.argv, {
           					cwd: process.cwd(),
            				detached : true,
							stdio: "inherit"
							
						});
						process.exit(1)
   					});
    			process.exit();
				}, 5000);
				}
				else {
					sendMsgWithChannel(channel, "You do not have access to this command.");
				}
				break;
			case "shutdown":
				if ("thedefault1".includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "Shutting down...");
					setTimeout(() => {  process.exit(1) }, 1500);
					break;
				}
				else {
					sendMsgWithChannel(channel, "You do not have access to this command.");
				}
					break;
			case "uptime":
				String.prototype.toHHMMSS = function () {
					var sec_num = parseInt(this, 10);
					var hours   = Math.floor(sec_num / 3600);
					var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
					var seconds = sec_num - (hours * 3600) - (minutes * 60);
				
					if (hours   < 10) {hours   = "0"+hours;}
					if (minutes < 10) {minutes = "0"+minutes;}
					if (seconds < 10) {seconds = "0"+seconds;}
					var time    = hours+':'+minutes+':'+seconds;
					return time;
				}
				var time = process.uptime();
				var uptime = (time + "").toHHMMSS();
				sendMsgWithChannel(channel, uptime);
				break;
			case "temp":
				var userToGet = stringFromList(args);
				
				if (userToGet.includes("C")) {
					let tempFormatted = userToGet.replace('C','');
					let tempInput = Number(tempFormatted);
					tempConverted = (tempInput * 1.8) + 32;
					sendMsgWithChannel(channel, `${tempFormatted}C (Celsius) is ${tempConverted.toFixed(1)}F (Fahrenheit)`);
				}
				else if (userToGet.includes("F")) {
					let tempFormatted = userToGet.replace('F','');
					
					let tempInput = Number(tempFormatted);
					tempConverted = (tempInput - 32) / 1.8;
					sendMsgWithChannel(channel, `${tempFormatted}F (Fahrenheit) is ${tempConverted.toFixed(1)}C (Celcius)`);
				}
				else {
					sendMsgWithChannel(channel, "Invalid argument");
				}
				break;
			case "len":
				var userToGet = stringFromList(args);
				
				if (userToGet.includes("\"")) {
					let tempFormatted = userToGet.replace('\"','');
					let tempInput = Number(tempFormatted);
					tempConverted = (tempInput * 2.54);
					sendMsgWithChannel(channel, `${tempFormatted}" is ${tempConverted.toFixed(1)} cm`);
				}
				else if (userToGet.includes("cm")) {
					let tempFormatted = userToGet.replace('cm','');
					
					let tempInput = Number(tempFormatted);
					tempConverted = (tempInput / 2.54);
					sendMsgWithChannel(channel, `${tempFormatted}cm is ${tempConverted.toFixed(1)}"`);
				}
				else {
					sendMsgWithChannel(channel, "Invalid argument");
				}
				break;
			case "moderators":
			case "mods":
				let operatorListQuery = channel.createOperatorListQuery();
				operatorListQuery.limit = 100;
				let msg = "The moderators of this chatroom are: ";
				operatorListQuery.next(function(mods) {
					for (let mod of mods) {
						if (mod.userId == sb.currentUser.userId) {
							msg = msg + "\n- CinchBot";
						} else {
							msg = msg + "\n- " + mod.nickname;
						}
					}
					sendMsgWithChannel(channel, msg);
				});
				break;
			case "news":
				newsMessage(20, channel.url, channel);
				break;
			case "memes":
				memesMessage(20, channel.url, channel);
				break;
			case "trivia":
				trivia(channel.url, channel);
				break;
			case "tanswer":
				tanswer(channel.url, channel);
				break;
			case "botinfo":
				var uptime = Math.floor(process.uptime());
				sendMsgWithChannel(channel, "A bot by u/TheDefault1. Lighter, safer flavor of TrogloBot.");
				break;
			case "commands":
			case "help":
				var pageNumber = parseInt(args[0]);
				if (isNaN(pageNumber) || pageNumber > helpMessages.length || pageNumber < 1) {
					sendMsgWithChannel(channel, `This isn't a valid number. The pages range from 1 to ${helpMessages.length}`);
					break;
				}
				sendMsgWithChannel(channel, `Page ${pageNumber}/${helpMessages.length}:\n${helpMessages[pageNumber - 1]}`);
				break;
			case "trustfall":
				sendMsgWithChannel(channel, message._sender.nickname.toUpperCase() + " TRUSTFALLS! SOMEONE CATCH THEM!");
				currentTrustfaller[channel.url] = {
					name: message._sender.nickname,
					catched: false,
					hasBeen10Secs: false
				};
				setTimeout(() => {
					if (!currentTrustfaller[channel.url].catched) {
						sendMsgWithChannel(channel, message._sender.nickname + " didn't get catched! Y'all are bad friends");
					}
					currentTrustfaller[channel.url].hasBeen10Secs = true;
				}, 10000);
				break;
			case "catch":
				if (isUndefined(currentTrustfaller[channel.url])) {
					sendMsgWithChannel(channel, message._sender.nickname + " catched abolutely nobody.");
					break;
				}
				if (currentTrustfaller[channel.url].hasBeen10Secs || currentTrustfaller[channel.url].catched) {
					sendMsgWithChannel(channel, message._sender.nickname + " catched abolutely nobody.");
					break;
				}
				if (currentTrustfaller[channel.url].name == message._sender.nickname) {
					sendMsgWithChannel(channel, message._sender.nickname + ", you can't catch yourself!");
					break;
				}
				sendMsgWithChannel(channel, message._sender.nickname + " catched " + currentTrustfaller[channel.url].name + "! Thank god!");
				currentTrustfaller[channel.url].catched = true;
				break;
			case "rng":
				if (Math.random() < 0.001) {
					sendMsgWithChannel(channel, "Your dice never landed.");	
					for (var i = 0; i < 10; i++) {
					}
				} else {
					sendMsgWithChannel(channel, (!isNaN(parseFloat(args[0])) && !isNaN(parseFloat(args[1]))) ? `Your dice landed on a ${Math.floor((Math.random() * ((parseFloat(args[1])+1)-parseFloat(args[0])))+parseFloat(args[0]))}!` : "These aren't valid numbers!");
				}
				break;
			case "roll":
			case "dice":
				sendMsgWithChannel(channel, `Your dice landed on a ${Math.floor((Math.random() * (7 - 1) + 1))}!`);
				break;
			default:
				if (!isUndefined(miscCommands[command.toLowerCase()])) {
					let returning = miscCommands[command.toLowerCase()][Math.floor(Math.random() * miscCommands[command.toLowerCase()].length)];
					let allArgsList = messageText.split(" ").slice(1);
					let allArgsString = stringFromList(allArgsList);
					let allArgsFromOneString = stringFromList(allArgsList.slice(1));
					let allArgsFromTwoString = stringFromList(allArgsList.slice(2));
					returning = returning.replace("%(SENDER)", message._sender.nickname);
					returning = returning.replace("%(ARG1)", args[0]);
					returning = returning.replace("%(ARG2)", args[1]);
					returning = returning.replace("%(ARG3)", args[2]);
					returning = returning.replace("%(ALLARGS)", allArgsString);
					returning = returning.replace("%(ALLARGSAFTER1)", allArgsFromOneString);
					returning = returning.replace("%(ALLARGSAFTER1)", allArgsFromTwoString);
					returning = returning.replace("%(SENDER)", message._sender.nickname);
					sendMsgWithChannel(channel, returning);
				}
				else {
					sendMsgWithChannel(channel, "Invalid input");
				}
				break;
			}
		}
	}

function looksLikeACommand(textToCheck) {
	switch (textToCheck.charAt(0)) {
		case "/":
		case "-":
		case "!":
		case "?":
		case "&":
			return true;
		default:
			return false;
	}
};

function userListContainsUser(userList, user) {
	for (let userToCheck of userList) {
		if (userToCheck.userId == user.userId) {
			return true;
		}
	}
	return false;
}

function stringFromList(list) {
	let returning = "";
	for (let i = 0; i < list.length; i++) {
		returning += list[i] + " ";
	}
	return returning;
}

function isUndefined(thing) {
	return typeof(thing) == "undefined";
}

function sendMsgWithChannel(channel, msg) {
	channel.sendUserMessage(msg.replace("@all", "@ all").replace("u/all", "u / all"), (message, error) => {
		if (error) {
			if (error.code != 900060) {
				console.warn(`An error occured while trying to send "${msg}" in the channel ${channel.name}`);
				console.warn(error);
			}
		}
	});
}

function trivia(channelUrl, channel) {
	if (timeOfSendingOfLastTrivia[channelUrl] + 20000 < Date.now() || isUndefined(timeOfSendingOfLastTrivia[channelUrl])) {
		axios.get("http://opentdb.com/api.php?amount=1").then((requestJson) => {
			let result = requestJson.data.results[0];
			result.question = unescapeHTML(result.question);
			let newMessage = triviaMessage.replace("%(CATEGORY)", result.category);
			newMessage = newMessage.replace("%(DIFFICULTY)", result.difficulty);
			if (result.type == "boolean") {
				newMessage = newMessage.replace("%(QUESTION)", "Yes Or No: " + result.question);
				newMessage = newMessage.replace("%(ANSWERS)", "");
			} else {
				newMessage = newMessage.replace("%(QUESTION)", result.question);
				let answers = [];
				answers.push(result.correct_answer);
				for (let o of result.incorrect_answers) {
					answers.push(o);
				}
				for (let i = answers.length - 1; i > 0; i--) {
					let j = Math.floor(Math.random() * (i + 1));
					[answers[i], answers[j]] = [answers[j], answers[i]];
				}
				let answersString = "";
				for (let i = 0; i < answers.length; i++) {
					if (i != 0) {
						answersString += ", ";
					}
					answersString += answers[i];
				}
				answersString = unescapeHTML(answersString);
				newMessage = newMessage.replace("%(ANSWERS)", "ANSWERS: " + answersString);
				timeOfSendingOfLastTrivia[channelUrl] = Date.now();
				firstTrivia = false;
				sendMsgWithChannel(channel, newMessage);
				currentAnswer = result.correct_answer;
			}
		});
	} else {
		sendMsgWithChannel(channel, "People are requesting trivia's way too fast! Please wait another " + (60 + Math.round((timeOfSendingOfLastTrivia[channelUrl] - Date.now()) / 1000)).toString() + " seconds.");
	}
}

function tanswer(channelUrl, channel) {
	if (isUndefined(timeOfSendingOfLastTrivia[channelUrl])) {
		sendMsgWithChannel(channel, "No Answer Yet ):");
		return;
	}
	if (timeOfSendingOfLastTrivia[channelUrl] + 15000 < Date.now()) {
		sb.GroupChannel.getChannel(channelUrl, function(groupChannel, error) {
			if (error) {
				return;
			}
			groupChannel.sendUserMessage("The anwser is: " + currentAnswer, (message, error) => {
				if (error) {
					console.error(error);
				}
			});
		});
	} else {
		channel.sendUserMessage("Please wait " + (30 + Math.round((timeOfSendingOfLastTrivia[channelUrl] - Date.now()) / 1000)).toString() + " seconds before requesting another trivia.", (message, error) => {
			if (error) {
				console.error(error);
			}
		});
	}
}

function unescapeHTML(str) {
	let htmlEntities = {
		nbsp: ' ',
		cent: '¢',
		pound: '£',
		yen: '¥',
		euro: '€',
		copy: '©',
		reg: '®',
		lt: '<',
		gt: '>',
		quot: '"',
		amp: '&',
		apos: '\'',
		prime: "\'",
		Prime: "\""
	};
	return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
		let match;

		if (entityCode in htmlEntities) {
			return htmlEntities[entityCode];
		} else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
			return String.fromCharCode(parseInt(match[1], 16));
		} else if (match = entityCode.match(/^#(\d+)$/)) {
			return String.fromCharCode(~~match[1]);
		} else {
			return entity;
		}
	});
}

function makerandomthing(length) {
	let result = '';
	let characters = '~-+=';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function sort(obj) {
	let arr = [];
	for (let name in obj) {
		arr.push({
			name,
			val: obj[name]
		})
	}
	let len = arr.length;
	for (let i = len - 1; i >= 0; i--) {
		for (let j = 1; j <= i; j++) {
			if (arr[j - 1].val > arr[j].val) {
				let temp = arr[j - 1];
				arr[j - 1] = arr[j];
				arr[j] = temp;
			}
		}
	}
	return arr;
}

ch.onUserReceivedInvitation = (channel, inviter, invitees) => {
	if (userListContainsUser(invitees, sb.currentUser)) {
		console.log("I've been invited to a channel!");
		channel.acceptInvitation(function() {
			sendMsgWithChannel(channel, "Hi! I'm CinchBot. I got invited to this chat. To get help using me, do -help.");
		});
		console.log(`I've accepted the invite to ${channel.name}`);
	}
};
sb.addChannelHandler("vsdfh64mc93mg0cn367vne4m50bn3b238", ch);
let messageInterval = setInterval(function() {
	newsMessage(1);
	memesMessage(1);
	caveMessage(1);
}, 1000 * 60 * 60 * 24);

function exitHandler(exit) {
	// todo - make bot send a warning message before shutting down
	if (exit) process.exit();
}

process.on('exit', exitHandler.bind(false));
process.on('SIGINT', exitHandler.bind(true));
process.on('SIGUSR1', exitHandler.bind(true));
process.on('SIGUSR2', exitHandler.bind(true));
process.on('uncaughtException', (err, origin) => {
	console.error(err);
	console.error(origin);
	exitHandler.bind(true);
});
