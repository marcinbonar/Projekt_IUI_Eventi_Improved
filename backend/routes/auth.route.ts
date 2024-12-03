import express from 'express';
import { authController } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = express.Router();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/googleLogin', authController.googleLogin.bind(authController));
router.put(
  '/user/changePassword/:userId',
  authMiddleware,
  authController.changePassword.bind(authController)
);
export default router;
