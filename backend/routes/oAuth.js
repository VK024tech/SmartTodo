//import passport library
const passport = require("passport");

//import dotenv for secrets
require("dotenv").config();

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

//to register the defined google strategy
require("../config/openAuth");

//token refresh
const reload = require("../config/tokenRefresh");

//the route where user will be redirevcted to autheticate with oauth
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

///route the google will sent back user after authenticating
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "https://intelli-do-czk5.vercel.app/",
  }),
  (req, res) => {
    // console.log('coming from callback',req)
    const { token, accessToken, refreshToken, user } = req.user;

    res.redirect(`https://intelli-do-czk5.vercel.app/dashboard?jwt=${token}`);
  }
);

///route to fetch emails
router.get("/emails", authMiddleware, async (req, res) => {
  try {
    const userID = req.headers.userId;
    const getUser = await user.findOne({
      _id: userID,
    });

    const accessToken = getUser.accessToken;
    const messages = await getFullMessage(accessToken);

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      error: error.data,
      msg: "unable to fetch messages due to token"
    });
  }
});

// route to refrech access tokens using the refresh tokens
router.get("/refreshToken", authMiddleware, async (req, res) => {
  try {
    const userID = req.headers.userId;
    const getUser = await user.findOne({
      _id: userID,
    });

    const newtoken = await reload.refreshToken(
      getUser.refreshToken,
      getUser.googleID
    );

    const SaveToken = await user.findByIdAndUpdate(userID, {
      accessToken: newtoken,
    });

    // console.log("this is new token:", newtoken);

    res.json("Successfull");
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
