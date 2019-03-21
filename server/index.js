const express = require('express');
const cors = require('cors');
const volleyball = require('volleyball');
const monk = require('monk');
const rateLimit = require('express-rate-limit');

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/meower');
const mews = db.get('mews');
app.use(express.json());
app.use(cors());
app.use(volleyball);

app.get('/', (req, res) => {
  res.json({
    message: 'oi',
  });
});

app.get('/mews', (req, res, next) => {
  let { skip = 0, limit = 10, sort = 'desc' } = req.query;
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 5;

  skip = skip < 0 ? 0 : skip;
  limit = Math.min(50, Math.max(1, limit));

  Promise.all([
    mews.count(),
    mews.find(
      {},
      {
        skip,
        limit,
        sort: {
          created: sort === 'desc' ? -1 : 1,
        },
      },
    ),
  ])
    .then(([total, mews]) => {
      res.json({
        mews,
        meta: {
          total,
          skip,
          limit,
          has_more: total - (skip + limit) > 0,
        },
      });
    })
    .catch(next);
});

const isValidMew = mew => {
  return (
    mew.name &&
    mew.name.toString().trim() !== '' &&
    mew.name.toString().trim().length <= 50 &&
    mew.content &&
    mew.content.toString().trim() !== '' &&
    mew.content.toString().trim().length <= 140
  );
};

app.use(
  rateLimit({
    windowMs: 10 * 1000, // 10 sec
    max: 3,
  }),
);

app.post('/mews', (req, res) => {
  console.log('req.body', req.body);
  if (isValidMew(req.body)) {
    const mew = {
      name: req.body.name.toString(),
      content: req.body.content.toString(),
      creted: new Date(),
    };
    console.log(mew);
    mews.insert(mew).then(createdMew => {
      res.json(createdMew);
    });
  } else {
    res.status(422);
    res.json({
      message: 'Hey! Name and Content are required.',
    });
  }
});

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
