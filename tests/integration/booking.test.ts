import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createCustomRoomWithHotelId,
  createHotel,
  createRoomWithHotelId,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { notFoundError } from '@/errors';
import bookingService from '@/services/booking-service';
import  {createBooking} from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);



describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user has not a booking ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 when user has a booking ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({
        userId: user.id,
        roomId: room.id,
      });

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });
});

function createValidBody() {
  return {
    roomId: 1,
  };
}

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 403 if ticket is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const body = { roomId: room.id };

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with NotFoundError', async () => {
    const user = await createUser();
    try {
      await bookingService.bookingRoomById(user.id, 1);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });

  it('should return 403 when user no have maded reserve before', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const roomTwo = await createCustomRoomWithHotelId(hotel.id, 1);
    const response = await server
      .put(`/booking/${1}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 404 when user no have enrrolment', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const body = { roomId: 3 };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

    it('should return 200 when user as maded reserve', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    
    const booking = await createBooking({
      userId: user.id,
      roomId: room.id,
    });

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toMatchObject({
      id: booking.id,
      Room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        hotelId: room.hotelId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it('should respond Forbidden Error', async () => {
    const user = await createUser();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    try {
      const response = await bookingService.bookingRoomById(user.id, room.id);
      expect(response).toEqual({
        bookingId: expect.any(Number),
      });
    } catch (error) {
      expect(error).toEqual(httpStatus.FORBIDDEN);
    }
  });
  it("should respond with 404 when no room ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);

    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const validBody = createValidBody();
    const response = await server
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId: 155,
      });

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
});
/*
    it('should respond with status 400 with a invalid body', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const validBody = createValidBody();
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: 0,
      });

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

  
    
 */ 

describe('PUT /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const validBody = createValidBody();
    const response = await server.put('/booking/1').send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return NotFoundError', async () => {
    try {
      const response = await bookingService.bookingRoomById(1, 2);
      expect(response).toEqual(1);
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });

  
  it('should return 200 and bookingId', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const roomTwo = await createRoomWithHotelId(hotel.id);
   
    const booking =  await createBooking({
      userId: user.id,
      roomId: room.id,
    });
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number),
    });
  });

  it('should return 403 when user no have maded reserve before', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const roomTwo = await createRoomWithHotelId(hotel.id);
    const response = await server
      .put(`/booking/${1}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });


  it('should return 403 when new room no have vacancy', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const roomTwo = await createCustomRoomWithHotelId(hotel.id, 0);
   const booking = await createBooking({
      userId: user.id,
      roomId: room.id,
    });
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should return 404 when new room dont exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const roomTwo = await createCustomRoomWithHotelId(hotel.id, 0);
    const booking = await createBooking({
       userId: user.id,
       roomId: room.id,
     });
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: 9 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should return 403 when bookingId as not sended', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const roomTwo = await createRoomWithHotelId(hotel.id);
    const response = await server
      .put(`/booking/r`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
 
  });