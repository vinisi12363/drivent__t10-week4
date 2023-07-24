/*import {
    enrollmentWithAddressReturn,
    findBookingByRoomIdNoCapacityReturn,
    findBookingByRoomIdReturn,
    findRoomByIdNoCapacityReturn,
    findRoomByIdReturn,
    findTicketByEnrollmentIdReturn,
    getBookingDifferentUserIdReturn,
    getBookingReturn,
  } from '../factories/booking-factory';
  import bookingService from '../../src/services/booking-service';
  import bookingRepository from '@/repositories/booking-repository';
  import { notFoundError } from '@/errors';
  
  import enrollmentRepository from '@/repositories/enrollment-repository';
  import roomRepository from '@/repositories/rooms-repository';
  import ticketsRepository from '@/repositories/tickets-repository';
import httpStatus from 'http-status';
  
  describe('getBooking function', () => {
    it('should return the booking for the given user id', async () => {
      const userId = 1;
      const booking = getBookingReturn();
  
      jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValue(booking);
  
      const result = await bookingService.getBooking(userId);
  
      expect(bookingRepository.findBookingByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(booking);
    });
  
    it('should throw notFoundError if the booking for the given user id is not found', async () => {
      const userId = 1;
  
      jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValue(null);
  
      await expect(bookingService.getBooking(userId)).rejects.toEqual(notFoundError());
      expect(bookingRepository.findBookingByUserId).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('bookingRoomById function', () => {
    it('should create a booking for the given user and room', async () => {
      const userId = 1;
      const roomId = 1;
      const booking = getBookingReturn();
  
     
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(enrollmentWithAddressReturn());
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(findTicketByEnrollmentIdReturn());
  
      
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(findRoomByIdReturn());
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdReturn());
  
      jest.spyOn(bookingRepository, 'createBooking').mockResolvedValue(booking);
  
      const result = await bookingService.bookingRoomById(userId, roomId);
  
      expect(bookingRepository.createBooking).toHaveBeenCalledWith({ userId, roomId });
      expect(result).toEqual(booking);
    });
  });
  
  describe('changeBookingRoomById function', () => {
    it('should change booking room by id', async () => {
      const userId = 1;
      const roomId = 1;
      const bookingId =1;
      const booking = getBookingReturn();
  
      
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(findRoomByIdReturn());
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdReturn());
  
      jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValue(booking);
      jest.spyOn(bookingRepository, 'updateBooking').mockResolvedValue(booking);
  
      const result = await bookingService.updateBookingRoomById(userId,bookingId,roomId);
      expect(result).toEqual(booking);
    });
  
    it('should return booking error with booking not exists', async () => {
      const userId = 1;
      const roomId = 1;  
      const bookingId =1;
      const booking = getBookingReturn();
  
     
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(findRoomByIdReturn());
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdReturn());
  
      jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValue(null);
  
      await expect(bookingService.updateBookingRoomById(userId, bookingId ,roomId)).rejects.toEqual(notFoundError());
    });
  
    it('should return booking error with user id different from booking userid', async () => {
      const userId = 1;
      const roomId = 1;
      const bookingId = 1;
      const booking = getBookingDifferentUserIdReturn();
  
     
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(findRoomByIdReturn());
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdReturn());
  
      jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValue(booking);
      jest.spyOn(bookingRepository, 'updateBooking').mockResolvedValue(booking);
  
      await expect(bookingService.updateBookingRoomById(userId,bookingId,  roomId)).rejects.toEqual(notFoundError());
    });
  });
  
  describe('verifyEnrollmentTicket function', () => {
    it('should return error in find enrollment', async () => {
      const userId = 1;
      const roomId = 1;
  
      jest.spyOn(bookingService, 'verifyEnrollmentTicket').mockResolvedValue(undefined);
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
  
      await expect(bookingService.bookingRoomById(userId, roomId)).rejects.toEqual(notFoundError());
      expect(enrollmentRepository.findWithAddressByUserId).toHaveBeenCalledWith(userId);
    });
  
    it('should return error in find ticket', async () => {
      const userId = 1;
      const roomId = 1;
  
      
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(enrollmentWithAddressReturn());
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(null);
  
      await expect(bookingService.bookingRoomById(userId, roomId)).rejects.toEqual(notFoundError());
      expect(ticketsRepository.findTicketByEnrollmentId).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('verifyValidBooking function', () => {
    it('should return error in find room by id', async () => {
      const roomId = 1;
  
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(null);
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdReturn());
  
      await expect(bookingService.verifyValidBooking(roomId)).rejects.toEqual(notFoundError());
    });
  
    it('should return error in fin booking by Room Id', async () => {
      const roomId = 1;
  
      jest.spyOn(roomRepository, 'findById').mockResolvedValue(findRoomByIdNoCapacityReturn());
      jest.spyOn(bookingRepository, 'findBookingByRoomId').mockResolvedValue(findBookingByRoomIdNoCapacityReturn());
  
      await expect(bookingService.verifyValidBooking(roomId)).rejects.toEqual(httpStatus.FORBIDDEN);
    });
  }); */