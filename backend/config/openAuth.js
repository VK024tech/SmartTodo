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

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ["profile", "email"],
      accessType: "offline",
    //   prompt: "consent",
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
        console.log("New user registered");
        
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
        console.log(
          "User with Email and password, google detailed added and logged in"
        );
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
        console.log("Existing user with email and google id");
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
