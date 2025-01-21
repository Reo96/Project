import mongoose from 'mongoose'

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("connected to DB")
    })
}
export default connectToDB;
