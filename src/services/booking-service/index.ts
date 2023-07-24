import { notFoundError } from '@/errors/not-found-error';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '../../repositories/rooms-repository';
import { requestError } from '../../errors';


async function verifyEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError;

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(403, 'Forbidden');
  }

}

async function verifyValidBooking(roomId: number) {
  const room = await roomRepository.findById(roomId);
  const bookings = await bookingRepository.findBookingByRoomId(roomId);

  if (!room) throw notFoundError();
  if (room.capacity <= bookings.length) throw requestError(403, 'Forbidden');
}


async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  
  if (!booking) throw notFoundError();
  
  return {
    id: booking.id,
    Room: booking.Room
  };
 
}
/*
async function getHotelBookings(hotelId: number) {
  const bookings = await bookingRepository.findBookingByHotelId(hotelId);
  if (!bookings) throw notFoundError();
  return bookings;
} */

async function bookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment)throw notFoundError;

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(403, 'Forbidden');
  }
  const room = await roomRepository.findById(roomId);
  const reservedbookings = await bookingRepository.findBookingByRoomId(roomId);
  if (!room) throw notFoundError();
  if (reservedbookings.length === room.capacity)   throw requestError(403, 'Forbidden');
 
  const createdBooking=   await bookingRepository.createBooking({ roomId, userId });

  return  createdBooking.id
}

async function updateBookingRoomById(userId: number, bookingId:number ,roomId: number) {
  if(!bookingId) throw requestError(403, 'Forbidden');
  if (!roomId) throw notFoundError();

  const originalReserve = await bookingRepository.findBookingByUserId(userId);
  if (!originalReserve) {
    throw requestError(403, 'Forbidden');
  }

  const room = await roomRepository.findById(roomId);
  if (!room) throw notFoundError();

  const deletedBooking = await bookingRepository.findBookingByUserId(userId);
  
  const existingBooking = await bookingRepository.findBookingById(bookingId);
  if (!existingBooking) {
    throw notFoundError();
  }

  if (!deletedBooking || deletedBooking.userId !== userId) throw requestError(403, 'Forbidden');

  return bookingRepository.updateBooking({
    id: deletedBooking.id,
    roomId,
    userId,
  });
}

  const bookingService = {
    bookingRoomById,
    getBooking,
    //getHotelBookings,
    updateBookingRoomById,
    verifyEnrollmentTicket,
    verifyValidBooking,
  };

export default bookingService;