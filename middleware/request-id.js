const { randomUUID } = require('crypto');

// reuse a well-formed id from an upstream proxy, otherwise generate one
const requestId = (req, res, next) => {
  const incoming = req.get('X-Request-Id');
  req.id = incoming && /^[\w-]{1,100}$/.test(incoming) ? incoming : randomUUID();
  res.set('X-Request-Id', req.id);
  next();
};

module.exports = requestId;
