import express from 'express'
import http from "http"
import { fileURLToPath } from 'url'
import {dirname, join} from "node:path"
import { Server } from 'socket.io'
import cryptoRandomString from "crypto-random-string"
import router from './routes/index.js'


const app = express()
const server = http.createServer(app)
const io = new Server(server)

const db = [
    {
        server: "",
        userId: ""
    }
]

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(join(__dirname, 'public')));
app.use('/', router);

io.on("connection", (socket)=>{
    console.log("User connect ✅")

    socket.on("createServer", ()=>{
        const newServerName = cryptoRandomString({length: 10})
        console.log(newServerName)
        socket.emit("statusServer", newServerName)
        socket.join(newServerName)
        db.push({
            server: newServerName,
            userId: socket.id
        })
    })


    socket.on("join server", (nameServer)=>{
        const userServer = db.find(ser=>ser.server == nameServer)
        if(userServer){
            socket.join(userServer.server)
            io.to(userServer.server).emit("h1", `User Conected servidor: ${nameServer}`)
            io.to(userServer.userId).emit("solicitarNotas", socket.id)
        }else{
            console.log("Server not found")
        }
    })

    socket.on("enviarNotas", (idReceptor, notas)=>{
        io.to(idReceptor).emit("notasIniciales", notas)
    })

    socket.on("leave server", (nameServer)=>{
        console.log(nameServer)
        const room = db.find(sev=>sev.userId == socket.id)
        if(room){
            console.log("Salir All rooms")
            io.socketsLeave(nameServer)
        }else{
            io.to(nameServer).emit("h1", `User Desconectado del servidor: ${nameServer}`)
            socket.leave(nameServer)
        }
    })

    socket.on('nuevaNota', (nombreSala, nuevaNota) => {
        socket.broadcast.to(nombreSala).emit('nuevaNota', nuevaNota);
    });

    socket.on("moverNota", (nameServer, notaId, notaPosition)=>{
        io.to(nameServer).emit("moverNota", notaId, notaPosition)
    })

    socket.on("disconnect", ()=> console.log("User disconnect ❌"))
})


const PORT = 3000
server.listen(PORT, ()=> console.log(`Server running on port: ${PORT}`))