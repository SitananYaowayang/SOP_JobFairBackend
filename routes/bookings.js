const express = require('express');

const {getBookings,getBooking,addBooking, updateBooking, deleteBooking, getBookingUser} = require('../controllers/bookings');

const router = express.Router({mergeParams : true});

const {protect,authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, authorize('user','admin'),getBookings)
    .post(protect, authorize('user','admin'), addBooking);

router.route('/:id/user')
    .get(protect,authorize('user','admin'), getBookingUser);
router.route('/:id/ses')
    .get(protect, getBooking);

router.route('/:id')
    .put(protect, authorize('user','user_company','admin'), updateBooking)
    .delete(protect, authorize('user','user_company','admin'), deleteBooking);



module.exports = router;