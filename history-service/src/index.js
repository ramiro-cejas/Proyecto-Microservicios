const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let channel, connection;
const connectRabbitMQ = async () => {
  let retries = 20; // Número de intentos de reconexión
  while (retries) {
    try {
      console.log('Intentando conectar a RabbitMQ...');
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue('movieHistory');
      console.log('Conexión exitosa a RabbitMQ');
      return;
    } catch (error) {
      console.error('Error conectando a RabbitMQ:', error.message);
      retries -= 1;
      console.log(`Reintentando conexión... Intentos restantes: ${retries}`);
      await delay(5000); // Espera 5 segundos antes de reintentar
    }
  }
  console.error('No se pudo conectar a RabbitMQ después de varios intentos.');
  process.exit(1); // Terminar el servicio si no se pudo conectar
};

app.post('/history', async (req, res) => {
  const { userId, movieId, watchedAt } = req.body;

  if (!userId || !movieId || !watchedAt) {
    return res.status(400).send({ error: 'Faltan datos requeridos' });
  }

  const message = { userId, movieId, watchedAt };

  try {
    channel.sendToQueue('movieHistory', Buffer.from(JSON.stringify(message)));
    console.log('Mensaje enviado a RabbitMQ:', message);

    res.status(200).send({ message: 'Historial guardado y enviado a RabbitMQ' });
  } catch (error) {
    console.error('Error enviando a RabbitMQ:', error);
    res.status(500).send({ error: 'No se pudo procesar la solicitud' });
  }
});

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  await connectRabbitMQ();
});

process.on('exit', () => {
  if (connection) connection.close();
});
