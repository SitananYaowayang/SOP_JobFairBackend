const express = require("express");
const { 
  createInterviewSession, 
  getInterviewSession, 
  getInterviewSessions, 
  updateInterviewSession, 
  deleteInterviewSession 
} = require("../controllers/InterviewSession");

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getInterviewSessions) 
  .post(protect, authorize('admin','user_company'), createInterviewSession); 

router.route('/:id')
  .get(protect, getInterviewSession)  
  .put(protect, authorize('admin','user_company'), updateInterviewSession)  
  .delete(protect, authorize('admin','user_company'), deleteInterviewSession);  

module.exports = router;
