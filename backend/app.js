const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const indexRoute = require('./routes/index.routes');


dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000','http://192.168.43.178:5173','http://192.168.1.9:5173','http://192.168.127.177:3001','http://192.168.127.177:5173'],
  credentials: true
}));
app.use(express.json());


app.use('/api', indexRoute);


// console.log('LIVEKIT_API_KEY:', process.env.LIVEKIT_API_KEY);
// console.log('LIVEKIT_API_SECRET:', process.env.LIVEKIT_API_SECRET);
// console.log('Port:', process.env.PORT);

const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Token server running at http://0.0.0.0:${PORT}`);
});

