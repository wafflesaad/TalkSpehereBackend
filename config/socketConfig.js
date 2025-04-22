export const handleSocketConnections = (io)=>{
    io.on('connection',socket=>{
        socket.on('join-room', (roomId, userId)=>{
            console.log(`User ${userId} joined room ${roomId}`);
            socket.join(roomId);
            socket.to(roomId).emit('user-connected', userId);
    
            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                socket.to(roomId).emit('user-disconnected', userId);
              });
    
        
            socket.on('signal', ({ roomId, signalData }) => {
            socket.to(roomId).emit('signal', signalData);
            });
    
    
        })
    });
    }