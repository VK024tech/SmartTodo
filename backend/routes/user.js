//import express
const express = require("express");

//get router from express
const router = express.Router();

//import zod for validation
const z = require("zod");

//import mongoose  for mongodb use
const mongoose = require("mongoose");

//import db schema
const { user } = require("../database/schemadb");

//bcrypt for hashing password
const bcrypt = require("bcrypt");

//jsonwebtoken for authentication
const jwt = require("jsonwebtoken");

//schema for validation
const signUpZod = z.object({
  name: z.string(),
  username: z.string({
    message: "username not available, use different username",
  }),
  email: z.string().email({ message: "invalid email address" }),
  password: z.string(),
});

const signInZod = z.object({
  email: z.string().email({ message: "invalid email address" }),
  password: z.string(),
});

//route for signup
router.post("/signup", async (req, res) => {
  const userInfo = req.body;
  const validate = signUpZod.safeParse(userInfo);

  if (!validate.success) {
    return res.status(400).send(validate.error.issues[0].message);
  }

  const hashedPassword = await bcrypt.hash(userInfo.password, 10);

  try {
    await user.create({
      fullname: userInfo.name,
      username: userInfo.username,
      email: userInfo.email,
      password: hashedPassword,
    });
  } catch (error) {
    return res.status(400).send(error);
  }

  res.json({
    msg: "signedup",
  });
});

//route for signin
router.post("/signin", async (req, res) => {
  const userInfo = req.body;
  const validate = signInZod.safeParse(userInfo);

  if (!validate.success) {
    return res.status(400).send(validate.error.issues[0].message);
  }

  const foundUser = await user.findOne({
    email: userInfo.email,
  });

  if (!foundUser) {
    return res.status(400).json({
      message: "No account available with this email!",
    });
  }

  if (bcrypt.compare(userInfo.password, foundUser.password)) {
    const token = jwt.sign(
      {
        userId: foundUser._id,
      },
      process.env.SECRET
    );

    // console.log("i'm signin" + " " + foundUser._id);

    res.json({
      message: "signedin",
      token: token,
    });
  } else {
    res.status(400).json({
      message: "incorrect password",
    });
  }
});

module.exports = router;
