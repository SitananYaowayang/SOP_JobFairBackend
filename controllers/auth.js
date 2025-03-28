const User = require("../models/User");
const Company = require("../models/Company");
exports.register=async (req,res,next) => {
    try{
        const {name,email,tel,password,role,affiliate}=req.body;

        const existingUser = await User.findOne({ tel });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Phone number already exists' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        if (role === 'user_company' && !affiliate) {
            return res.status(400).json({ success: false, message: 'Affiliate company is required for user_company role' });
        }

        
        if (role === 'user_company') {
            const company = await Company.findById(affiliate);

            if (!company) {
                return res.status(400).json({ success: false, message: 'Affiliate company not found' });
            }

            if (company.email !== email) {
                return res.status(400).json({ success: false, message: 'Company email does not match the provided email' });
            }

            if (company.name !== name) {
                return res.status(400).json({ success: false, message: 'Company name does not match the provided name' });
            }
        }

        const user=await User.create({
            name,
            email,
            tel,
            password,
            role,
            affiliate
        });

        // const token=user.getSignJwtToken();

        // res.status(200).json({success:true,token});

        sendTokenResponse(user,200,res);
    } catch (err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
};

exports.login=async (req,res,next) => {
    try{
    const {email,password} = req.body;
    if(!email|| !password){
        return res.status(400).json({success:false,
            msg:'Please provide email and password'
        });
    }
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return res.status(400).json({success:false,
            msg:'Invalid credentials'
        });
    }
   

    const isMatch = await user.matchPassword(password);


    if(!isMatch){
        return res.status(400).json({success:false,
            msg:'Invalid credentials'
        });
    }

    // const token = user.getSignJwtToken();
    // res.status(200).json({success:true,token});
    sendTokenResponse(user,200,res);
    } catch {
        return res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
}

const sendTokenResponse=(user,statusCode, res)=>{
    const token=user.getSignedJwtToken();
    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };
    if(process.env.NODE_ENV==='production'){
        options.secure= true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        token
    })
}

exports.getMe = async(req,res,next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    });
};

exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()+ 10*1000), 
        httpOnly:true
    });
    res.status(200).json({
        success:true,
        data:{}
    });
};