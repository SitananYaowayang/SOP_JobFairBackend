const mongoose = require("mongoose");

const InterviewSessionSchema = new mongoose.Schema({
    sessionName: {
        type: String,
        required: [true, "Please add a session name"],
        trim: true,
        maxlength: [100, "Session name cannot be more than 100 characters"]
    },
    jobPosition: {
        type: String,
        required: [true, "Please add a job position"]
    },
    jobDescription: {
        type: String
    },
    startDate: {
        type: Date,
        required: [true, "Please add a session start date"]
    },
    endDate: {
        type: Date,
        required: [true, "Please add a session end date"]
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    }
}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

InterviewSessionSchema.virtual('companiess', {
    ref: 'Company',
    localField: 'company',
    foreignField: '_id',  
    justOne: false
});

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
