const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,  
        maxlength: [50, 'Name cannot be more than 50 characters']  
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']  
    },
    country: {
        type: String,
        required: [true, 'Please add a region']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],  
        maxlength: [5, 'Postal Code cannot be more than 5 digits']
    },
    tel: {
        type: String
    },
    email: {
        type: String,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add a valid email address']  
    },
    website: {
        type: String,
        match: [/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid website URL']
    },
    business_type: {
        type: String,
        required: [true, 'Please add a business type']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    company_size: {
        type: String,
        required: [true, 'Please add a company size']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

CompanySchema.virtual('interviewsessions', {
    ref: 'InterviewSession',
    localField: '_id',
    foreignField: 'company',  
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema);
