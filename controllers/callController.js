import {v4} from 'uuid';

export const makeRoom = (req,res)=>{
    res.redirect(`/api/call/:${v4()}`)
}

export const handleRoom = (req,res)=>{

    const {userId} = req.body.userID;
    const roomId = req.param.roomId;
    
    if (!roomId || !userId) {
        return res.status(400).json({ success: false, message: 'roomId and userId are required' });
    }

    console.log(userId);
    console.log(roomId);
    
    const socket = io.sockets.sockets.get(userId); // Get the user's socket by their userId
    if (socket) {
        socket.join(roomId); // Add the user to the room
        io.to(roomId).emit('user-connected', userId); // Notify others in the room
        return res.json({ success: true, message: `User ${userId} joined room ${roomId}` });
  } else {
        return res.status(404).json({ success: false, message: 'User not connected to socket.io' });
  }

}



