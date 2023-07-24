import { prisma } from '@/config';

async function findById(id: number) {
  return prisma.room.findUnique({
    where: {
      id
    }
  });
}
async function findAllRooms(){
  return prisma.room.findMany({})
}
const roomRepository = {
  findById,
  findAllRooms

};

export default roomRepository;