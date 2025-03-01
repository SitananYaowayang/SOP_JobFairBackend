const express = require('express');

const {getBookings,getBooking,addBooking, updateBooking, deleteBooking, getBookingUser} = require('../controllers/bookings');

const router = express.Router({mergeParams : true});

const {protect,authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('user','admin'), addBooking);

router.route('/:id/user')
    .get(protect, getBookingUser);
router.route('/:id/ses')
    .get(protect, getBooking);

router.route('/:id')
    .put(protect, authorize('user','admin'), updateBooking)
    .delete(protect, authorize('user','admin'), deleteBooking);



module.exports = router;