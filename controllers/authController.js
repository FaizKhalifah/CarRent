import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function register(req,res) {
    const {username, email, password, phone, address} = req.body;
    try{
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({"msg" : "user already exist"})
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password:hashedPassword,
            role:"user",
            phone,
            address
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({ "msg":"user registered successfully",token, role:user.role });

    }catch(err){
        return res.status(500).json({error : err.message});
    }

}

export default{
    register
}