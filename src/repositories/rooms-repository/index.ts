import { prisma } from '@/config';

async function findById(id: number) {
  return prisma.room.findUnique({
    where: {
      id: id,
    },
  });
}

const roomRepository = {
  findById,
};

export default roomRepository;