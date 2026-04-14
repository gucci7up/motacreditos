const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), 'error.log');

const logger = {
    log: (message, type = 'INFO') => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}\n`;

        console.log(logEntry.trim());

        try {
            fs.appendFileSync(LOG_FILE, logEntry);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },
    error: (message, err) => {
        const errorDetails = err ? `${err.message} ${err.stack || ''}` : '';
        logger.log(`${message} | DETAILS: ${errorDetails}`, 'ERROR');
    },
    getLogs: (lines = 100) => {
        if (!fs.existsSync(LOG_FILE)) return 'No logs found.';
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const logLines = content.split('\n').filter(Boolean);
        return logLines.slice(-lines).join('\n');
    }
};

module.exports = logger;
