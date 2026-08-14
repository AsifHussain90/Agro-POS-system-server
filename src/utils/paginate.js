/**
 * Reusable pagination helper for MongoDB queries.
 *
 * @param {Object} options
 * @param {number} [options.page=1] - Current page number
 * @param {number} [options.limit=10] - Items per page
 * @param {string} [options.sortBy='createdAt'] - Field to sort by
 * @param {string} [options.sortOrder='desc'] - 'asc' or 'desc'
 * @returns {Object} { skip, limit, sort, page, limitNum }
 */
export const getPaginationOptions = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limitNum;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  return { skip, limit: limitNum, sort, page, limitNum };
};

/**
 * Build paginated response envelope.
 *
 * @param {Array} data - Query results
 * @param {number} total - Total document count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} { data, total, page, limit, totalPages }
 */
export const buildPaginatedResponse = (data, total, page, limit) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});