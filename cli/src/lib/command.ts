import fs from 'fs';
import Config from './config';

export default async function runCommand(cmd: () => Promise<void>) {
    if (!isInitialized()) {
        console.error("Spaced CLI is not initialized. Run 'spaced init' to initialize.");
        return;
    }
    await cmd();
}

export function isInitialized() {
    const dirExists = fs.existsSync(Config.CONFIG_DIR);
    if (!dirExists) {
        return false;
    }

    const keysExist = fs.existsSync(`${Config.CONFIG_DIR}/id_rsa`) && fs.existsSync(`${Config.CONFIG_DIR}/id_rsa.pub`);
    return keysExist;
}