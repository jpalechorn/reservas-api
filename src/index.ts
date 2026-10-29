import 'dotenv/config';
import express from 'express';
import spaceRoutes from './routes/space.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/spaces', spaceRoutes);

app.listen(PORT, () => {
  console.log(`ReservasAPI corriendo en http://localhost:${PORT}`);
});