import express from 'express';
import authRouter from './auth.route';
import userRouter from './user/user.route';
import { ROUTERS } from '../constants/ROUTES';
import eventRoute from './event/event.route';

const app = express();

app.use(ROUTERS.AUTH, authRouter);
app.use(ROUTERS.USER, userRouter);
app.use(ROUTERS.EVENT, eventRoute);

export default app;
