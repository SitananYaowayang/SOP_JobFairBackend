const express = require("express");
const {getCompanies, getCompany, createCompany, updateCompany, deleteCompany} = require("../controllers/companies");




const interviewSessionRouter = require('./InterviewSession');
const bookingRouter = require ('./bookings')

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

router.use('/:companyId/sessions/', interviewSessionRouter);
router.use('/:companyId/bookings/', bookingRouter);

router.route("/").get(getCompanies).post(protect, authorize('admin'), createCompany);
router.route("/:id").get( getCompany).put(protect, authorize('admin','user_company'), updateCompany).delete(protect, authorize('admin'), deleteCompany);

module.exports = router;