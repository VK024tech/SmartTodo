const mongoose = require('mongoose');
const schema = mongoose.Schema;
const obejctid = schema.ObjectId;


const userSchema = new schema({
    fullname: String,
    username: String,
    email: String,
    password: String,
    googleID: String,
    picture: String,
    accessToken: String,
    refreshToken: String,
})



const todoSchema = new schema({
    userId: obejctid,
    title: String,
    priority: String,
    completed: Boolean,
    creationDate: Date,
    endDate: Date,
})



const user = mongoose.model('User', userSchema)
const todo = mongoose.model('Todo', todoSchema)



module.exports = {user, todo}