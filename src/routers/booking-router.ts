import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBooking , selectBookingRoom, updateBooking} from '../controllers/booking-controller';

const bookingRouter = Router()

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', selectBookingRoom)
  .put('/:bookingId', updateBooking);
  

export { bookingRouter }