import { notFoundError } from '@/errors/not-found-error';
import { requestError } from '@/errors/request-error';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '../../repositories/rooms-repository';



async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function getHotelBookings(hotelId: number) {
  const bookings = await bookingRepository.findBookingByHotelId(hotelId);
  if (!bookings) throw notFoundError();
  return bookings;
}

async function bookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError();
  }
  const room = await roomRepository.findById(roomId);


  if (!room) throw notFoundError();

  return bookingRepository.createBooking({ roomId, userId });
}

async function updateBookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw notFoundError();

  const room = await roomRepository.findById(roomId);


  if (!room) throw notFoundError();
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking || booking.userId !== userId) throw notFoundError();

  return bookingRepository.updateBooking({
    id: booking.id,
    roomId,
    userId,
  });
}

const bookingService = {
  bookingRoomById,
  getBooking,
  getHotelBookings,
  updateBookingRoomById
};

export default bookingService;