// logger.js
const fs = require('fs');
const path = require('path');

/**
 * Ensures the existence of the 'logs' directory.
 * If it does not exist, the directory is created at runtime.
 */
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * Creates a logger that writes to both the console and a separate log file
 * @param {string} filename - name of the log file (e.g., 'transaction_controller_test.log')
 * @returns {(…args: any[]) => void}
 */
function createLogger(filename) {
  const logFilePath = path.join(logDir, filename);
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  return (...args) => {
    const timestamp = new Date().toISOString();
    const message = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    const fullMessage = `[${timestamp}] ${message}`;
    console.log(fullMessage);
    logStream.write(fullMessage + '\n');
  };
}

module.exports = { createLogger };
