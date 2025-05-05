const log = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
    if (Object.keys(data).length > 0) {
      console.log(logLine, JSON.stringify(data, null, 2));
    } else {
      console.log(logLine);
    }
  };
  
  module.exports = {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
  };
  