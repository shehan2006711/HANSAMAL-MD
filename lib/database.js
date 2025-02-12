const fetch = require('node-fetch');
const axios = require('axios');
const config = require('../config')

// Replace these with your GitHub credentials
const userName = config.GITHUB_USER_NAME;
const token = config.GITHUB_AUTH_TOKEN;
const repoName = 'HANSAMAL-MD-DATABASE';

// Function to fetch data from GitHub API
async function githubApiRequest(url, method = 'GET', data = {}) {
  try {
    const options = {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${userName}:${token}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET' || method === 'HEAD') {
      // Remove the body property for GET and HEAD requests
      delete options.body;
    } else {
      // For other methods (POST, PUT, DELETE, etc.), add the JSON.stringify data to the request body
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    return await response.json();
  } catch (error) {
    throw new Error(`GitHub API request failed: ${error.message}`);
  }
}


async function checkRepoAvailability() {
  try {
    const apiUrl = `https://api.github.com/repos/${userName}/${repoName}`;
const headers = {
  Authorization: `Bearer ${token}`,
};

    const response = await axios.get(apiUrl, { headers });

    if (response.status === 200) {
      return true
    } else {
     return false
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false
    } else {
      console.error('Error:', error.message);
    }
  }
}


// 1. Function to search GitHub file
async function githubSearchFile(filePath, fileName) {
  const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${filePath}?ref=main`;
  const data = await githubApiRequest(url);
  return data.find((file) => file.name === fileName);
}

// 2. Function to create a new GitHub file
async function githubCreateNewFile(filePath, fileName, content) {
  const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${filePath}/${fileName}`;
  const data = {
    message: `Create new file: ${fileName}`,
    content: Buffer.from(content).toString('base64'),
  };
  return await githubApiRequest(url, 'PUT', data);
}

// 3. Function to delete a GitHub file
async function githubDeleteFile(filePath, fileName) {
  const file = await githubSearchFile(filePath, fileName);
  if (!file) throw new Error('File not found on GitHub.');
  
  const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${filePath}/${fileName}`;
  const data = {
    message: `Delete file: ${fileName}`,
    sha: file.sha,
  };
  await githubApiRequest(url, 'DELETE', data);
}

// 4. Function to get GitHub file content
async function githubGetFileContent(filePath, fileName) {
  const file = await githubSearchFile(filePath, fileName);
  if (!file) throw new Error('File not found on GitHub.');
  
  const url = file.download_url;
  const response = await fetch(url);
  return await response.text();
}

// 5. Function to clear GitHub file content and add new content
async function githubClearAndWriteFile(filePath, fileName, content) {
  const file = await githubSearchFile(filePath, fileName);
  if (!file) {
    await githubCreateNewFile(fileName, content);
  } else {
    const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${filePath}/${fileName}`;
    const data = {
      message: `Modify file: ${fileName}`,
      content: Buffer.from(content).toString('base64'),
      sha: file.sha,
    };
    return await githubApiRequest(url, 'PUT', data);
  }
}

// 6. Function to delete an existing GitHub file and upload a new one
async function githubDeleteAndUploadFile(fileName, newContent) {
  await githubDeleteFile(fileName);
  await githubCreateNewFile(fileName, newContent);
}

//========================================
async function updateCMDStore(MsgID , CmdID) {
try { 
let olds = JSON.parse(await githubGetFileContent("Non-Btn",'data.json'))
olds.push({[MsgID]:CmdID})
var add = await githubClearAndWriteFile('Non-Btn','data.json',JSON.stringify(olds, null, 2))
return true
} catch (e) {
console.log( e)
return false
}
}

async function isbtnID(MsgID){
try{
let olds = JSON.parse(await githubGetFileContent("Non-Btn",'data.json'))
let foundData = null;
for (const item of olds) {
  if (item[MsgID]) {
    foundData = item[MsgID];
    break;
  }
}
if(foundData) return true
else return false
} catch(e){
return false
}
}

async function getCMDStore(MsgID) {
try { 
let olds = JSON.parse(await githubGetFileContent("Non-Btn",'data.json'))
let foundData = null;
for (const item of olds) {
  if (item[MsgID]) {
    foundData = item[MsgID];
    break;
  }
}
return foundData
} catch (e) {
console.log( e)
return false
}
} 

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
  const result = CMD_ID_MAP.find((entry) => entry.cmdId === cmdId);
  return result ? result.cmd : null;
}

const connectdb = async () => {
let availabilityrepo = await checkRepoAvailability()
if(!availabilityrepo){
    const response = await axios.post(
      'https://api.github.com/user/repos',
      {
        name: repoName,
        private: true, // Set to true for a private repo
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
let get = {
STATUS_VIEW: true,
PRESENCE: false,
AUTO_REACT: false,
ONLY_GROUP: false,
AUTO_BIO: false,
WORK_TYPE: false,
ANTI_CALL: false,
FOOTER: '© _ʜᴀɴꜱᴀᴍᴀʟ - ᴍᴅ ʙᴏᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ *ɪᴍᴀʟᴋᴀ ʜᴀɴꜱᴀᴍᴀʟ*_ ❄',
LOGO: `https://i.postimg.cc/CxR8FW9X/IMG-20241217-WA0053.jpg` 
}
await githubCreateNewFile("settings", "settings.json",JSON.stringify(get))
let btnget = [
]
await githubCreateNewFile("Non-Btn","data.json",JSON.stringify(btnget))
console.log(`Database "${repoName}" created successfully 🛢️`);
}
else console.log("📶Wait Database create...📁")
};
//=====================================================================
async function input(setting, data){
let get = JSON.parse(await githubGetFileContent("settings", "settings.json"))
 
if (setting == "STATUS_VIEW") {
get.STATUS_VIEW = data
config.STATUS_VIEW = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "PRESENCE") {
get.PRESENCE = data
config.PRESENCE = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "AUTO_REACT") {
get.AUTO_REACT = data
config.AUTO_REACT = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "ONLY_GROUP") {
get.WORK_TYPE = data
config.WORK_TYPE = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "ANTI_CALL") {
get.ANTI_CALL = data
config.ANTI_CALL = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "AUTO_BIO") {
get.AUTO_BIO = data
config.AUTO_BIO = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "FOOTER") {
get.FOOTER = data
config.FOOTER = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} else if (setting == "LOGO") {
get.LOGO = data
config.LOGO = data
return await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
} 

}

async function get(setting){
let get = JSON.parse(await githubGetFileContent("settings", "settings.json"))
 
if (setting == "STATUS_VIEW") {
return get.STATUS_VIEW
} else if (setting == "PRESENCE") {
return get.PRESENCE
} else if (setting == "AUTO_REACT") {
return get.AUTO_REACT
} else if (setting == "WORK_TYPE") {
return get.WORK_TYPE
} else if (setting == "ANTI_CALL") {
return get.ANTI_CALL
} else if (setting == "AUTO_BIO") {
return get.AUTO_BIO
} else if (setting == "FOOTER") {
return get.FOOTER
} else if (setting == "LOGO") {
return get.LOGO
} 

}

async function updb(){
let get = JSON.parse(await githubGetFileContent("settings", "settings.json"))
 
config.STATUS_VIEW = get.STATUS_VIEW
config.PRESENCE = get.PRESENCE
config.AUTO_REACT = get.AUTO_REACT
config.FOOTER = get.FOOTER
config.LOGO = get.LOGO
config.AUTO_BIO = get.AUTO_BIO
config.WORK_TYPE = get.WORK_TYPE
config.ANTI_CALL = get.ANTI_CALL
console.log("🔱Database writed ✅")
}

async function updfb(){
let get = {
STATUS_VIEW: true,
PRESENCE: false,
AUTO_REACT: false,
WORK_TYPE: false,
ANTI_CALL: false,
ALIVE: `default`,
FOOTER: '© _ʜᴀɴꜱᴀᴍᴀʟ - ᴍᴅ ʙᴏᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ *ɪᴍᴀʟᴋᴀ ʜᴀɴꜱᴀᴍᴀʟ*_ ❄',
LOGO: `https://i.postimg.cc/CxR8FW9X/IMG-20241217-WA0053.jpg`}
await githubClearAndWriteFile("settings", "settings.json",JSON.stringify(get))
config.STATUS_VIEW = true
config.PRESENCE = false
config.AUTO_REACT = false
config.FOOTER = '© _ʜᴀɴꜱᴀᴍᴀʟ - ᴍᴅ ʙᴏᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ *ɪᴍᴀʟᴋᴀ ʜᴀɴꜱᴀᴍᴀʟ*_ ❄'
config.LOGO = `https://i.postimg.cc/CxR8FW9X/IMG-20241217-WA0053.jpg` 
config.AUTO_BIO = false
config.WORK_TYPE = false
config.ANTI_CALL = false
console.log("🔰Database created successful...☑️")
}

async function upresbtn(){
let btnget = [
]
await githubClearAndWriteFile("Non-Btn","data.json",JSON.stringify(btnget))
}
module.exports = { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get,updb,updfb,upresbtn }
