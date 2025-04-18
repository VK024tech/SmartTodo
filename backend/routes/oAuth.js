//import passport library
const passport = require("passport");

//import db schema
const { todo, user } = require("../database/schemadb");

//import google strategy for google auth
const GoogleStrategy = require("passport-google-oauth20").Strategy;

//import express
const express = require("express");

//get router from express
const router = express.Router();

//get read gmail message function
const { getFullMessage } = require("../config/emailFetch");

//for verifying jwt token
const { authMiddleware } = require("../middleware/authenticate");

//to register the defined google stretegy 
require('../config/openAuth')

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

router.get("/emails", authMiddleware, async (req, res) => {
  const getUser = await user.findOne({
    googleID: req.headers.userId,
  });

  const accessToken = getUser.accessToken;
  const messages = await getFullMessage(accessToken);
  // const decode = Buffer.from(messages, 'base64').toString('utf-8')
  // console.log(messages)
  res.json(messages);
});

module.exports = router;
