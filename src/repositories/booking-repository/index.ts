import { prisma } from '@/config';
import { Booking } from '@prisma/client';


async function createBooking( roomId:number, userId:number ): Promise<Booking> {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}


async function findBookingById(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
    include: {
      Room: true,
    },
  });
}
async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId: roomId,
    },
    include: {
      Room: true,
    },
  });
}
async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId,
    },
    include: {
      Room: true,
    },
  });
}
async function findBookingByHotelId(hotelId: number) {
  const bookings: Booking[] = [];
  const rooms = await prisma.room.findMany({
    where: {
      hotelId: hotelId,
    },
  });
  for (let i = 0; i < rooms.length; i++) {
    const booking = await prisma.booking.findFirst({
      where: {
        roomId: rooms[i].id,
      },
    });
    if (booking) bookings.push(booking);
  }
  return bookings;
}
async function updateBooking( id:number, roomId:number, userId:number) {
  return prisma.booking.upsert({
    where: {
      id,
    },
    create: {
      roomId,
      userId,
    },
    update: {
      roomId,
    },
  });
}
const bookingRepository = {
  updateBooking,
  createBooking,
  findBookingByHotelId,
  findBookingByRoomId,
  findBookingById,
  findBookingByUserId
};

export default bookingRepository  ;
