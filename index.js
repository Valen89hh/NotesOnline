import express from 'express'
import http from "http"
import { fileURLToPath } from 'url'
import {dirname, join} from "node:path"
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on("connection", (socket)=>{
    console.log("User connect ✅")


    socket.on("join server", (nameServer)=>{
        console.log(nameServer)
        socket.join(nameServer)
        io.to(nameServer).emit("h1", `User Conected servidor: ${nameServer}`)
    })

    socket.on("leave server", (nameServer)=>{
        console.log(nameServer)
        io.to(nameServer).emit("h1", `User Desconectado del servidor: ${nameServer}`)
        socket.leave(nameServer)
    })

    socket.on("update note", (nameServer,noteData)=>{
        io.to(nameServer).emit("update note", noteData)
    })

    socket.on("disconnect", ()=> console.log("User disconnect ❌"))
})


const PORT = 3000
server.listen(PORT, ()=> console.log(`Server running on port: ${PORT}`))