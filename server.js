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
import userModel from './models/usqerModel.js';

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors:{
    origin: ["http://localhost:8080", "http://localhost:8081"],
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
  origin: ["http://localhost:8080", "http://localhost:8081"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Routes
app.get('/', (req,res)=>res.send("Hello world"));
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

  console.log('client connected', socket.id);
  
  socket.on('joinRoom', async (data)=>{

    let senderMail = data.sender;
    let receiverMail = data.receiver;
    
    const sender = await userModel.findOne({email: senderMail})
    const receiver = await userModel.findOne({email: receiverMail})

    let roomId = getRoomId(sender._id.toString(), receiver._id.toString());

    socket.join(roomId);
    console.log(`${sender._id.toString()} joined room ${roomId}`);
    

  })

  socket.on("sendMessage", async (data)=>{

    const sender = await userModel.findOne({email: data.sender})
    const receiver = await userModel.findOne({email: data.receiver})

    let message = data.message;

    let roomId = getRoomId(sender._id.toString(), receiver._id.toString())

    io.to(roomId).emit("receiveMessage", message)
    console.log("MEssage emitted");
    

  })

});


server.listen(port,()=>console.log(`Server started on ${port}`))



