import express from 'express';
import { authMiddleware } from '../../middlewares';
import { eventController } from '../../controllers';

const router = express.Router();

router.get('/all', authMiddleware, eventController.getAllEvents.bind(eventController));
router.get('/:id', authMiddleware, eventController.getEventById.bind(eventController));
router.post('/add-event', authMiddleware, eventController.addEvent.bind(eventController));
router.delete(
  '/delete-event/:eventId',
  authMiddleware,
  eventController.deleteEvent.bind(eventController)
);
router.post(
  '/:eventId:/buy-ticket/offline/:userId',
  authMiddleware,
  eventController.payOffline.bind(eventController)
);
router.post(
  '/:eventId/buy-ticket/stripe/:userId/:stripeToken',
  eventController.payWithStripe.bind(eventController)
);
router.post(
  '/signUp/:userId/:eventId',
  authMiddleware,
  eventController.signUpForEventAndSetPendingPayment.bind(eventController)
);
router.get(
  '/userEvents/:userId',
  authMiddleware,
  eventController.getUserEvents.bind(eventController)
);

router.get(
  '/usersWithEvents',
  authMiddleware,
  eventController.getUsersWithEvents.bind(eventController)
);
router.get(
  '/solidTicketForEvents',
  authMiddleware,
  eventController.getAllEventsWithSoldTicketsCount.bind(eventController)
);

router.get(
  '/:userId/getRecommendations',
  authMiddleware,
  eventController.getRecommendations.bind(eventController)
);

export default router;
