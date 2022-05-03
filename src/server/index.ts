import express from 'express';

export const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

import './answer';
import './cbHook';
import './calls';

const port = process.env.PORT || 4040;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`),
);
