import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const result = await bookingService.getBooking(userId);
    
    return res.status(httpStatus.OK).send({
      id: result.id,
      Room: result.Room,
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
        return res.status(httpStatus.BAD_REQUEST)
    }

  }
}

export async function selectBookingRoom(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as Record<string, number>;
  try {
    const result = await bookingService.bookingRoomById(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: result.id });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.BAD_REQUEST)
    }
    else if (error.message === 'Forbidden'){
      return res.status(httpStatus.FORBIDDEN)
    }
  }
 
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const { roomId } = req.body as Record<string, number>;


  if (!bookingId) return res.status(httpStatus.BAD_REQUEST)

  try {
    const booking = await bookingService.updateBookingRoomById(userId, roomId)
    return res.status(httpStatus.OK).send({ bookingId: booking.id })
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.BAD_REQUEST)
    }
    else if (error.message === 'Forbidden'){
      return res.status(httpStatus.FORBIDDEN)
    }
  }
}