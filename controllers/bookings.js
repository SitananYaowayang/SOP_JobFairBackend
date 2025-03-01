const Booking = require('../models/Booking');
const Company = require('../models/Company');
const InterviewSession = require('../models/InterviewSession')

// 1. Get all bookings
exports.getBookings = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        // Non-admin users should only see their own bookings
        query = Booking.find({ user: req.user.id }).populate({
            path: 'company',
            select: 'name address website tel'
        });
    } else {
        // Admins can filter by company or see all bookings
        if (req.params.companyId) {
            query = Booking.find({ company: req.params.companyId }).populate({
                path: 'company',
                select: 'name address website tel'
            });
        } else {
            query = Booking.find().populate({
                path: 'company',
                select: 'name address website tel'
            });
        }
    }

    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Cannot find Booking" });
    }
};

// 2. Get one booking by ID
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            select: 'name address website description tel'
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking found with ID ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Cannot find Booking" });
    }
};

// 3. Get all bookings by user ID
exports.getBookingUser = async (req, res, next) => {
    console.log("User ID:", req.params.id);
    try {
        const bookings = await Booking.find({ user: req.params.id }).populate({
            path: 'company',
            select: 'name address website tel'
        });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Cannot find Bookings for user" });
    }
};



exports.addBooking= async (req,res,next) => {
    try {
        console.log(req.body.company);
        

        const company = await Company.findById(req.body.company);

        

        if(!company){
            return res.status(404).json({
                success:false,
                message:`No company with the id of ${req.params.company}`
            });

        }

        req.body.user = req.user.id;

        const existedBooking = await Booking.find({user:req.user.id});
        
        if(existedBooking.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({
                success:false,
                message:`The user with ID ${req.user.id} has already made 3 Booking`
            });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data : booking
        });

    } catch (error) {
        console.log(error.stack);

        return res.status(500).json({
            success:false,
            message: " Cannot crete booking"
        });
    }
};

exports.updateBooking= async (req,res,next) => {
    try{
        let booking= await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({
                success:false,
                message:`No booking with the id of ${req.params.id}`
            });
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body,
            {
                new:true,
                runValidators:true
            }
        );

        res.status(200).json({
            success:true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot update Booking"
        });
    }
};

exports.deleteBooking= async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({
                success:false,
                message:`No booking with the id of ${req.params.id}`
            });
        }

        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                succcess:false,
                message:`User ${req.user.id} is not authorized to update this booking`
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success:true,
            data:{}
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message:"Cannot delete booking"
        });
    }
};