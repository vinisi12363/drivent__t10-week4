import { prisma } from '@/config';
import { Booking } from '@prisma/client';


async function createBooking( roomId:number, userId:number ): Promise<Booking> {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
      updatedAt: new Date(),
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
  return prisma.booking.count({
    where: {
      roomId
    }
  });
}
async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
    userId
    },
    include: {
      Room: true,
    }
  });
}

async function updateBooking( bookingId:number, roomId:number,) {
  return prisma.booking.update({
      where: { id: bookingId },
      data: { roomId: roomId },
    });
}
const bookingRepository = {
  updateBooking,
  createBooking,
  findBookingByRoomId,
  findBookingById,
  findBookingByUserId
};

export default bookingRepository  ;
