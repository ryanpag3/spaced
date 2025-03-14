import { isInitialized } from '../lib/command';
import * as Crypto from '../lib/crypto';

export default async function initialize() {
    if (isInitialized()) {
        console.log("Spaced CLI is already initialized.");
        return;
    }

    await Crypto.initialize();
    console.log("Spaced CLI initialized.");
}