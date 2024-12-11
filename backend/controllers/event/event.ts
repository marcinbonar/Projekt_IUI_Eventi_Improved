import { NextFunction, Request, Response } from 'express';
import { EventData } from '../../models/events';
import { ALERTS } from '../../constants/alerts';
import { UserData } from '../../models/users';
import { TicketData } from '../../models/tickets';
import StripeConfig from '../../config/stripeConfig';
import mongoose from 'mongoose';
import { isValidObjectId } from '../../validators/validationHelper';
import { getUserWithTicketsAndEvents } from '../../utils/OpenAIHelper/getUserWithTicketsAndEvents';
import { prepareUserEventsDescriptions } from '../../utils/OpenAIHelper/prepareUserEventsDescriptions';
import { prepareAvailableEventsDescriptions } from '../../utils/OpenAIHelper/prepareAvailableEventsDescriptions';
import { preparePrompt } from '../../utils/OpenAIHelper/preparePrompt';
import { getRecommendationsFromOpenAI } from '../../utils/OpenAIHelper/getRecommendationsFromOpenAI';
import { parseOpenAIResponse } from '../../utils/OpenAIHelper/parseOpenAIResponse';
import { getAllEvents } from '../../utils/OpenAIHelper/getAllEvents';

class Event {
  async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventData.find();
      res.status(200).send(events);
    } catch (err) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await EventData.findById(id);
      if (event!) {
        res.status(400).send({ message: ALERTS.EVENT_NOT_FOUND });
      } else {
        res.status(200).send(event);
      }
      res.status(200);
    } catch (err) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async addEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body;
      const requiredFields = [
        'title',
        'description',
        'image',
        'startDate',
        'endDate',
        'location',
        'category',
        'ticketPrice',
      ];
      const missingFields = requiredFields.filter(field => !event[field]);
      if (missingFields.length > 0) {
        return res
          .status(400)
          .send({ message: `Missing required fields: ${missingFields.join(', ')}` });
      }

      const newEvent = new EventData(event);
      await newEvent.save();
      res.status(200).send(newEvent);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const eventToDelete = await EventData.findByIdAndDelete(eventId);
      if (eventToDelete) {
        res.status(200).send({ eventId });
      } else {
        res.status(400).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
      }
    } catch (error) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async payOffline(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, userId } = req.params;

      const user = await UserData.findById(userId);
      const event = await EventData.findById(eventId);

      if (!user || !event) {
        return res.status(400).send({ message: ALERTS.INVALID_DATA });
      }

      const ticket = await TicketData.findOne({ event: event._id, user: user._id });
      if (ticket) {
        ticket.paymentStatus = 'PAID_OFFLINE';

        await ticket.save();
        res.status(200).send({ message: 'Offline payment successful' });
      } else {
        res.status(400).send({ message: 'Ticket not found for the user' });
      }
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(400).send({ message: 'An error occurred: Failed to perform operation' });
    }
  }

  async payWithStripe(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, userId, stripeToken } = req.params;

      if (!stripeToken) {
        return res.status(400).send({ message: 'Stripe token is required' });
      }

      const event = await EventData.findById(eventId);
      const user = await UserData.findById(userId);

      if (!user || !event) {
        return res.status(400).send({ message: 'Invalid user or event' });
      }

      const existingTicket = await TicketData.findOne({ event: event._id, user: user._id });
      if (existingTicket) {
        return res.status(400).send({ message: 'User already bought a ticket for this event' });
      }

      if (event.availableTickets <= 0) {
        return res.status(400).send({ message: 'No tickets available' });
      }

      await StripeConfig.charge(stripeToken, event.ticketPrice);

      const ticket = new TicketData({
        ticketId: new mongoose.Types.ObjectId().toHexString(),
        event: event._id,
        user: user._id,
        paymentStatus: 'PAID_ONLINE',
      });

      await ticket.save();

      user.tickets.push(ticket._id);
      await user.save();

      event.availableTickets -= 1;
      event.soldTickets += 1;
      event.attendees.push(user._id);
      await event.save();

      res.status(200).send({ message: 'Stripe payment successful, ticket purchased' });
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }

  async signUpForEventAndSetPendingPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, eventId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).send({ message: 'Invalid userId or eventId format' });
      }

      const user = await UserData.findById(userId);
      const event = await EventData.findById(eventId);

      if (!user || !event) {
        return res.status(400).send({ message: 'Invalid user or event' });
      }

      const existingTicket = await TicketData.findOne({ event: event._id, user: user._id });
      if (existingTicket) {
        return res.status(400).send({ message: 'User already signed up for this event' });
      }

      const ticket = new TicketData({
        ticketId: new mongoose.Types.ObjectId().toHexString(),
        event: event._id,
        user: user._id,
        paymentStatus: 'PENDING_OFFLINE_PAYMENT',
      });

      await ticket.save();

      user.tickets.push(ticket._id);
      await user.save();

      event.attendees.push(user._id);
      await event.save();

      res.status(200).send({
        message: 'Zapisano na wydarzenie z płatnością biletu przy w kasach ma miejscu ',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async getUserEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId: _id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({ message: 'Invalid user ID' });
      }

      const user = await UserData.findById(_id).populate({
        path: 'tickets',
        populate: { path: 'event' },
      });

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      if (!user.tickets || user.tickets.length === 0) {
        return res.status(200).send([]);
      }

      const eventsWithPaymentStatus = user.tickets
        .map((ticket: any) => {
          if (!ticket.event) {
            return null;
          }

          const event = ticket.event.toObject();
          event.paymentStatus = ticket.paymentStatus;
          return event;
        })
        .filter(event => event !== null);

      res.status(200).send(eventsWithPaymentStatus);
    } catch (error) {
      console.error('error', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  }

  async getUsersWithEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const populatedUsers = await UserData.find().populate({
        path: 'tickets',
        populate: { path: 'event' },
      });

      const usersWithEvents = populatedUsers.map((user: any) => ({
        role: user.role || '',
        userId: user._id?.toString() || '',
        email: user.email || '',
        events: user.tickets
          ? user.tickets.map((ticket: any) => {
              const event = ticket.event?.toObject ? ticket.event.toObject() : ticket.event;
              return {
                _id: event?._id?.toString() || '',
                title: event?.title || '',
                paymentStatus: ticket.paymentStatus || 'Nieznany',
              };
            })
          : [],
      }));

      res.status(200).send(usersWithEvents);
    } catch (error) {
      console.error('Błąd w getUsersWithEvents:', error);
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async getAllEventsWithSoldTicketsCount(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventData.find();
      const eventsWithSoldTicketsCount = events.map(event => ({
        eventName: event.title,
        soldTicketsCount: event.soldTickets,
      }));
      res.status(200).send(eventsWithSoldTicketsCount);
    } catch (error) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Tak jestem w funkcji');
      const { userId: _id } = req.params;
      console.log('userID', _id);

      if (!isValidObjectId(_id)) {
        return res.status(400).send({ message: 'Nieprawidłowy format ID użytkownika' });
      }

      const user = await getUserWithTicketsAndEvents(_id);

      if (!user) {
        return res.status(404).send({ message: 'Użytkownik nie znaleziony' });
      }

      const userEvents = user.tickets
        .map((ticket: any) => ticket.event)
        .filter((event: any) => event !== null);

      if (userEvents.length === 0) {
        return res.status(200).send({
          message: 'Użytkownik nie ma zapisanych wydarzeń eee',
        });
      }

      const allEvents = await getAllEvents();

      const userEventIds = userEvents.map((event: any) => event._id.toString());

      const availableEvents = allEvents.filter(
        (event: any) => !userEventIds.includes(event._id.toString())
      );

      if (availableEvents.length === 0) {
        return res.status(200).send({
          message: 'Brak nowych wydarzeń do polecenia',
          recommendations: [],
        });
      }

      const userEventsDescriptions = prepareUserEventsDescriptions(userEvents);
      const availableEventsDescriptions = prepareAvailableEventsDescriptions(availableEvents);

      const prompt = preparePrompt(userEventsDescriptions, availableEventsDescriptions);

      const content = await getRecommendationsFromOpenAI(prompt);
      console.log('content', content);

      let recommendations;
      try {
        recommendations = parseOpenAIResponse(content);
      } catch (parseError) {
        console.error('Błąd parsowania odpowiedzi OpenAI:', parseError);
        return res.status(500).send({ message: 'Błąd parsowania odpowiedzi OpenAI' });
      }
      res.status(200).send(recommendations);
    } catch (error) {
      console.error('Błąd w getRecommendations:', error);
      res.status(500).send({ message: 'Błąd serwera' });
    }
  }
}

export default new Event();
