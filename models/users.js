const mongoose = require('mongoose');


const connecttodb = async ()=>{
    const dbUri = process.env.MONGO_URI
await mongoose.connect(dbUri);
console.log('connected to db');
}

const userschema = mongoose.Schema({
    email:String,
    password:String,
    age:Number,
    firstname:String,
    lastname:String,
})

const usernotemodel = mongoose.model("user", userschema);
module.exports = {usernotemodel,connecttodb}; 