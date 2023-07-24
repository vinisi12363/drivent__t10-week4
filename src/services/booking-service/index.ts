import { notFoundError } from '@/errors/not-found-error';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '../../repositories/rooms-repository';
import { requestError } from '../../errors';


async function verifyEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(403, 'Forbidden');
  }

}

async function verifyValidBooking(roomId: number) {
  const room = await roomRepository.findById(roomId);
  const bookings = await bookingRepository.findBookingByRoomId(roomId);
  if (room.capacity <= bookings.length && room !== null) throw requestError(403, 'Forbidden');
  if (!room) throw notFoundError();
  
}


async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  
  if (!booking) throw notFoundError();
  
  return {
    id: booking.id,
    Room: booking.Room
  };
 
}

async function bookingRoomById(userId: number, roomId: number) {
 

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  
  if (!enrollment)throw notFoundError();
  
  if (!roomId) throw notFoundError();
  
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const room = await roomRepository.findById(roomId)

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(403, 'Forbidden');
  }
  if (!room) throw notFoundError();
 
  

  const reservedbookings = await bookingRepository.findBookingByRoomId(roomId);
  if (reservedbookings.length === room.capacity)   throw requestError(403, 'Forbidden');
 
  const createdBooking=   await bookingRepository.createBooking({ roomId, userId });

  return  createdBooking.id
}

async function updateBookingRoomById(userId: number, bookingId:number ,roomId: number) {
  if(!bookingId) throw requestError(403, 'Forbidden');
  if (!roomId) throw notFoundError();
  //verificar se o user tem quarto reservado
  const originalReserve = await bookingRepository.findBookingByUserId(userId);

  if (!originalReserve) {
    throw requestError(403, 'Forbidden');
  }
  //verificaer se o quarto que ele quer verificar existe 
  const room = await roomRepository.findById(roomId);
  if (!room) throw notFoundError();
  const bookings = await bookingRepository.findBookingByRoomId(roomId);
  if (room.capacity <= bookings.length && room !== null) throw requestError(403, 'Forbidden');
  //verificar se o quarto que ele quer deletar é dele 
  const deletedBooking = await bookingRepository.findBookingByUserId(userId);
  if (!deletedBooking || deletedBooking.userId !== userId) throw requestError(403, 'Forbidden');
  //verificar se é possivel alocar o novo booking , se existe o id
  const newBooking = await bookingRepository.findBookingById(bookingId);
  if (!newBooking) {
    throw notFoundError();
  }

  
  const updatedBooking = await bookingRepository.updateBooking({
    id: deletedBooking.id,
    roomId:roomId,
    userId:userId});

  return updatedBooking.id
}

  const bookingService = {
    bookingRoomById,
    getBooking,
    updateBookingRoomById,
    verifyEnrollmentTicket,
    verifyValidBooking,
  };

export default bookingService;