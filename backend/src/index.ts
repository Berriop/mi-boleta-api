import 'reflect-metadata';
import app from './app';
import { env } from './infrastructure/config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}/api/v1`);
});
