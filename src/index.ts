import 'dotenv/config';
import express from 'express';
import spaceRoutes from './routes/space.routes';
import authRoutes from './routes/auth.routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de espacios
app.use('/api/spaces', spaceRoutes);

// Siempre al FINAL, después de todas las rutas: primero la ruta inexistente (404)
// y luego el middleware de errores (cuatro parámetros).
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`ReservasAPI corriendo en http://localhost:${PORT}`);
});
