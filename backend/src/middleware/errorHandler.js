// Driver errors raised while the database is unreachable. Their messages are
// English internals ("users.findOne() buffering timed out"), so the visitor
// gets a Hebrew "try again shortly" instead, with a 503 that says it is temporary.
const DB_UNAVAILABLE =
  /buffering timed out|MongoNetworkError|MongoServerSelectionError|MongoNotConnectedError/;

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (DB_UNAVAILABLE.test(`${err.name}: ${err.message}`)) {
    return res
      .status(503)
      .json({ message: 'השירות אינו זמין כרגע. נסו שוב בעוד מספר דקות.' });
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}

export function notFound(req, res) {
  res.status(404).json({ message: 'Not found' });
}
