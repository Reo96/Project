import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username : {
        type:String,
        required : true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength : [3, 'Username must be at least 3 characters long']
    },
    email : {
        type:String,
        required : true,
        trim:true,
        lowercase:true,
        unique:true,
    },

    password : {
        type:String,
        required : true,
        trim:true,
        minlength : [5, 'Password must be at least 5 characters long']

    },
    uploads : {
        type:Array,
        default:[]
    }
})
const userModel = mongoose.model('User',userSchema);

export default userModel;
