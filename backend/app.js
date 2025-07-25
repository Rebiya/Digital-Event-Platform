const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const indexRoute = require('./routes/index.routes');


dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use('/api', indexRoute);


console.log('LIVEKIT_API_KEY:', process.env.LIVEKIT_API_KEY);
console.log('LIVEKIT_API_SECRET:', process.env.LIVEKIT_API_SECRET);
console.log('Port:', process.env.PORT);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Token server running on port ${PORT}`);
});
