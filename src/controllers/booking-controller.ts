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
  
    const resultId = await bookingService.bookingRoomById(userId, roomId);
  
    return res.send({ bookingId: resultId });
  } catch (error) {
   
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send({name:"not Found", message:"No result for this search"})
    }

    else if (error.statusText === 'Forbidden'){
      return res.sendStatus(httpStatus.FORBIDDEN).send({name:"Forbidden access", message:"you don't have authorization to acces"})
    }

    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
 
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  try {

  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const { roomId } = req.body as Record<string, number>;
 
    const updatedBooking = await bookingService.updateBookingRoomById(userId, bookingId, roomId)
    return res.send({ bookingId: updatedBooking })
  } catch (error) {
    console.log ("erro do update", error)
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND)
    }
    else if (error.statusText === 'Forbidden'){
      return res.sendStatus(httpStatus.FORBIDDEN)
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}