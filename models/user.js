import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ['user', 'owner'],
        default: 'user',
      },
      phone:{
        type:String
      },
      address:{
        type:String
      }
})

const User = mongoose.model('User',userSchema);
export default User;