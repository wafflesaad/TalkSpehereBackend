import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';
import callRouter from './routes/callRouter.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userModel from './models/userModel.js';


const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors:{
    origin: ["http://localhost:8080", "http://localhost:8081", "https://talk-sphere-frontend-green.vercel.app"],
    methods: ["GET", "POST"],
    credentials:true
}
})


const port = process.env.PORT || 4000
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:8081","http://localhost:8082", "https://talk-sphere-frontend-green.vercel.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Routes
app.get('/', (req,res)=>res.send("Hello world"));
app.get('/test', (req,res)=>res.json({res: "ok"}));
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/call', callRouter);

// remove in production
app.get("/updateDb",async (req,res)=>{
  const result = await userModel.updateMany(
    {}, // Match all documents
    {
      $set: {
        friendList: [],
        pendingRequests: [],
        inCall: false
      },
    }
  );

  return res.json({success:true});

})


let getRoomId = (sender, receiver)=>{

  return [sender,receiver].sort().join("-");

}

io.on('connection', (socket)=>{

  console.log(':client connected', socket.id);
  
  socket.on('joinRoom', async (data)=>{

    let senderMail = data.sender;
    let receiverMail = data.receiver;
    
    const sender = await userModel.findOne({email: senderMail})
    const receiver = await userModel.findOne({email: receiverMail})

    let roomId = getRoomId(sender._id.toString(), receiver._id.toString());

    socket.join(roomId);
    console.log(`::${senderMail} joined room ${roomId}`);
    

  })

  socket.on("sendMessage", async (data)=>{
    const sender = await userModel.findOne({email: data.sender})
    const receiver = await userModel.findOne({email: data.receiver})
    let message = data.message;
    let roomId = getRoomId(sender._id.toString(), receiver._id.toString())
    
    // For video call messages, emit to everyone in the room
    if (message === "_video_accepted") {
      io.to(roomId).emit("receiveMessage", message);
    } else {
      // For regular messages, emit to everyone except sender
      socket.to(roomId).emit("receiveMessage", message);
    }
    console.log(`:::[emitted ${data.sender} -> ${data.receiver}]: ${message}`);
  })

});


server.listen(port,()=>console.log(`Server started on ${port}`))



