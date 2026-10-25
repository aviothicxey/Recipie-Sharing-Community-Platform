const mongoose = require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("db connected");
    }catch(err){
        console.log(`db not connected ${err}`);
    }
}

module.exports = connectDB;