export const httpError = (status, message, errors = null) =>
  Object.assign(new Error(message), { status, errors });

export const ok = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res, message, status = 400, errors = null) =>
  res.status(status).json({ success: false, message, errors });

// Bungkus handler: error dari service otomatis jadi respons JSON.
export const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    fail(res, e.message, e.status ?? 500, e.errors ?? null);
  }
};