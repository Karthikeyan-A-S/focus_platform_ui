/** @typedef {'A' | 'B' | 'C' | 'D'} AnswerLetter */

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Parse question options from API (comma-separated or JSON array string).
 * @param {string} options
 * @returns {string[]}
 */
export function parseQuestionOptions(options) {
    if (!options) return [];
    const trimmed = String(options).trim();
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map((o) => String(o).trim()).filter(Boolean);
            }
        } catch {
            /* fall through */
        }
    }
    return trimmed.split(',').map((o) => o.trim()).filter(Boolean);
}

/**
 * @param {number} index 0-based option index
 * @returns {AnswerLetter | string}
 */
export function letterForOptionIndex(index) {
    return OPTION_LETTERS[index] ?? String.fromCharCode(65 + index);
}

/**
 * Build submit payload: questionId (string) -> A|B|C|D
 * @param {Array<{ id: number }>} questions
 * @param {Record<number, AnswerLetter | string>} answersByQuestionId
 * @returns {Record<string, string>}
 */
export function buildSubmitAnswersPayload(questions, answersByQuestionId) {
    const payload = {};
    for (const q of questions) {
        const letter = answersByQuestionId[q.id];
        if (letter) {
            payload[String(q.id)] = String(letter).toUpperCase();
        }
    }
    return payload;
}
