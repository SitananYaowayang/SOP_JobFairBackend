const InterviewSession = require("../models/InterviewSession");
const Booking = require("../models/Booking");
const Company = require('../models/Company');
// @desc    Get all interview sessions
// @route   GET /api/interview-sessions
// @access  Public
exports.getInterviewSessions = async (req, res) => {
    try {
        const sessions = await InterviewSession.find().populate({
            path:'companiess',
            select: 'name tel email website'
        });
        res.status(200).json({ success: true, count: sessions.length, data: sessions });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
};

// @desc    Get single interview session
// @route   GET /api/interview-sessions/:id
// @access  Public
exports.getInterviewSession = async (req, res) => {
    try {
        let query = InterviewSession.findById(req.params.id);

        const userRole = req.user.role;
        
        if (userRole === 'admin') {
            // Admin: Populate all related fields (company and bookings)
            query = query.populate({
                path: 'companiess',
                select: 'name tel email website'
            }).populate({
                path: 'bookings',
                select: 'bookingDate user'
            });
        } else if (userRole === 'user_company') {
            query = query.populate({
                path: 'companiess',
                select: 'name tel email website'
            }).populate({
                path: 'bookings',
                match: { company: req.user.affiliate }, 
                select: 'bookingDate user'
            });
          
        } else if (userRole === 'user') {
            query = query.populate({
                path: 'companiess',
                select: 'name tel email website'
            });
        }
        const session = await query;

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        res.status(200).json({ success: true, data: session });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
};

// @desc    Create new interview session
// @route   POST /api/interview-sessions
// @access  Private
exports.createInterviewSession = async (req, res) => {
    try {
        if (req.user.role === "user_company") {
            req.body.company = req.user.affiliate; // Ensure they can only create for their company
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Check if the company exists using `.exists()`
        const companyExists = await Company.exists({ _id: req.body.company });
        if (!companyExists) {
            return res.status(400).json({ success: false, message: "Company not found" });
        }
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        
        const minDate = new Date("2022-05-10");
        const maxDate = new Date("2022-05-13");

        // Validate that startDate and endDate are within the allowed range
        if (startDate < minDate || endDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: "Interview session must be between March 10 - March 13, 2022"
            });
        }

        const session = await InterviewSession.create(req.body);
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error creating session" });
    }
};


// @desc    Update interview session
// @route   PUT /api/interview-sessions/:id
// @access  Private
exports.updateInterviewSession = async (req, res) => {
    try {
        let session = await InterviewSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        
        // Company users can only update their own company's sessions
        if (req.user.role == "user_company" && session.company.toString() !== req.user.affiliate.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        session = await InterviewSession.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: session });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error updating session" });
    }
};

// @desc    Delete interview session
// @route   DELETE /api/interview-sessions/:id
// @access  Private


exports.deleteInterviewSession = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Ensure company users can only delete their own sessions
        if (req.user.role == "user_company" && session.company.toString() != req.user.affiliate.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Delete all related bookings first
        await Booking.deleteMany({ interviewSession: req.params.id });

        // Delete the interview session
        await session.deleteOne();

        res.status(200).json({ success: true, message: "Session and related bookings deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error deleting session and bookings" });
    }
};
