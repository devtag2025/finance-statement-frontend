exports.validateParseRequest = (req, res, next) => {
  const { pages } = req.body;

  if (!Array.isArray(pages) || pages.length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'BAD_REQUEST',
      message: 'Request must include a non-empty pages array'
    });
  }

  const invalidPages = pages.filter(
    (p, idx) => !p.text || typeof p.text !== 'string'
  );

  if (invalidPages.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'BAD_REQUEST',
      message: 'All pages must have a text property'
    });
  }

  next();
};