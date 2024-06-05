const socket = io()
let move = false
const itpNameServer = document.getElementById("iptNameServer")
const btnJoin = document.getElementById("btnJoin")
const btnCreate = document.getElementById("btnCreate")
const note = document.getElementById("note")

let notas = []

socket.on("statusServer", (nameServer)=>{
    itpNameServer.value = nameServer
    itpNameServer.readOnly = true
    btnJoin.textContent = "Discconect"
})

socket.on("solicitarNotas", (idReceptor)=>{
    socket.emit("enviarNotas", idReceptor, notas)
    console.log("Enviando notas----", notas)
})

socket.on("notasIniciales", (notasIniciales)=>{
    console.log(notasIniciales)
    notasIniciales.forEach(nota => {
        addNoteToInterface(nota);
    });

    notas = notasIniciales
})

socket.on('nuevaNota', (nota) => {
    console.log("ente")
    notas.push(nota)
    addNoteToInterface(nota);
});

socket.on("moverNota", (notaId, notaPosition)=>{
    moverNotaEnInterfaz(notaId, notaPosition)
})

socket.on("h1", (msg, noteData)=>{
    console.log(msg, noteData)
})

document.getElementById('btnAgregar').addEventListener('click', () => {
    const contenidoNota = document.getElementById('nuevaNota').value;
    const nuevaNota = { id: new Date().getTime(), contenido: contenidoNota, position: { x: 0, y: 0 } };
    notas.push(nuevaNota); // Añadir la nueva nota a la lista de notas locales
    socket.emit('nuevaNota', itpNameServer.value, nuevaNota);
    addNoteToInterface(nuevaNota);
    document.getElementById('nuevaNota').value = '';
});

function addNoteToInterface(nota){
    const newNote = document.createElement("div")
    newNote.textContent = nota.contenido
    newNote.id = nota.id
    newNote.className = "nota"
    newNote.style.left = nota.position.x + "px"
    newNote.style.top = nota.position.y + "px"
    newNote.draggable = true
    newNote.ondragend = (e)=>{
        const newPosition = {
            x: e.clientX,
            y: e.clientY
        }
        nota.position = newPosition
        socket.emit("moverNota", itpNameServer.value, nota.id, newPosition)
        newNote.style.left = newPosition.x + "px"
        newNote.style.top = newPosition.y + "px"
    }

    document.body.appendChild(newNote)
}

function moverNotaEnInterfaz(idNota, nuevaPosicion) {
    const nota = document.getElementById(idNota);
    const indexNote = notas.findIndex((nt)=>nt.id == idNota)

    if (nota && indexNote !== -1 ) { 
        nota.style.left = nuevaPosicion.x + 'px';
        nota.style.top = nuevaPosicion.y + 'px';
        notas[indexNote] = {
            id: idNota,
            contenido: nota.textContent,
            position: nuevaPosicion
        }
    }
}

btnJoin.addEventListener("click", ()=>{
    if(itpNameServer.value){
        if(btnJoin.textContent == "Join"){

            socket.emit("join server", itpNameServer.value)
            itpNameServer.readOnly = true
            btnJoin.textContent = "Discconect"
        }
        else if(btnJoin.textContent == "Discconect"){
            socket.emit("leave server", itpNameServer.value)
            itpNameServer.readOnly = false
            btnJoin.textContent = "Join"
            notas.forEach(nota =>{
                const nt = document.getElementById(nota.id)
                document.body.removeChild(nt)
            })
            notas = []
            itpNameServer.value = ""
        }
    }
})

btnCreate.addEventListener("click", ()=>{
    socket.emit("createServer")
})


