/**
 * Format milliseconds as human-readable duration (e.g. "2m 15s" or "45s").
 * @param {number} totalTimeMs
 * @returns {string}
 */
export function formatDuration(totalTimeMs) {
    if (totalTimeMs == null || totalTimeMs <= 0) return '0s';
    const totalSeconds = Math.floor(totalTimeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
}

/**
 * Format milliseconds as mm:ss for tables.
 * @param {number} totalTimeMs
 * @returns {string}
 */
export function formatDurationMmSs(totalTimeMs) {
    if (totalTimeMs == null || totalTimeMs <= 0) return '0:00';
    const totalSeconds = Math.floor(totalTimeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
