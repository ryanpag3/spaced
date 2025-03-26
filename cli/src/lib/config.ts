import path from 'path';
import os from 'os';

const Config = {
    CONFIG_DIR: process.env.SPACED_CONFIG_DIR || path.resolve(os.homedir(), '.spaced')
};

export default Config;