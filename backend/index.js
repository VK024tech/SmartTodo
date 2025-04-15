//import express
const express = require('express')
const app = express()

//import dotenv for secrets
require('dotenv').config()

//import mongoose and connect for mongodb use
const mongoose = require('mongoose');


//import different routes
const userRoutes = require('./routes/user')
const todoRoutes = require('./routes/todo')

//request object as a json object
app.use(express.json())

app.use('/user', userRoutes);
app.use('/todo', todoRoutes);



async function ServerStart(){
   await mongoose.connect(process.env.MONGODB)
    app.listen(process.env.PORT)
    console.log('Server started')
}

ServerStart()