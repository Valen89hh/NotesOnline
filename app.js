import express from 'express';
import http from "http";
import { fileURLToPath } from 'url';
import { dirname, join } from "node:path";
import { Server } from 'socket.io';
import cryptoRandomString from "crypto-random-string";
import router from './routes/index.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, 'public')));
app.use('/', router);

app.get("/create-sala", async (req, res) => {
    try {
        const newServerName = cryptoRandomString({ length: 10 });



        rooms.set(newServerName, {
            idConnectionAdmin: "",
            users: []
        });

        console.log("Desde server");
        console.log(rooms);
        res.json({
            nameServer: newServerName
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/exist-sala/:nameRoom", (req, res)=>{
    res.json({
        exist: rooms.has(req.params.nameRoom)
    })
})

io.on("connection", (socket) => {
    console.log("User connected ✅");

    socket.on("userConnected", (idSala)=>{
        socket.data.nameRoom = idSala
    })

    socket.on("join server", async (nameServer, nameUser, callback) => {
        try {
            const room = rooms.get(nameServer);

            if (room) {
                if (room.users.length < 10) {
                    const nameUserExist = room.users.find(us => us.name == nameUser);

                    if (!nameUserExist) {
                        if (!room.idConnectionAdmin) {
                            room.idConnectionAdmin = socket.id;
                            socket.data.role = "admin";
                        }

                        const user = {
                            idConnectionUser: socket.id,
                            name: nameUser,
                            role: room.idConnectionAdmin == socket.id ? "admin" : "user"
                        };

                        room.users.push(user);

                        socket.data.nameRoom = nameServer;
                        socket.data.id = user.idConnectionUser;
                        socket.join(nameServer);

                        const userCreate = {
                            id: user.idConnectionUser,
                            name: user.name,
                            role: user.role
                        };

                        socket.broadcast.to(nameServer).emit("userConnect", userCreate);

                        if (user.role == "user") {
                            io.to(room.idConnectionAdmin).emit("solicitarNotas", socket.id);
                            io.to(room.idConnectionAdmin).emit("solicitarUsers", socket.id);
                            socket.data.role = "user";
                        }

                        callback({
                            success: "You joined the room",
                            user: userCreate
                        });
                    } else {
                        callback({
                            error: "The name is being used"
                        });
                    }
                } else {
                    callback({
                        error: "The room is full"
                    });
                }
            } else {
                console.log("Room not found");
                callback({
                    error: "Room not found"
                });
            }
        } catch (err) {
            console.log(err);
            callback({
                error: "There is a problem on the server"
            });
        }
        console.log("Join",rooms)
    });

    socket.on("closeAllRoom", async (nameRoom) => {
        try {
            console.log("Sacanado a todos")
            io.to(nameRoom).emit("closeAllRoom");
            io.socketsLeave(nameRoom);
            rooms.delete(nameRoom);

            
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("leaveRoom", async (nameRoom, role, userId) => {
        try {
            const socketToKick = io.sockets.sockets.get(userId)
            if(socketToKick){
    
                io.to(userId).emit("disconnected", "Te expulsaron de la sala")
                socketToKick.leave(nameRoom)
                if(rooms.has(nameRoom)){
                    const room = rooms.get(nameRoom);
                    const userIndex = room.users.findIndex(us => us.idConnectionUser === userId);
    
                    if (userIndex !== -1) {
                        const [user] = room.users.splice(userIndex, 1);
                        if (role === "admin" && room.users.length > 0) {
                            const newUserAdmin = room.users[0];
                            room.idConnectionAdmin = newUserAdmin.idConnectionUser;
                            io.to(newUserAdmin.idConnectionUser).emit("statusAdmin", "Ahora eres el nuevo admin");
                        }
        
                        io.to(nameRoom).emit("userDesconnect", userId);
        
                
        
                        if (room.users.length === 0) {
                            rooms.delete(nameRoom);
                
                        }
                    }
                }
                
            }
            
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnect', async () => {
        try {
            const nameRoom = socket.data.nameRoom;
            const role = socket.data.role;

            if (nameRoom && role && rooms.has(nameRoom)) {
                const room = rooms.get(nameRoom);
                const userIndex = room.users.findIndex(us => us.idConnectionUser === socket.id);

                if (userIndex !== -1) {
                    const [user] = room.users.splice(userIndex, 1);

                    io.to(nameRoom).emit("userDesconnect", socket.id);

                    if (role === "admin" && room.users.length > 0) {
                        const newUserAdmin = room.users[0];
                        room.idConnectionAdmin = newUserAdmin.idConnectionUser;
                        io.to(newUserAdmin.idConnectionUser).emit("statusAdmin", "Ahora eres el nuevo admin");
                    }

                 

                    if (room.users.length === 0) {
                        rooms.delete(nameRoom);

                    }
                }
            }else{
                if(rooms.has(socket.data.nameRoom)){
                    rooms.delete(socket.data.nameRoom)
                }
            }
        } catch (err) {
            console.log(err);
        }
        console.log("Disconnect",rooms)
    });


    socket.on("changeNameProject", (nameRoom, name)=>{
        socket.broadcast.to(nameRoom).emit("changeNameProject", name)

    })

    socket.on("changeRole", (role)=>{
        socket.data.role = role
    })

    socket.on("enviarNotas", (idReceptor, notas)=>{
        io.to(idReceptor).emit("notasIniciales", notas)
    })

    socket.on("enviarUsers", (idReceptor, users)=>{
        io.to(idReceptor).emit("usersIniciales", users)
    })


    socket.on('nuevaNota', (nombreSala, nuevaNota) => {
        socket.broadcast.to(nombreSala).emit('nuevaNota', nuevaNota);
    });

    socket.on('removeNote', (nombreSala, idNote) => {
        socket.broadcast.to(nombreSala).emit('removeNote', idNote);
    });

    socket.on("moverNota", (nameServer, note) => {
        socket.broadcast.to(nameServer).emit("moverNota", note);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
