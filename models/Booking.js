const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingDate:{
        type : Date,
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
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BookingSchema.virtual('interviewsessions', {
    ref: 'InterviewSession',
    localField: 'interviewSession',
    foreignField: '_id',  
    justOne: false
});

module.exports = mongoose.model('Booking', BookingSchema);