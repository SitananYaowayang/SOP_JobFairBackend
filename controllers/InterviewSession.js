const InterviewSession = require("../models/InterviewSession");
const Booking = require("../models/Booking");

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
        const session = await InterviewSession.findById(req.params.id).populate({
            path:'companiess',
            select: 'name tel email website'
        });
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
        const session = await InterviewSession.create(req.body);
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update interview session
// @route   PUT /api/interview-sessions/:id
// @access  Private
exports.updateInterviewSession = async (req, res) => {
    try {
        const session = await InterviewSession.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        res.status(200).json({ success: true, data: session });
    } catch (err) {
        res.status(400).json({ success: false });
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

        // Delete all related bookings first
        await Booking.deleteMany({ interviewSession: req.params.id });

        // Delete the interview session
        await InterviewSession.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: "Session and related bookings deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error deleting session and bookings" });
    }
};