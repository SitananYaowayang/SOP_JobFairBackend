const express = require("express");
const { 
  createInterviewSession, 
  getInterviewSession, 
  getInterviewSessions, 
  updateInterviewSession, 
  deleteInterviewSession 
} = require("../controllers/InterviewSession");

const router = express.Router({mergeParams : true});
const bookingRouter = require ('./bookings')

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getInterviewSessions) 
  .post(protect, authorize('admin','user_company'), createInterviewSession); 

router.use('/:sessionId/bookings/', bookingRouter);

router.route('/:id')
  .get(getInterviewSession)  
  .put(protect, authorize('admin','user_company'), updateInterviewSession)  
  .delete(protect, authorize('admin','user_company'), deleteInterviewSession);  

module.exports = router;
