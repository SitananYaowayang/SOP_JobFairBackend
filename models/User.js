const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name']
    },
    email:{
        type: String,
        required:[true,'Please add an email'],
        unique: true,
        match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email'
        ]
    },
    tel: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [
            /^\d{10}$/, 
            'Please enter a valid phone number'
        ]
    },
    role: {
        type: String,
        enum: ['user','admin','user_company'],
        default: 'user'
    },
    affiliate: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        default: null 
    },
    password: {
        type:String,
        required:[true,'Please add a password']
        ,
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    image: {
        type: String,  
        default: 'https://drive.google.com/file/d/1QGpQrJxHVTsxNikeNaqwwBySvrVaV_yC/view?usp=sharing',
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
});
        

UserSchema.pre('save',async function(next){
    if (!this.isModified('password')) return next();

    const salt=await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

UserSchema.methods.matchPassword=async function (enteredPassword) {

    return await bcrypt.compare(enteredPassword,this.password);
}

module.exports = mongoose.model('User',UserSchema);