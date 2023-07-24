import { notFoundError } from '@/errors/not-found-error';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '../../repositories/rooms-repository';
import { requestError } from '../../errors';


async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  
  if (!booking) throw notFoundError();
  
  return {
    id: booking.id,
    Room: booking.Room
  };
 
}

async function bookingRoomById(userId: number, roomId: number) {
  if (!roomId || roomId === null) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();


  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(403, 'Forbidden');
  }

  const room = await roomRepository.findById(roomId)


  if (!room) throw notFoundError();
  const reservedBookings = await bookingRepository.findBookingByRoomId(roomId);
  if (reservedBookings === room.capacity)   throw requestError(403, 'Forbidden');
 

  const createdBooking=   await bookingRepository.createBooking( roomId, userId );

  return  createdBooking.id
}

async function updateBookingRoomById(userId: number, bookingId:number ,newRoomId: number) {
  if(!bookingId ) throw requestError(403, 'Forbidden');
  if (!newRoomId ) throw notFoundError();
  console.log ("BOOKING ID ", bookingId , "NEW ROOM ID" , newRoomId)
 


  const originalBooking = await bookingRepository.findBookingByUserId(userId);
  console.log("ORIGINAL BOOKING",originalBooking)
  if (!originalBooking) {
    console.log("entrou no if do original oboking")
    throw requestError(403, 'Forbidden');
  }

  const room = await roomRepository.findById(newRoomId)
  if (!room) throw notFoundError();
 

  const bookingsToRoom = await bookingRepository.findBookingByRoomId(newRoomId);
  console.log("bookingsToRoom",bookingsToRoom)

   const Allrooms  =await  roomRepository.findAllRooms();
   console.log("Allrooms", Allrooms)

  if (room.capacity <= bookingsToRoom){
      console.log("room capacity", room.capacity , " bookingsToRoom " , bookingsToRoom)
    
    throw requestError(403, 'Forbidden');
  
  }

  //verificar se é possivel alocar o novo booking , se existe o id
  const newBooking = await bookingRepository.findBookingById(bookingId);
  console.log("newBooking",newBooking)
  if (!newBooking) {
    throw notFoundError();
  }
  //verificar se o quarto que ele quer deletar é dele 
  const deletedBooking = await bookingRepository.findBookingByUserId(userId);
  console.log("deletedBooking",deletedBooking)
  if (!deletedBooking || deletedBooking.userId !== userId) {
    console.log("entrou no if do deletedbooking")
    throw requestError(403, 'Forbidden');
  
  }
  const existingBooking = await bookingRepository.findBookingById(bookingId);

  if (!existingBooking) {
    throw notFoundError();
  }
  
  const updatedBooking = await bookingRepository.updateBooking(deletedBooking.id,newRoomId);

  return updatedBooking.id
}

  const bookingService = { 
    bookingRoomById,
    getBooking,
    updateBookingRoomById,

  };

export default bookingService;