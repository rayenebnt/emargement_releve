import express, { Request, Response } from 'express';
import cors from 'cors';
import routerusers from './routes/Users';

const app = express();

process.env.TZ = 'Europe/Paris';

const port = process.env.PORT || 3036; // Utilisez le port défini par Heroku ou 3036 par défaut
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: '*' }));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to my website');
});

app.post('/', (req: Request, res: Response) => {
  res.send('Je suis une requête POST');
});

app.use('/user', routerusers); // Utilisez '/user' comme préfixe

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
