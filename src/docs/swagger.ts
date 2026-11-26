import swaggerJsdoc from 'swagger-jsdoc';

// Especificación OpenAPI de ReservasAPI.
// Aquí van los datos generales, la seguridad y los esquemas que se reutilizan;
// cada endpoint se documenta con un comentario @swagger encima de su ruta en src/routes.
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReservasAPI',
      version: '1.0.0',
      description: 'API para gestionar espacios y sus reservas, con autenticacion JWT y roles ADMIN, OWNER y CLIENT'
    },
    servers: [{ url: '/', description: 'Este servidor' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Space: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Sala 101' },
            capacity: { type: 'integer', example: 20 },
            location: { type: 'string', example: 'Bloque A' },
            type: { type: 'string', example: 'aula' },
            ownerId: { type: 'integer', example: 2 }
          }
        },
        SpaceInput: {
          type: 'object',
          required: ['name', 'capacity', 'location', 'type'],
          properties: {
            name: { type: 'string', minLength: 2, example: 'Sala de Juntas Norte' },
            capacity: { type: 'integer', minimum: 1, example: 12 },
            location: { type: 'string', example: 'Bloque B, piso 2' },
            type: { type: 'string', example: 'sala de reuniones' }
          }
        },
        SpaceUpdate: {
          type: 'object',
          minProperties: 1,
          description: 'Todos los campos son opcionales, pero debe venir al menos uno',
          properties: {
            name: { type: 'string', minLength: 2, example: 'Sala de Juntas Norte' },
            capacity: { type: 'integer', minimum: 1, example: 15 },
            location: { type: 'string', example: 'Bloque B, piso 2' },
            type: { type: 'string', example: 'sala de reuniones' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 4 },
            name: { type: 'string', example: 'Cliente Prueba' },
            email: { type: 'string', example: 'cliente@reservas.com' },
            role: { type: 'string', enum: ['ADMIN', 'OWNER', 'CLIENT'], example: 'CLIENT' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Datos de entrada invalidos' },
                details: {
                  type: 'array',
                  description: 'Solo en VALIDATION_ERROR: un elemento por cada campo que fallo',
                  items: {
                    type: 'object',
                    properties: {
                      campo: { type: 'string', example: 'capacity' },
                      mensaje: { type: 'string', example: 'capacity debe ser un numero' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Respuestas de error que se repiten en varias rutas
      responses: {
        BadRequest: {
          description: 'Datos de entrada invalidos (VALIDATION_ERROR) o JSON mal escrito (INVALID_JSON)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
        },
        Unauthorized: {
          description: 'Falta el token (TOKEN_MISSING) o no es valido (TOKEN_INVALID)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
        },
        Forbidden: {
          description: 'El rol no tiene permiso (FORBIDDEN_ROLE) o el espacio no es suyo (NOT_SPACE_OWNER)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
        },
        NotFound: {
          description: 'El espacio no existe (SPACE_NOT_FOUND)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
        },
        Conflict: {
          description: 'Valor unico repetido (EMAIL_TAKEN o DUPLICATE)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
});
