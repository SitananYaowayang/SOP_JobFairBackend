const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingDate:{
        type : String,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    company:{
        type:mongoose.Schema.ObjectId,
        ref: 'Company',
        required : true
    },
    interviewSession:{
        type:mongoose.Schema.ObjectId,
        ref: 'InterviewSession',
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);