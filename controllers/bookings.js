const Booking = require('../models/Booking');
const Company = require('../models/Company');
const InterviewSession = require('../models/InterviewSession')

// 1. Get all bookings
exports.getBookings = async (req, res, next) => {
    let query;

    const reqQuery = {...req.query};
    
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach(param => delete reqQuery[param]);

    console.log(reqQuery);

    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    if (req.user.role === 'user') {
        // Non-admin users should only see their own bookings
        query = Booking.find({ user: req.user.id },JSON.parse(queryStr)).populate({
            path: 'company',
            select: 'name address website tel'
        }).populate({
            path: 'interviewsessions',
            select: 'sessionName jobPosition jobDescription'
        });
    }
    //user_company 
    else if(req.user.role === 'user_company'){
        query = Booking.find({company: req.user.affiliate},JSON.parse(queryStr)).populate({
            path: 'interviewsessions',
            select: 'sessionName jobPosition jobDescription'
        });
    }
    else {
        console.log(req.params)
        if(req.params.sessionId){
            console.log('aaaaa')
            query = Booking.find({interviewSession : req.params.sessionId}).populate({
                path: 'company',
                select: 'name address website tel'
            }).populate({
                path: 'interviewSession',
                select: 'sessionName jobPosition jobDescription'
            });
        }
        else{
            console.log('aaaaab')
            if(req.params.companyId){
                query = Booking.find({company : req.params.companyId}).populate({
                    path: 'company',
                    select: 'name address website tel'
                }).populate({
                    path: 'interviewSession',
                    select: 'sessionName jobPosition jobDescription'
                });
                console.log(query);
            } else{
                console.log('aaaaac')
                query = await Booking.find().populate({
                    path: 'company',
                    select: 'name address website tel'
                }).populate({
                    path: 'interviewSession',
                    select: 'sessionName jobPosition jobDescription'
                });
            }
        }
    }
    try {
        // if (req.query.select) {
        //     const fields = req.query.select.split(",").join(" ");
        //     query = query.select(fields);
        // }
        
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     query = query.sort(sortBy);
        // } 
        

        // const page = parseInt(req.query.page, 10) || 1;
        // const limit = parseInt(req.query.limit, 10) || 25;
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        // const total = await Company.countDocuments();

        // query = query.skip(startIndex).limit(limit);

        const bookings = await query;

        // const pagination = {};
        // if (endIndex < total) {
        //     pagination.next = {
        //         page: page + 1,
        //         limit
        //     };
        // }
        // if (startIndex > 0) {
        //     pagination.prev = {
        //         page: page - 1,
        //         limit
        //     };
        // }

        res.status(200).json({
            success: true,
            count: bookings.length,
            // pagination,
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

        const comp = await Booking.findById(req.params.id);

        if(req.user.role === 'user'){
            if(req.user.id !== comp.user){
                return res.status(400).json({ success: false, message: `you are not in booking with ID ${req.params.id}` });
            }
        }

       //user_company
        if(req.user.role == 'user_company'){
            if(req.user.affiliate.toString() !== comp.company.toString()){
                return res.status(400).json({ success: false, message: `you are not from company in booking with ID ${req.params.id}` });
            }
        }

        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            select: 'name address website tel'
        }).populate({
            path: 'interviewSession',
            select: 'sessionName jobPosition jobDescription'
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
        
        if(req.params.companyId){
            console.log('aaa')
            req.body.company = req.params.companyId;
        }
        if(req.params.sessionId){
            console.log('bbb')
            req.body.interviewSession = req.params.sessionId;
        }

        const company = await Company.findById(req.body.company);

        const session = await InterviewSession.findById(req.body.interviewSession);
        const repeatsession = await Booking.find({interviewSession: req.body.interviewSession});
        console.log('interviewsession:' + req.body.interviewSession);
        console.log(session);
        if(repeatsession.length > 0 ){
            return res.status(400).json({success: false, message: 'you already book this session'});
        }

        if(!company){
            return res.status(404).json({
                success:false,
                message:`No company with the id of ${req.body.company}`
            });
        }
        if(!session){
            return res.status(404).json({
                success:false,
                message:`No Interview session with the id of ${req.body.company}`
            });
        }

        const minDate = session.startDate;
        const maxDate = session.endDate;
        const bookingdate = new Date(req.body.bookingDate);

        if (bookingdate < minDate || bookingdate > maxDate){
            return res.status(400).json({
                success: false,
                message: 'bookingDate must be between ' + minDate + ' and ' + maxDate
            });
        }
        

        if(session.company.toString() !== req.body.company.toString()){
            return res.status(400).json({
                success:false,
                message: `interviewSession ${req.body.interviewSession} is not in this company ${req.body.company} `
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
            message: " Cannot create booking"
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
        //user_company
        if(req.user.role == 'user_company'){
            if(req.user.affiliate.toString() !== booking.company.toString())return res.status(400).json({success: false, message: `You are not authorized to update this booking`})
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
        //user_company
        if(req.user.role ==='user_company'){
            if(req.user.affiliate.toString() !== booking.company.toString())return res.status(400).json({success: false, message: `You(company) are not authorized to delete this booking`})
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