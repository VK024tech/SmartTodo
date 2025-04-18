//import passport library
const passport = require("passport");

//import google strategy for google auth
const GoogleStrategy = require("passport-google-oauth20").Strategy;

//for stateless user autherization instead of using passport native(serealizing & deserealizing)
const jwt = require("jsonwebtoken");

//import db schema
const { todo, user } = require("../database/schemadb");

//import express
const express = require("express");

//get router from express
const router = express.Router();

//get read gmail message function
const {getMessageIds, getFullMessage} = require('./gmail');

//for verifying jwt token
const { authMiddleware } = require("../middleware/authenticate");
const { decode } = require("punycode");

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      //check if the user is present in database or create a new user

      const currentUser = await user.findOne({
        googleID: profile.id,
      });
      const currentUserWithEmail = await user.findOne({
        email: profile.email,
      });

      if (!currentUser && !currentUserWithEmail) {
        console.log("im nothing running");
        console.log(refreshToken);
        const newUser = await user.create({
          fullname: profile.displayName,
          username: profile.name.givenName,
          googleID: profile.id,
          picture: profile.photos[0].value,
          email: profile.emails[0].value,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });

        ///jwt creation for newuser
        const token = jwt.sign(
          {
            userId: newUser.googleID,
          },
          process.env.SECRET
        );

        done(null, { user: newUser, token, accessToken, refreshToken });
      } else if (!currentUser && currentUserWithEmail) {
        console.log("im signgle running");
        const existinguser = await user.findByIdAndUpdate(
          currentUserWithEmail._id,
          {
            googleID: profile.id,
            picture: profile.photos[0].value,
            accessToken: accessToken,
            refreshToken: refreshToken,
          }
        );

        ///jwt creation for existinguser
        const token = jwt.sign(
          {
            userId: existinguser.googleID,
          },
          process.env.SECRET
        );

        done(null, { user: existinguser, token, accessToken, refreshToken });
      } else {
        console.log("im both running");
        const existinguser = await user.findOne({
          googleID: profile.id,
        });

        ///jwt creation for existinguser
        const token = jwt.sign(
          {
            userId: existinguser.googleID,
          },
          process.env.SECRET
        );

        done(null, { user: existinguser, token, accessToken, refreshToken });
      }
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/user/signup",
  }),
  (req, res) => {
    const { token, accessToken, refreshToken, user } = req.user;
    res.json({
      token: token,
    });
  }
);

router.get("/emails",authMiddleware, async (req,res)=>{
    
    const getUser = await user.findOne({
        googleID: req.headers.userId
    })

    const accessToken = getUser.accessToken
    const messages = await getFullMessage(accessToken)
    // const decode = Buffer.from(messages, 'base64').toString('utf-8')
    // console.log(messages)
    res.json(messages)

});



module.exports = router;
