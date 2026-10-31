const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validasi apakah string adalah format UUID yang valid
 * @param {string} uuid
 * @returns {boolean}
 */
export const isValidUUID = (uuid) => {
  return typeof uuid === 'string' && UUID_REGEX.test(uuid);
};

