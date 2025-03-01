const InterviewSession = require("../models/InterviewSession");
const Company = require("../models/Company");
const Booking = require("../models/Booking");

exports.getCompanies = async (req, res, next) => {
    try {
        let query;

        const reqQuery = {...req.query};
        
        const removeFields = ["select", "sort", "page", "limit"];
        removeFields.forEach(param => delete reqQuery[param]);

        console.log(reqQuery);

        let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = Company.find(JSON.parse(queryStr)).populate("interviewsessions");

        if (req.query.select) {
            const fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }
        
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } 
        else {
            query = query.sort("-createdAt");
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = await Company.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const companies = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({success: true, count: companies.length, pagination, data: companies});
    } 
    catch(err) {
        console.log(err);
        res.status (400).json({success: false});
    }
};

exports.getCompany = async (req, res, next) => {
    try{
        const company = await Company.findById(req.params.id);

        if(!company){
            return res.status(404).json({success:false});
        }

        res.status(200).json({success:true, data:company});
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
    
};

exports.createCompany = async (req, res, next) => {  //รอแก้ว่าจะให้สร้างก่อนที่จะมี user_company หรือยังไง
    try {
        
        if (req.user.role === "user_company" && req.user.affiliate) {
            return res.status(400).json({
                success: false,
                message: "You have already created a company."
            });
        }

        
        const company = await Company.create(req.body);

        
        if (req.user.role === "user_company") {
            await User.findByIdAndUpdate(req.user.id, { affiliate: company._id });
        }

        res.status(201).json({
            success: true,
            data: company
        });
    } catch (err) {
        res.status(400).json({ success: false, message: "Cannot create company" });
    }
};


exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

       
        if (req.user.role !== "admin" && req.user.affiliate.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this company."
            });
        }

        
        const updatedCompany = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: updatedCompany });
    } catch (err) {
        res.status(400).json({ success: false, message: "Cannot update company" });
    }
};


exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        
        if (req.user.role !== "admin" && req.user.affiliate.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this company."
            });
        }

        
        await InterviewSession.deleteMany({ company: req.params.id });
        await Booking.deleteMany({ company: req.params.id });

        
        await Company.deleteOne({ _id: req.params.id });

        
        if (req.user.role === "user_company") {
            await User.findByIdAndUpdate(req.user.id, { affiliate: null });
        }

        res.status(200).json({
            success: true,
            message: "Company deleted successfully",
            data: {
                _id: company._id,
                name: company.name
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: "Cannot delete company" });
    }
};


