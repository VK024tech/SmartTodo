const { google } = require("googleapis");


async function getMessageIds(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "category:primary",
      labelIds: ["INBOX"],
      maxResults: 25,
    });
    return response.data.messages || [];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getFullMessage(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const message = await getMessageIds(accessToken);

  const emails = [];

  for (let i = 0; i < message.length; i++) {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: message[i].id,
      format: "full",
    });

    if (response.data.payload.parts) {
      for (const part of response.data.payload.parts) {
        if (part.mimeType === "text/plain") {
          if (part.body && part.body.data) {
            const decode = Buffer.from(part.body.data, "base64").toString(
              "utf-8"
            );
             emails.push({ i: decode });
            //   return decode;
          } else {
            console.log("none") 
          }
        } else {
          console.log("none") 
        }
      }
    } else {
      if (response.data.payload.mimeType === "text/plain") {
        if (response.data.payload.body && response.data.payload.body.data) {
          const decode = Buffer.from(
            response.data.payload.body.data,
            "base64"
          ).toString("utf-8");
          emails.push({ i: decode });
          // return decode;
        } else {
          console.log("none") 
        }
      }
      {
        console.log("none") 
      }
    }
  }

  console.log('messages are')
  console.log(emails);
  return emails
}

module.exports = { getMessageIds, getFullMessage };
