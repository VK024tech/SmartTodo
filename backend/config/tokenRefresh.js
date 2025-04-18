const google = require("google-auth-library");

//import db schema
const { todo, user } = require("../database/schemadb");

async function refressToken(refreshToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "/auth/google/callback"
  );
  auth.setCredentials({ refresh_token: refreshToken });
  const { token } = await auth.getAccessToken();

  const getUser = await user.findOne({
    googleID: req.headers.userId,
  });

  const updateUser = await user.findByIdAndUpdate(getUser._id, {
    accessToken: token,
  });

  return token;
}

module.exports = refressToken;
