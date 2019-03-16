const express = require('express');
const cors = require('cors');
const volleyball = require('volleyball');
const monk = require('monk');

const app = express();

/* database */ const db = monk('localhost/meower');
/* collection */ const mews = db.get('mews');
app.use(express.json());
app.use(cors());

app.use(volleyball);

app.get('/', (req, res) => {
  res.json({
    message: 'meow!',
  });
});

const isValidMew = mew => {
  return (
    mew.name &&
    mew.name.toString().trim() !== '' &&
    mew.content &&
    mew.content.toString().trim() !== ''
  );
};

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

app.listen(5500, () => {
  console.log('Listening on http://localhost:5500');
});
