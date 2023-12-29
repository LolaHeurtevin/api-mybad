const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'

const endpointsFiles = ['./routes/index.js']

const doc = {
    info: {
        title: 'MyBad',
        description: 'Système de réservation de terrains de badminton.',
    },
    host: 'localhost:5001',
    schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc)
