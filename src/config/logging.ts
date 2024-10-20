import winston from 'winston';

const isDebug = process.env.NODE_ENV !== 'production';

const logger = {
    debug: (...args: any[]) => {
        if (isDebug) {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },
};

export default logger;