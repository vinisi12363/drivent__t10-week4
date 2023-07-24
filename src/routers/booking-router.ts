import { Router } from 'express';
import { authenticateToken, validateBody} from '@/middlewares';
import { bookingSchema } from '../schemas/booking-schema';
import { getBooking , selectBookingRoom, updateBooking} from '../controllers/booking-controller';

const bookingRouter = Router()

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), selectBookingRoom)
  .put('/:bookingId', validateBody(bookingSchema), updateBooking);
  

export { bookingRouter }