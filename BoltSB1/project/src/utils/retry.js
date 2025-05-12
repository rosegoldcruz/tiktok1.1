/**
 * Utility function to retry an operation multiple times with exponential backoff
 * @param {Function} operation - The async operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} - Result of the operation if successful
 * @throws {Error} - Last error if all retries fail
 */
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Calculate exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} retries: ${lastError.message}`);
};