const { v4: uuidV4} = require('uuid');
import { io } from '../server.js';

export const makeRoom = (req,res)=>{
    res.redirect(`/api/call/:${uuidV4()}`)
}

const handleRoom = (req,res)=>{

    const {userId} = req.body.userID;
    

}


io.on('connection',socket=>{
    socket.on('join-room', (roomId, userID)=>{

    })
});

