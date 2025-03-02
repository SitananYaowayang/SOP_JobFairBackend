const Booking = require('../models/Booking');
const Company = require('../models/Company');
const InterviewSession = require('../models/InterviewSession')

// 1. Get all bookings
exports.getBookings = async (req, res, next) => {
    let query;

    if (req.user.role === 'user') {
        // Non-admin users should only see their own bookings
        query = Booking.find({ user: req.user.id }).populate({
            path: 'company',
            select: 'name address website tel'
        }).populate({
            path: 'interviewsessions',
            select: 'sessionName jobPosition jobDescription'
        });
    }
    else if (req.user.role === 'user_company') {
        query = Booking.find({ company: req.user.affiliate}).populate({
            path: 'interviewsessions',
            select: 'sessionName jobPosition jobDescription'
        })
    } else {
        query = Booking.find().populate({
            path: 'company',
            select: 'name address website tel'
        }).populate({
            path: 'interviewSession',
            select: 'sessionName jobPosition jobDescription'
        });
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

// 2. Get one booking by sessionID
exports.getBooking = async (req, res, next) => {
    try {
        if(req.user.role === 'user_company'){
            if(req.user.affiliate != comp.company){
                return res.status(400).json({ success: false, message: `you are not from company with ID ${req.params.id}` });
            }
        } 
        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            select: 'name address website description tel'
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking found with ID ${req.params.id}` });
        }

        if(req.user.role === 'user') {
            return res.status(200).json({ success: true, amount : booking.length() });
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

exports.addBooking= async (req,res,next) => {
    if(req.user.role === 'user'){
        const today = new Date(req.params.date);
        const cutoffDate = new Date('2022-05-02');

        if (today > cutoffDate) {
            return res.status(403).json({ message: 'Too late access denied' });
        }
    }
    try {
        console.log(req.body.company);


        const company = await Company.findById(req.body.company);

        const session = await InterviewSession.findById(req.body.interviewSession);

        const minDate = session.startDate;
        const maxDate = session.endDate;
        const bookingdate = new Date(req.body.bookingDate);

        if (bookingdate < minDate || bookingdate > maxDate){
            return res.status(400).json({
                success: false,
                message: 'bookingDate must be between ' + minDate + ' and ' + maxDate
            });
        }

        if(!company){
            return res.status(404).json({
                success:false,
                message:`No company with the id of ${req.body.company}`
            });

        }
        if(req.user.role === 'user'){
            req.body.user = req.user.id;
        }

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
    if(req.user.role == 'user'){
        const today = new Date(req.params.date);
        const cutoffDate = new Date('2022-05-02');
        
        if (today > cutoffDate) {
            return res.status(403).json({ message: 'Too late access denied' });
        }
    }
    try{
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({
                success:false,
                message:`No booking with the id of ${req.params.id}`
            });
        }

        if(req.user.role == 'user'){
            if(req.user.id.toString() !== booking.user.toString())return res.status(400).json({success: false, message: `You are not authorized to update this booking`})
        }
        if(req.user.role == 'user_company'){
            if(req.user.affiliate !== booking.company)return res.status(400).json({success: false, message: `You are not authorized to update this booking`})
        }
        

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this booking`});
        }
        
        const session = await InterviewSession.findById(booking.interviewSession);

        const minDate = session.startDate;
        const maxDate = session.endDate;
        const bookingdate = new Date(req.body.bookingDate);

        if (bookingdate < minDate || bookingdate > maxDate){
            return res.status(400).json({
                success: false,
                message: 'bookingDate must be between ' + minDate + ' and ' + maxDate
            });
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
    if(req.user.role === 'user'){
        const today = new Date(req.params.date);
        const cutoffDate = new Date('2022-05-02');

        if (today > cutoffDate) {
            return res.status(403).json({ message: 'Too late access denied' });
        }
    }
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({
                success:false,
                message:`No booking with the id of ${req.params.id}`
            });
        }

        if(req.user.role ==='user'){
            if(req.user.id.toString() !== booking.user.toString())return res.status(400).json({success: false, message: `You(user) are not authorized to delete this booking`})
        }
        if(req.user.role === 'user_company'){
            if(req.user.affiliate !== booking.company)return res.status(400).json({success: false, message: `You(company) are not authorized to delete this booking`})
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