// Browser-compatible logger that falls back to console methods
const logger = {
  level: 'info',
  
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  
  info: (...args: any[]) => {
    console.info(...args);
  },
  
  debug: (...args: any[]) => {
    console.debug(...args);
  },
  
  log: (...args: any[]) => {
    console.log(...args);
  }
};

export default logger;