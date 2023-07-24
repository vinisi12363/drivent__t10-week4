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
        return  res.sendStatus(httpStatus.NOT_FOUND);
    }

  }
}

export async function selectBookingRoom(req: AuthenticatedRequest, res: Response) {
  try {
  const { userId } = req;
  const { roomId } = req.body as Record<string, number>;
    const result = await bookingService.bookingRoomById(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: result });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND)
    }

    else if (error.statusText === 'Forbidden'){
      return res.sendStatus(httpStatus.FORBIDDEN)
    }

    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
 
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  try {

  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const { roomId } = req.body as Record<string, number>;


  if (!bookingId) return res.status(httpStatus.BAD_REQUEST)

  
    const updatedBooking = await bookingService.updateBookingRoomById(userId, bookingId, roomId)
    return res.status(httpStatus.OK).send({ bookingId: Number(updatedBooking) })
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND)
    }
    else if (error.statusText === 'Forbidden'){
      return res.sendStatus(httpStatus.FORBIDDEN)
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}