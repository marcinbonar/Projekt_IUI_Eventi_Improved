import express, { Express } from 'express';
import routes from '../routes';
import cors from 'cors';
import { authMiddleware } from '../middlewares';

class ExpressConfig {
  private app: Express;
  private router;

  constructor() {
    this.app = express();
    this.router = express.Router();
  }

  init() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routesInit() {
    this.app.use('/', routes);
  }

  listen() {
    this.app.listen(process.env.PORT || 4000, () =>
      console.log(`Serwer nasłuchuje na porcie ${process.env.PORT}`)
    );
  }

  initialMiddlewares() {
    this.router.use('/user', authMiddleware);
    this.router.use('/event', authMiddleware);
  }
}

export default new ExpressConfig();
