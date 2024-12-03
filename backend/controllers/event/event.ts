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
      const event = await EventData.findOne({ eventId: eventId });

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

      const event = await EventData.findOne({ eventId: eventId });
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
      console.log('Żądanie odebrane:', req.body);
      // Pobierz userId i eventId z body żądania
      const { userId, eventId } = req.body;

      // Sprawdź, czy userId i eventId są poprawnymi ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).send({ message: 'Invalid userId or eventId format' });
      }

      // Znajdź użytkownika i wydarzenie na podstawie ich _id
      const user = await UserData.findById(userId);
      const event = await EventData.findById(eventId);

      if (!user || !event) {
        return res.status(400).send({ message: 'Invalid user or event' });
      }

      // Sprawdź, czy użytkownik już jest zapisany na wydarzenie
      const existingTicket = await TicketData.findOne({ event: event._id, user: user._id });
      if (existingTicket) {
        return res.status(400).send({ message: 'User already signed up for this event' });
      }

      // Utwórz nowy bilet
      const ticket = new TicketData({
        ticketId: new mongoose.Types.ObjectId().toHexString(),
        event: event._id,
        user: user._id,
        paymentStatus: 'PENDING_OFFLINE_PAYMENT',
      });

      await ticket.save();

      // Dodaj identyfikator biletu do tablicy tickets użytkownika
      user.tickets.push(ticket._id);
      await user.save();

      // Dodaj użytkownika do listy uczestników wydarzenia
      event.attendees.push(user._id);
      await event.save();

      res.status(200).send({
        message: 'Zapisano na wydarzenie z płątnością biletu przy w kasach ma miejscu ',
      });
    } catch (error) {
      console.error(error); // Logowanie błędów dla debugowania
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
        populate: { path: 'event' }, // Upewnij się, że to odnosi się do poprawnej kolekcji EventData
      });

      console.log('user', user);

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      if (!user.tickets || user.tickets.length === 0) {
        return res.status(200).send([]); // Zwróć pustą tablicę, jeśli użytkownik nie ma biletów
      }

      // Przetwórz bilety i dodaj status płatności do wydarzeń
      const eventsWithPaymentStatus = user.tickets
        .map((ticket: any) => {
          // Obsłuż sytuację, gdy event jest null lub nie istnieje
          if (!ticket.event) {
            return null;
          }

          // Skonwertuj dokument wydarzenia na obiekt i dodaj status płatności
          const event = ticket.event.toObject();
          event.paymentStatus = ticket.paymentStatus;
          return event;
        })
        .filter(event => event !== null); // Usuń null z tablicy

      // Zwróć wydarzenia z dodanym statusem płatności
      res.status(200).send(eventsWithPaymentStatus);
    } catch (error) {
      console.error('error', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  }

  async getUsersWithEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserData.find().populate({
        path: 'tickets',
        populate: { path: 'event' },
      });

      const usersWithEvents = users.map((user: any) => ({
        userId: user.userId,
        email: user.email,
        events: user.tickets.map((ticket: any) => ({
          event: ticket.event,
          paymentStatus: ticket.paymentStatus,
        })),
      }));

      res.status(200).send(usersWithEvents);
    } catch (error) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async getAllEventsWithSoldTicketsCount(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventData.find();
      const eventsWithSoldTicketsCount = events.map(event => ({
        title: event.title,
        soldTickets: event.soldTickets,
      }));
      res.status(200).send(eventsWithSoldTicketsCount);
    } catch (error) {
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId: _id } = req.params;

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
        return res.status(400).send({ message: 'Użytkownik nie ma zapisanych wydarzeń' });
      }

      const allEvents = await getAllEvents();

      const userEventIds = userEvents.map((event: any) => event._id.toString());

      const availableEvents = allEvents.filter(
        (event: any) => !userEventIds.includes(event._id.toString())
      );

      if (availableEvents.length === 0) {
        return res.status(200).send({ message: 'Brak nowych wydarzeń do polecenia' });
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
