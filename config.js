const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}


module.exports = {
SESSION_ID: process.env.SESSION_ID === undefined ? 'HANSAMAL-MD=3ZUija6K#8Zzz2mnPLK7kPD7kzk77o-lPXkAD8S_XRpAvd3BN4QE' : process.env.SESSION_ID,
GITHUB_USER_NAME: process.env.GITHUB_USER_NAME === undefined ? 'hansamal312' : process.env.GITHUB_USER_NAME,
GITHUB_AUTH_TOKEN: process.env.GITHUB_AUTH_TOKEN === undefined ? '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' : process.env.GITHUB_AUTH_TOKEN,        
OWNER_NUMBER: process.env.OWNER_NUMBER === undefined ? '94711262551' : process.env.OWNER_NUMBER,
STATUS_VIEW: process.env.STATUS_VIEW === undefined ? 'true' : process.env.STATUS_VIEW
};
