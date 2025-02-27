const express = require("express");
const {getCompanies, getCompany, createCompany, updateCompany, deleteCompany} = require("../controllers/companies");




const appointmentRouter = require('./companies');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

router.use('/:companyId/interviewsessions/',appointmentRouter);

router.route("/").get(getCompanies).post(protect, authorize('admin'), createCompany);
router.route("/:id").get(getCompany).put(protect, authorize('admin'), updateCompany).delete(protect, authorize('admin'), deleteCompany);

module.exports = router;