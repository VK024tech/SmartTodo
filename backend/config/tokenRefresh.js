const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");

//import db schema
const { todo, user } = require("../database/schemadb");

async function refreshToken(refreshToken, userID) {
    const getUser = await user.findOne({
      googleID: userID,
    });
  const oAuth2Client  = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // "/auth/google/callback"
  );
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  const  tokenInfo  = await oAuth2Client.getAccessToken();
  const newToken = tokenInfo.token


  const updateUser = await user.findByIdAndUpdate(getUser._id, {
    accessToken: newToken,
  });

  return newToken;
}

module.exports ={ refreshToken };
