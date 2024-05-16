const socket = io()
let move = false
const itpNameServer = document.getElementById("iptNameServer")
const btnJoin = document.getElementById("btnJoin")
const note = document.getElementById("note")

addEventListener("mousemove", (e)=>{
    console.log(move)
    if(move && itpNameServer.value && btnJoin.textContent === "Discconect"){
        socket.emit("update note", itpNameServer.value,{
            x: e.clientX,
            y: e.clientY
        })
    }else if(move){
        note.style.top = e.clientY+"px"
        note.style.left = e.clientX+"px"
    }
})

note.addEventListener("click", ()=>move=!move)

btnJoin.addEventListener("click", ()=>{
    if(itpNameServer.value){
        if(btnJoin.textContent == "Join"){

            socket.emit("join server", itpNameServer.value)
            btnJoin.textContent = "Discconect"
        }
        else if(btnJoin.textContent == "Discconect"){
            socket.emit("leave server", itpNameServer.value)
            btnJoin.textContent = "Join"
        }
    }
})

socket.on("update note", (dataNote)=>{
    note.style.top = dataNote.y+"px"
    note.style.left = dataNote.x+"px"
})

socket.on("h1", (msg, noteData)=>{
    console.log(msg, noteData)
})
