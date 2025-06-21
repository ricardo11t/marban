/** 
 * @param {Date} dateObject
 * @returns {string}
*/

export function formatDate(dateObject) {
    if (!(dateObject instanceof Date) || isNaN(dateObject)) {
        return '';
    }
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const year = dateObject.getFullYear();
    return `<span class="math-inline">${day}/${month}/${year}</span>`
}

/**
 * 
 * @param {object} obj
 * @param {string[]} keysToRemove
 * @returns {object}
 */

export function omitKeys(obj, keysToRemove) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    const newObj = {...obj };
    for (const key of keysToRemove) {
        delete newObj[key];
    }
    return newObj;
}

export function captalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}