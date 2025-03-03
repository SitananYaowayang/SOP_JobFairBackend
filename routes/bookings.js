const express = require('express');

const {getBookings,getBooking,addBooking, updateBooking, deleteBooking, getBookingUser} = require('../controllers/bookings');

const router = express.Router({mergeParams : true});

const {protect,authorize} = require('../middleware/auth');

router.route('/').get(protect, authorize('user','user_company','admin'),getBookings);
router.route('/:date').post(protect, authorize('user','admin'), addBooking);

// router.route('/:id')
//     

router.route('/:id/:date')
    .get(protect, getBooking)
    .put(protect, authorize('user','user_company','admin'), updateBooking)
    .delete(protect, authorize('user','user_company','admin'), deleteBooking);



module.exports = router;