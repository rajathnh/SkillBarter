// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser'); 
// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes');

app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/profile', require('./routes/profileRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));