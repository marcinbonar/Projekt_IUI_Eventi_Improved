import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleAuthConfig {
    private client: OAuth2Client;

    constructor() {
        this.client = new OAuth2Client(process.env.CLIENT_ID);
    }

    getClient() {
        return this.client;
    }
}

export default new GoogleAuthConfig();
