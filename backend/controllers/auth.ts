import { ALERTS } from '../constants/alerts';
import { client, ROLES } from '../constants/constants';
import { UserData } from '../models/users';
import { generateToken } from '../utils/generateToken';
import { getComparePassword } from '../utils/getComparePassword';
import { getHashPassword } from '../utils/getHashPassword';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

class Auth {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await UserData.findOne({ email });

      if (!user) {
        return res.status(403).send({ message: ALERTS.USER_NOT_FOUND });
      }

      const isPasswordValid = await getComparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send({ message: ALERTS.INVALID_PASSWORD });
      }

      if (user.isBlocked) {
        return res.status(403).send({ message: ALERTS.USER_IS_BLOCKED });
      }

      const tokenPayload = {
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        surname: user.surname,
      };
      const token = generateToken(tokenPayload);

      res.status(200).send({ token });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, surname } = req.body;

      const existingUser = await UserData.findOne({ email });
      if (existingUser) {
        return res.status(409).send({ message: ALERTS.USER_ALREADY_EXISTS });
      }
      console.log('Password to hash', password);
      const hashedPassword = await getHashPassword(password as string);
      const newUser = new UserData({
        email,
        password: hashedPassword,
        name,
        surname,
        role: ROLES.USER,
      });

      await newUser.save();

      res.status(201).send({ message: ALERTS.USER_REGISTERED_SUCCESSFULLY });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    const { idToken } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        return res.status(403).send({ message: ALERTS.INVALID_TOKEN });
      }

      let user = await UserData.findOne({ email: payload.email });

      if (!user) {
        user = new UserData({
          email: payload.email,
          name: payload.given_name || 'Nieznane',
          surname: payload.family_name || 'Nieznane',
          password: '',
          role: ROLES.USER,
        });
        await user.save();
      }

      const tokenPayload = {
        userId: user._id,
        role: user.role,
        name: user.name,
        surname: user.surname,
      };
      const token = generateToken(tokenPayload);

      res.status(200).send({ token });
    } catch (error) {
      console.error('Błąd logowania przez Google:', error);
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    const { oldPassword, newPassword } = req.body;
    const { userId: _id } = req.params;

    try {
      const user = await UserData.findById(_id);
      if (!user) {
        return res.status(403).send({ message: ALERTS.USER_NOT_FOUND });
      }

      const isPasswordValid = await getComparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(403).send({ message: ALERTS.CURRENT_PASSWORD_INCORRECT });
      }

      const hashedNewPassword = await getHashPassword(newPassword);

      await UserData.findByIdAndUpdate(user._id, { password: hashedNewPassword });

      res.status(200).send({ message: ALERTS.PASSWORD_UPDATED_SUCCESSFULLY });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: ALERTS.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new Auth();
