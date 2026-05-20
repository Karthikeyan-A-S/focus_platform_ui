/** @typedef {'A' | 'B' | 'C' | 'D'} AnswerLetter */

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * @param {object} question
 * @returns {number}
 */
export function getQuestionId(question) {
    const id = question?.id ?? question?.questionId;
    return Number(id);
}

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
    return trimmed
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
}

/**
 * @param {number} index 0-based option index
 * @returns {AnswerLetter | string}
 */
export function letterForOptionIndex(index) {
    return OPTION_LETTERS[index] ?? String.fromCharCode(65 + index);
}

/**
 * Convert stored answer (letter or legacy option text) to A|B|C|D.
 * @param {string} rawAnswer
 * @param {string} optionsString
 * @returns {string | null}
 */
export function normalizeAnswerToLetter(rawAnswer, optionsString) {
    if (rawAnswer == null || rawAnswer === '') return null;

    const trimmed = String(rawAnswer).trim();
    const upper = trimmed.toUpperCase();
    if (/^[A-D]$/.test(upper)) return upper;

    const opts = parseQuestionOptions(optionsString);
    for (let i = 0; i < opts.length; i++) {
        const letter = letterForOptionIndex(i);
        const opt = opts[i];
        if (
            trimmed === opt ||
            trimmed === letter ||
            trimmed === `${letter}. ${opt}` ||
            trimmed === `${letter}) ${opt}` ||
            trimmed.startsWith(`${letter}.`) ||
            trimmed.startsWith(`${letter})`)
        ) {
            return letter;
        }
    }

    return null;
}

/**
 * Build submit payload: questionId (string) -> A|B|C|D only
 * @param {Array<{ id?: number, questionId?: number, options: string }>} questions
 * @param {Record<number | string, string>} answersByQuestionId
 * @returns {Record<string, string>}
 */
export function buildSubmitAnswersPayload(questions, answersByQuestionId) {
    const payload = {};
    for (const q of questions) {
        const qid = getQuestionId(q);
        const raw = answersByQuestionId[qid] ?? answersByQuestionId[String(qid)];
        const letter = normalizeAnswerToLetter(raw, q.options);
        if (letter) {
            payload[String(qid)] = letter;
        }
    }
    return payload;
}
