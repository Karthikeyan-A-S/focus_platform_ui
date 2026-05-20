/**
 * Extract human-readable error from API response.
 * @param {import('axios').AxiosError} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return error?.message || 'Something went wrong. Please try again.';
}
