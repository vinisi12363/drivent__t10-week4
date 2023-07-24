import { prisma } from '@/config';

export async function createRoom(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
      updatedAt: new Date(),
    },
  });
}