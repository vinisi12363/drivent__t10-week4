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
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
  }
}

export async function selectBookingRoom(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as Record<string, number>;

  const booking = await bookingService.bookingRoomById(userId, roomId);

  return res.status(httpStatus.OK).send({ bookingId: booking.id });
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  if (!bookingId) return res.sendStatus(httpStatus.BAD_REQUEST);

  const { roomId } = req.body as Record<string, number>;
  const booking = await bookingService.updateBookingRoomById(userId, roomId);

  return res.status(httpStatus.OK).send({ bookingId: booking.id });
}