import { NextFunction, Request, Response } from 'express';
import { UserData } from '../../models/users';
import { createHttpException } from '../../utils/createHttpException';
import { ALERTS } from '../../constants/alerts';

class User {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserData.find();
      res.status(200).send(users);
    } catch (err) {
      res.send(createHttpException(500, ALERTS.INTERNAL_SERVER_ERROR));
    }
  }

  async blockUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const user = await UserData.findOne({ email });
      if (!user) {
        return res.send(createHttpException(500, ALERTS.USER_NOT_FOUND));
      }
      user.isBlocked = true;
      await user.save();
      res.send(createHttpException(200, ALERTS.USER_IS_BLOCKED));
    } catch (err) {
      res.send(createHttpException(500, ALERTS.INTERNAL_SERVER_ERROR));
    }
  }

  async unblockUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const user = await UserData.findOne({ email });

      if (!user) {
        return res.send(createHttpException(500, ALERTS.USER_NOT_FOUND));
      }
      user.isBlocked = false;
      await user.save();

      res.send(createHttpException(200, ALERTS.USER_IS_BLOCKED));
    } catch (err) {
      res.send(createHttpException(500, ALERTS.INTERNAL_SERVER_ERROR));
    }
  }
}

export default new User();
