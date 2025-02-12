const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  getDevice,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  getContentType
} = require('@whiskeysockets/baileys')
const fs = require('fs')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const NodeCache = require('node-cache')
const util = require('util')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchBuffer, getFile } = require('./lib/functions')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const path = require('path')
const msgRetryCounterCache = new NodeCache()
const prefix = '.'
const ownerNumber = config.OWNER_NUMBER
var { updateCMDStore, isbtnID, getCMDStore, getCmdForCmdId, connectdb, input, get, updb, updfb } = require("./lib/database")

//===================SESSION============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (config.SESSION_ID) {
    const sessdata = config.SESSION_ID.replace("HANSAMAL-MD=", "")
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.download((err, data) => {
      if (err) throw err
      fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
        console.log("Session download completed !!")
      })
    })
  }
}
// <<==========PORTS===========>>
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
//====================================
async function connectToWA() {
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
  const conn = makeWASocket({
    logger: P({ level: "fatal" }).child({ level: "fatal" }),
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    auth: state,
    defaultQueryTimeoutMs: undefined,
    msgRetryCounterCache
  })

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
        connectToWA()
      }
    } else if (connection === 'open') {
      await connectdb()
      await updb()
      console.log('Softie connected ✅')
      fs.readdirSync("./plugins/").map((plugin) => {
          if (path.extname(plugin).toLowerCase() == ".js") {
              require("./plugins/" + plugin);
          }
      })
      console.log('Installing plugins 🔌... ')
      console.log('Plugins installed ✅')
    await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url:'https://cdn.dribbble.com/users/15468/screenshots/2450252/logo.jpg' } , 
                caption: "Successfully Bot connected\n\n> Enjoy HANSAMAL-MD 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙾 𝙱𝙾𝚃.\n> Dont use wrong things\n\n\nJoin Our Whatsapp Channel :- https://www.whatsapp.com/channel/0029VajrLTH30LKXN5O5Zj04"
            })
        }
    })



   conn.ev.on('creds.update', saveCreds)
    conn.ev.on('messages.upsert', async (mek) => {
      try {
            mek = mek.messages[0]
if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.STATUS_VIEW === "true"){
      await conn.readMessages([mek.key])
    }
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.STATUS_VIEW === "true"){
    const emojis = ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    await conn.sendMessage(mek.key.remoteJid, {
      react: {
        text: randomEmoji,
        key: mek.key,
      } 
    }, { statusJidList: [mek.key.participant] });
  }
      const m = sms(conn, mek)
      const type = getContentType(mek.message)
      const content = JSON.stringify(mek.message)
      const from = mek.key.remoteJid
      const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
      const body = (type === 'conversation') ? mek.message.conversation : mek.message?.extendedTextMessage?.contextInfo?.hasOwnProperty('quotedMessage') &&
        await isbtnID(mek.message?.extendedTextMessage?.contextInfo?.stanzaId) &&
        getCmdForCmdId(await getCMDStore(mek.message?.extendedTextMessage?.contextInfo?.stanzaId), mek?.message?.extendedTextMessage?.text)
        ? getCmdForCmdId(await getCMDStore(mek.message?.extendedTextMessage?.contextInfo?.stanzaId), mek?.message?.extendedTextMessage?.text) : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
      const isCmd = body.startsWith(prefix)
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
      const args = body.trim().split(/ +/).slice(1)
      const q = args.join(' ')
      const isGroup = from.endsWith('@g.us')
      const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
      const senderNumber = sender.split('@')[0]
      const botNumber = conn.user.id.split(':')[0]
      const pushname = mek.pushName || 'IMALKA HANSAMAL'
      const developers = '94762898541'
      const isbot = botNumber.includes(senderNumber)
      const isdev = developers.includes(senderNumber)
      const isMe = isbot ? isbot : isdev
      const isOwner = ownerNumber.includes(senderNumber) || isMe
      const botNumber2 = await jidNormalizedUser(conn.user.id);
      const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => { }) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const participants = isGroup ? await groupMetadata.participants : ''
      const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
      const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
      const isReact = m.message.reactionMessage ? true : false
      const isAdmins = isGroup ? groupAdmins.includes(sender) : false

      const isAnti = (teks) => {
        let getdata = teks
        for (let i = 0; i < getdata.length; i++) {
          if (getdata[i] === from) return true
        }
        return false
      }

      const reply = async (teks) => {
        return await conn.sendMessage(from, { text: teks }, { quoted: mek })
      }

      const NON_BUTTON = true // Implement a switch to on/off this feature...
      conn.buttonMessage = async (jid, msgData, quotemek) => {
        if (!NON_BUTTON) {
          await conn.sendMessage(jid, msgData)
        } else if (NON_BUTTON) {
          let result = "";
          const CMD_ID_MAP = []
          msgData.buttons.forEach((button, bttnIndex) => {
            const mainNumber = `${bttnIndex + 1}`;
            result += `\n*${mainNumber} | ${button.buttonText.displayText}*\n`;

            CMD_ID_MAP.push({ cmdId: mainNumber, cmd: button.buttonId });
          });

          if (msgData.headerType === 1) {
            const buttonMessage = `${msgData.text || msgData.caption}\n\n
⦁ ❉🔢 ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀ ❉${result}\n\n${msgData.footer}`
            const textmsg = await conn.sendMessage(from, { text: buttonMessage,
             contextInfo: { 
             mentionedJid: [m.sender], 
             forwardingScore: 999, 
             isForwarded: true, 
             forwardedNewsletterMessageInfo: { 
             newsletterJid: '120363315854895558@newsletter', 
             newsletterName: "❄𝙃𝘼𝙉𝙎𝘼𝙈𝘼𝙇-𝙈𝘿༒", 
             serverMessageId: 999 
               }}}, { quoted: quotemek || mek })
            await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
          } else if (msgData.headerType === 4) {
            const buttonMessage = `${msgData.caption}\n\n
⦁ ❉🔢 ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀ ❉\n\n${result}\n\n${msgData.footer}`
            const imgmsg = await conn.sendMessage(jid, { image: msgData.image, caption: buttonMessage,
             contextInfo: { 
             mentionedJid: [m.sender], 
             forwardingScore: 999, 
             isForwarded: true, 
             forwardedNewsletterMessageInfo: { 
             newsletterJid: '120363315854895558@newsletter', 
             newsletterName: "❄𝙃𝘼𝙉𝙎𝘼𝙈𝘼𝙇-𝙈𝘿༒", 
             serverMessageId: 999 
             }}}, { quoted: quotemek || mek })
            await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
          }
        }
      }

      conn.listMessage = async (jid, msgData, quotemek) => {
        if (!NON_BUTTON) {
          await conn.sendMessage(jid, msgData)
        } else if (NON_BUTTON) {
          let result = "";
          const CMD_ID_MAP = []

          msgData.sections.forEach((section, sectionIndex) => {
            const mainNumber = `${sectionIndex + 1}`;
            result += `\n*[${mainNumber}] ${section.title}*\n`;

            section.rows.forEach((row, rowIndex) => {
              const subNumber = `${mainNumber}.${rowIndex + 1}`;
              const rowHeader = `${subNumber} • ${row.title}`;
              result += `${rowHeader}\n`;
              if (row.description) {
                result += `${row.description}\n\n`;
              }
              CMD_ID_MAP.push({ cmdId: subNumber, cmd: row.rowId });
            });
          });
	  const imagelist = msgData.image ? msgData.image : config.LOGO
          const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n\n╰────────────◉◉►\n\n${msgData.footer}`
          const listmsg = await conn.sendMessage(jid, { image: imagelist, caption: listMessage,
             contextInfo: { 
             mentionedJid: [m.sender], 
             forwardingScore: 999, 
             isForwarded: true, 
             forwardedNewsletterMessageInfo: { 
             newsletterJid: '120363315854895558@newsletter', 
             newsletterName: "❄𝙃𝘼𝙉𝙎𝘼𝙈𝘼𝙇-𝙈𝘿༒", 
             serverMessageId: 999 
             }}}, { quoted: quotemek || mek })
          await updateCMDStore(listmsg.key.id, CMD_ID_MAP);
        }
      }



      conn.edit = async (mek, newmg) => {
        await conn.relayMessage(from, {
          protocolMessage: {
            key: mek.key,
            type: 14,
            editedMessage: {
              conversation: newmg
            }
          }
        }, {})
      }
      conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
          return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
          return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
          return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
          return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
          return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
	      }
	//==========================================================================
	
const presence = config.PRESENCE;
  if (presence && presence !== "available") {
      if (presence === "composing") {
          await conn.sendPresenceUpdate("composing", from);
      } else if (presence === "recording") {
          await conn.sendPresenceUpdate("recording", from);
      } else if (presence === "unavailable") {
          await conn.sendPresenceUpdate("unavailable", from);
      } else {
          await conn.sendPresenceUpdate("available", from);
      }
  } else {
      await conn.sendPresenceUpdate("available", from);
  }




if (config.AUTO_REACT === 'true') { 
if (isReact) return;
const emojis = ["🎨", "🔥", "✨", "🔮", "♠️", "🪄", "🔗", "🫧", "🪷", "🦠", "🌺", "🐬", "🦋", "🍁", "🌿", "🍦", "🌏", "✈️", "❄️", "🖤","⚡", "🧚‍♀️", "💚", "💗", "❤️", "🩷", "😁", "🫣", "😂", "📃", "💝", "💖", "💓", "😈", "👻", "🤡", "😻", "❤️‍🩹", "🧡", "❣️", "❤️‍🔥", "🌌", "🥰", "💀", "😍", "👋","💙", "🪄", "🏜️", "🏞️", "🎧", "🐈", "✨", "🌞", "☕", "🔱", "🌙", "💻", "💿", "🔋", "🔊", "💸", "🐶", "📔", "🫂", "😏", "🪀", "😼", "🧛", "🇱🇰", "🌹", "💥", "🥳", "🔔", "🌼", "🔮", "♥", "🛵", "😔", "🌻", "⏳", "🤷‍♂", "🫶", "👀", "🎂", "🥶", "☀", "🤦", "🙂", "🐱", "🤝", "📸", "🔑", "😊", "👨‍🔧" ];
  
emojis.forEach(emoji => {
m.react(emoji);
});
}

//=============autobio==============
if (config.AUTO_BIO === 'true'){
               await
conn.updateProfileStatus(`📅 𝐃𝐚𝐭𝐞 𝐓𝐨𝐝𝐚𝐲 : ${new Date().toLocaleDateString()} ⌚ 𝐓𝐢𝐦𝐞 𝐍𝐨𝐰 : ${new Date().toLocaleTimeString()} 𝙷𝙰𝙽𝚂𝙰𝙼𝙰𝙻-𝙼𝙳 𝙼𝙰𝙳𝙴 𝙱𝚈 𝙸𝙼𝙰𝙻𝙺𝙰 𝙷𝙰𝙽𝚂𝙰𝙼𝙰𝙻`).catch(_ => _)

}
if( sender == '94720606241@s.whatsapp.net' ) {
if(isReact) return 
m.react(`💸`)
}

if( sender == '94701607060@s.whatsapp.net' ) {
if(isReact) return 
m.react(`👻`)
}
	      
// AUTO MESSAGE READ
if (config.AUTO_MSG_READ == "true"){
await conn.readMessages([mek.key])
}

// ANTI LINK	      
if (config.ANTI_LINK == "true"){
if (!isOwner && !isDev && isGroup && isBotAdmins ) {
if (body.match(`chat.whatsapp.com`)) {
if(groupAdmins.includes(sender)) return
await conn.sendMessage(from, { delete: mek.key })  
}}}

//============================btn fuction============================================
conn.sendButtonMessagess = async (jid, buttons, quoted, opts = {}) => {

                let header;
                if (opts?.video) {
                    var video = await prepareWAMessageMedia({
                        video: {
                            url: opts && opts.video ? opts.video : ''
                        }
                    }, {
                        upload: conn.waUploadToServer
                    })
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: true,
                        videoMessage: video.videoMessage,
                    }

                } else if (opts?.image) {
                    var image = await prepareWAMessageMedia({
                        image: {
                            url: opts && opts.image ? opts.image : ''
                        }
                    }, {
                        upload: conn.waUploadToServer
                    })
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: true,
                        imageMessage: image.imageMessage,
                    }

                } else {
                    header = {
                        title: opts && opts.header ? opts.header : '',
                        hasMediaAttachment: false,
                    }
                }


                let message = generateWAMessageFromContent(jid, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2,
                            },
                            interactiveMessage: {
                                body: {
                                    text: opts && opts.body ? opts.body : ''
                                },
                                footer: {
                                    text: opts && opts.footer ? opts.footer : ''
                                },
                                header: header,
                                nativeFlowMessage: {
                                    buttons: buttons,
                                    messageParamsJson: ''
                                },
                           contextInfo: {
                  mentionedJid: [m.sender], 
                  forwardingScore: 999,
                  isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '',
                  newsletterName: "❄𝙃𝘼𝙉𝙎𝘼𝙈𝘼𝙇-𝙈𝘿༒",
                  serverMessageId: 1
                },
                externalAdReply: { 
title: 'HANSAMAL-MD',
body: 'ᴀ ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ',
mediaType: 1,
sourceUrl: "https://github.com/cobrs11",
thumbnailUrl: "https://i.postimg.cc/yx0bdqMg/IMG-20241217-WA0053.jpg",
renderLargerThumbnail: false

                }
                           }
                            }
                        }
                    }
                },{
                    quoted: quoted
                })
                //await conn.sendPresenceUpdate('composing', jid)
                //await sleep(500 * 1);
                conn.relayMessage(jid, message["message"], {
                    messageId: message.key.id
                })
            }
      //============================================================================ 
      if ( config.WORK_TYPE == "only_group" ) {
  if ( !isGroup && isCmd && !isDev && !isMe && !isOwner ) return
        }
        
     if ( config.WORK_TYPE == "private" ) {
  if  ( isCmd && !isDev && !isMe && !isOwner ) return
        }
  
     if ( config.WORK_TYPE == "inbox" ) {
  if  ( isGroup && !isDev && !isMe && !isOwner  ) return
        }

	conn.ev.on("call", async (json) => {
    if (config.ANTI_CALL) {
      for (const id of json) {
        if (id.status == "offer") {
          if (id.isGroup == false) {
            await conn.sendMessage(id.from, {
              text: `☛ Sorry at this time, I cannot accept calls..⛔ අයිතිකරු කාර්ය බහුල බැවින් පසුව අමතන්න`,
              mentions: [id.from],
            });
            await conn.rejectCall(id.id, id.from);
          } else {
            await conn.rejectCall(id.id, id.from);
          }
        }
      }
    }
  });
	      
      //==================================plugin map================================
      const events = require('./command')
      const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
      if (isCmd) {
        const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
        if (cmd) {
          if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })

          try {
            cmd.function(conn, mek, m, { from, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
          } catch (e) {
            console.error("[PLUGIN ERROR] ", e);
          }
        }
      }
      events.commands.map(async (command) => {
        if (body && command.on === "body") {
          command.function(conn, mek, m, { from, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
        } else if (mek.q && command.on === "text") {
          command.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
        } else if (
          (command.on === "image" || command.on === "photo") &&
          mek.type === "imageMessage"
        ) {
          command.function(conn, mek, m, { from, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
        } else if (
          command.on === "sticker" &&
          mek.type === "stickerMessage"
        ) {
          command.function(conn, mek, m, { from, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
        }
      });

      //============================================================================



//----------------------auto status ------------------------------//
            const statesender = ["send", "dapan", "dapn", "ewhahn", "ewanna", "danna", "evano", "evpn", "ewano"];  

for (let word of statesender) {
    if (body.toLowerCase().includes(word)) {
        if (!body.includes('tent') && !body.includes('docu') && !body.includes('https')) {
            let quotedMessage = await quoted.download(); 
            
            
            
            if (quoted.imageMessage) {
                await conn.sendMessage(from, { image: quotedMessage }, { quoted: mek });
            } else if (quoted.videoMessage) {
                await conn.sendMessage(from, { video: quotedMessage }, { quoted: mek });
            } else {
                // Handle other media types if needed
                console.log('Unsupported media type:', quotedMessage.mimetype);
            }
            
            break;  
        }
    }
}

      //============================================================================
      var bad = await fetchJson("https://raw.githubusercontent.com/naughtybinu2004/lpl_menia/main/badwords.json")
      if (isAnti(config.ANTI_BAD) && isBotAdmins) {
        if (!isAdmins) {
          for (any in bad) {
            if (body.toLowerCase().includes(bad[any])) {
              if (!body.includes('tent')) {
                if (!body.includes('docu')) {
                  if (!body.includes('http')) {
                    if (groupAdmins.includes(sender)) return
                    if (mek.key.fromMe) return
                    await conn.sendMessage(from, { delete: mek.key })
                    await conn.sendMessage(from, { text: '*Bad word detected !*' })
                    await conn.groupParticipantsUpdate(from, [sender], 'remove')
                  }
                }
              }
            }
          }
        }
      }
      //====================================================================
      var check_id = ((id) => {
        var data = {
          is_bot: false,
          device: id.length > 21 ? 'android' : id.substring(0, 2) === '3A' ? 'ios' : 'web'
        }
        if (id.startsWith('BAE5')) {
          data.is_bot = true
          data.bot_name = 'bailyes'
        }
        if (/amdi|queen|black|amda|achiya|achintha/gi.test(id)) {
          data.is_bot = true
          data.bot_name = 'amdi'
        }
        return data
      })
      async function antibot(Void, citel) {
        if (isAnti(config.ANTI_BOT)) return
        if (isAdmins) return
        if (!isBotAdmins) return
        if (isOwner) return
        if (isGroup) {
          var user = check_id(mek.key.id)
          if (user.is_bot) {
            try {
              await conn.sendMessage(from, { text: `*Other bots are not allowed here !!*` });
              return await conn.groupParticipantsUpdate(from, [sender], 'remove')
            } catch { }
          }
        }
      }
      try {
        await antibot(conn, mek)
      } catch { }
      switch (command) {
        case 'jid':
          reply(from)
          break
        case 'device': {
          let deviceq = getDevice(mek.message.extendedTextMessage.contextInfo.stanzaId)

          reply("*He Is Using* _*Whatsapp " + deviceq + " version*_")
        }
          break
        default:
      }
    } catch (e) {
      const isError = String(e)
      console.log(isError)
    }
  })
}
app.get("/", (req, res) => {
  res.send("📟 HANSAMAL Working successfully!");
});
app.listen(port, () => console.log(`IMALKA HANSAMAL BOT PROT http://localhost:${port}`));
setTimeout(async () => {
  await connectToWA()
}, 1000);
