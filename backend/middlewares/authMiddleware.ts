import { NextFunction, Request, Response } from 'express';
import { createHttpException } from '../utils/createHttpException';
import { ALERTS } from '../constants/alerts';
import decodedToken from '../utils/decodedToken';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(403).send(createHttpException(403, ALERTS.TOKEN_NOT_FOUND));
    return;
  }
  try {
    const decoded = decodedToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).send(createHttpException(500, ALERTS.INTERNAL_SERVER_ERROR));
    return;
  }
};

export default authMiddleware;
