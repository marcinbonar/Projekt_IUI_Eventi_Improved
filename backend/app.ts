import dotenv from 'dotenv';
import path from 'path';
import { expressConfig, mongooseConfig } from './config';

dotenv.config({ path: path.join(__dirname, './.env') });

expressConfig.init();
expressConfig.routesInit();
mongooseConfig.init();
expressConfig.listen();
expressConfig.initialMiddlewares();
