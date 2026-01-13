console.clear();
import app from './app';
import { initialize_database } from './Database/InitializeConnection';

const port = process.env.PORT || 5000;

initialize_database().then(() => {
  app.listen(port, () => {
    console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
  });
});
