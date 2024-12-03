import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

class MongooseConfig {
    async init() {
        const dbUri = process.env.DATABASE_URI;
        if (!dbUri) {
            throw new Error('DATABASE_URI is not defined in .env');
        }
        mongoose.set('strictQuery', true);
        await mongoose.connect(dbUri);
    }
}

export default new MongooseConfig();
