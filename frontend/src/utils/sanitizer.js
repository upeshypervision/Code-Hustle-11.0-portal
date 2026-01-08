/**
 * Security utility for sanitizing user-generated content
 * Prevents XSS attacks by escaping HTML entities
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const escapeHtml = (text) => {
    if (!text || typeof text !== 'string') return text;

    const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Truncates text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 500) => {
    if (!text || typeof text !== 'string') return text;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Sanitizes and truncates text for safe display
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length (optional)
 * @returns {string} - Safe text for display
 */
export const sanitizeText = (text, maxLength = null) => {
    let sanitized = escapeHtml(text);
    if (maxLength) {
        sanitized = truncateText(sanitized, maxLength);
    }
    return sanitized;
};

/**
 * Sanitizes an object recursively
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
export const sanitizeData = (data) => {
    if (typeof data === 'string') {
        return escapeHtml(data);
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    if (data && typeof data === 'object') {
        const sanitized = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                sanitized[key] = sanitizeData(data[key]);
            }
        }
        return sanitized;
    }

    return data;
};
