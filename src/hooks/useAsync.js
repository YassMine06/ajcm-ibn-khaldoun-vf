import { useState, useCallback } from 'react';

/**
 * Custom hook to handle asynchronous operations with loading and error states.
 * 
 * @param {Function} asyncFunction - The async function to execute.
 * @param {boolean} immediate - Whether to execute the function immediately.
 * @returns {Object} { execute, status, value, error, isLoading }
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setValue(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  // If immediate is true, we could use useEffect here, 
  // but usually it's cleaner to let the component decide when to call execute.

  return {
    execute,
    status,
    value,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

export default useAsync;
