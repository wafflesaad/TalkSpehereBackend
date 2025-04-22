import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';
import callRouter from './routes/callRouter.js';

const app = express()
const server = require('http').Server(app);
export const io = require('socket.io')(server)

const port = process.env.PORT || 4000
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.get('/', (req,res)=>res.send("Hello world"));
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/call', callRouter);

server.listen(port,()=>console.log(`Server started on ${port}`))



