import express from 'express';
import { userController } from '../../controllers';

const router = express.Router();

router.get('/all', userController.getAllUsers.bind(userController));
router.post('/blockUser', userController.blockUsers.bind(userController));
router.post('/unblockUser', userController.unblockUsers.bind(userController));

export default router;
