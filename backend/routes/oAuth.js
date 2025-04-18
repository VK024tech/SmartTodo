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
require("../config/openAuth");

//token refresh
const reload = require("../config/tokenRefresh");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    session: false,
    accessType: "offline",
    prompt: "consent",
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
  try {
    const userID = req.headers.userId;
    const getUser = await user.findOne({
      googleID: userID,
    });

    const accessToken = getUser.accessToken;
    const messages = await getFullMessage(accessToken);

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.get("/refreshToken", authMiddleware, async (req, res) => {
  try {
    const userID = req.headers.userId;
    const getUser = await user.findOne({
      googleID: userID,
    });

    const newtoken = await reload.refreshToken(getUser.refreshToken, userID);
    console.log(newtoken);

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
