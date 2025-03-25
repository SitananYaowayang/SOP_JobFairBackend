const express = require("express");

const {register, login, getMe, logout} = require("../controllers/auth");
const {
  updateDetails,
  updatePassword
} = require('../controllers/users');
const router = express.Router();

const {protect} = require('../middleware/auth');

router.post("/register",register);
router.post("/login",login);
router.get('/me',protect,getMe);
router.get('/logout',logout);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);


module.exports=router;