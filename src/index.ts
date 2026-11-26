import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import spaceRoutes from './routes/space.routes';
import authRoutes from './routes/auth.routes';
import { swaggerSpec } from './docs/swagger';
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

// Documentación: página de Swagger UI y especificación OpenAPI en JSON.
// Va antes de notFoundMiddleware; si no, /api-docs respondería 404.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Siempre al FINAL, después de todas las rutas: primero la ruta inexistente (404)
// y luego el middleware de errores (cuatro parámetros).
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`ReservasAPI corriendo en http://localhost:${PORT}`);
  console.log(`Documentación en http://localhost:${PORT}/api-docs`);
});
