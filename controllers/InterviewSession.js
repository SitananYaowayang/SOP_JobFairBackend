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
    date: {
        type: String,
        required: [true, "Please add a session date"]
    },
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },

}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
