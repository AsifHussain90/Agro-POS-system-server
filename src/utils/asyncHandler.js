const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`[ASYNC ERROR] ${req.method} ${req.path}:`, err.message);
    next(err);
  });
};

export default asyncHandler;