// Obtenemos los elementos
const socket = io()
const notyf = new Notyf({
    position: {
        x: "center",
        y: "top"
    }
});
const pizarra = document.getElementById("pizarra")
const btnAddNote = document.getElementById("btnAddNote")
const containerCenter = document.getElementById("containerCenter")
const containerRight = document.getElementById("containerRight")
const txtNote = document.getElementById("txtNote")
const btnCancel = document.getElementById("btnCancel")
const btnShare = document.querySelector(".btn-share")
const btnUsers = document.querySelector(".btn-users")
const btnMenu = document.querySelector(".btn-menu")
const btnColorYellow = document.getElementById("btnColorYellow")
const btnColorPeach = document.getElementById("btnColorPeach")
const btnColorAqua = document.getElementById("btnColorAqua")
const btnDeleteNote = document.getElementById("btnDeleteNote")
const iptProjectName = document.getElementById("iptProjectName")


let colorNote = ""
let idSala = ""
let idNoteRemove = ""
let nameUser = ""
let users = new Users()
let user = {}
const notes = new NoteList(pizarra)

//Eventos de click
btnAddNote.addEventListener("click", ()=>{
    openAddNoteCard()
})
btnCancel.addEventListener("click", ()=>{
    closeCardAddNote()
})

btnShare.addEventListener("click", ()=>{
    openCardShareRoom()
})

btnUsers.addEventListener("click", ()=>{
    openMenuUsers()
})

btnMenu.addEventListener("click", ()=>{
    openMenu()
})

btnColorAqua.addEventListener("click", (e)=>{
    changeColorNote("--note-aqua-dark")
})

btnColorYellow.addEventListener("click", (e)=>{
    changeColorNote("--note-yellow-dark")

})

btnColorPeach.addEventListener("click", (e)=>{
    changeColorNote("--note-peach-dark")
})



document.getElementById("btnCloseCardShare").addEventListener("click", ()=>{
    closeCardShareRoom()
})

document.getElementById("btnCloseUsersMenu").addEventListener("click", ()=>{
    closeMenuUsers()
})

document.getElementById("btnCloseMenu").addEventListener("click", ()=>{
    closeMenu()
})

cardAddNote.addEventListener("submit", e=>{
    e.preventDefault()
    if(txtNote.value){

        colorNote = colorNote ? colorNote : "var(--note-crema)"

        const newNote = new Note(content=txtNote.value, color=colorNote, )
        notes.addNote(newNote)
        closeCardAddNote()
    }
    console.log(txtNote.value)
})

pizarra.addEventListener("mousemove", (e)=>{
    notes.moveNotes({
        x: e.clientX,
        y: e.clientY
    })
})

document.addEventListener("noteMove", (e)=>{
    //console.log("Nota: ", e.detail.note)
    console.log(e.detail.note.position)
    socket.emit("moverNota", idSala,e.detail.note)
})


document.addEventListener("addNote", (e)=>{
    console.log("Nota Añadida: ", e.detail.note)
    socket.emit("nuevaNota", idSala, e.detail.note)

})

document.addEventListener("openDialog", (e)=>{
    console.log(e.detail)
    idNoteRemove = e.detail.id
    btnDeleteNote.style.top = e.detail.position.y+"px"
    btnDeleteNote.style.left = e.detail.position.x+"px"
    btnDeleteNote.classList.remove("hidden")
})

btnDeleteNote.addEventListener("click", ()=>{
    if(idNoteRemove){
        console.log("Elimando: ", idNoteRemove)
        notes.removeNote(idNoteRemove)
        socket.emit("removeNote", idSala,idNoteRemove)
        btnDeleteNote.classList.add("hidden")
    removeNote}
})

document.getElementById("cardNameUser").addEventListener("submit", (e)=>{
    e.preventDefault()
    const txtNameUser = document.getElementById("txtNameUser")
    if(txtNameUser.value && idSala){
        nameUser = txtNameUser.value
        startLoader("loaderCubic")
        document.getElementById("cardNameUser").classList.add("hidden")
        txtNameUser.value = ""
        
        socket.emit("join server", idSala, nameUser, (response)=>{
            stopLoader("loaderCubic")
            if(response.success && response.user){
                notyf.success(response.success)
                users.convertUsersJson([response.user])
                user = response.user
                containerCenter.classList.add("hidden")
                document.getElementById("nameUser").textContent = nameUser
                document.querySelectorAll("id-room").forEach(span=>{
                    span.textContent = idSala
                })
            }
            else if(response.error){
                notyf.error(response.error)
                document.getElementById("cardNameUser").classList.remove("hidden")
            }
        })
    }
})

window.addEventListener("load", ()=>{
    containerCenter.classList.remove("hidden")
    document.getElementById("cardNameUser").classList.remove("hidden")
    
})

document.addEventListener("deleteUser", e=>{
    alert(e.detail.userId)
    const userDelete = users.getUser(e.detail.userId)
    socket.emit("leaveRoom", idSala, userDelete.role, userDelete.id)
})

document.querySelectorAll(".btn-leave-room").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        if(user.role == "admin"){
            socket.emit("closeAllRoom", idSala)
        }else{
            socket.emit("leaveRoom", idSala, user.role, user.id)
        }
    })
})

document.querySelectorAll(".btn-share-whatsapp").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const url = window.location.href; // Reemplaza con la URL que deseas compartir
        const text = `NoteSync join: ${encodeURIComponent(url)}`;
        const whatsappUrl = `https://wa.me/?text=${text}`;
        window.open(whatsappUrl, "_blank");
    })
})

document.querySelectorAll(".btn-share-facebook").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const url = window.location.href // Reemplaza con la URL que deseas compartir
        const text = encodeURIComponent(url);
        // URL de Facebook para compartir
        var facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + text;
    
        // Abrir una nueva ventana para compartir en Facebook
        window.open(facebookShareUrl, 'popup', 'width=600,height=600');
    })
})

document.querySelectorAll(".btn-share-link").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const textCopy = window.location.href
        navigator.clipboard.writeText(textCopy).then(function() {
            notyf.success("Copy success")
        }).catch(function(error) {
            notyf.success("Copy error")

        });
    })
})
document.querySelectorAll(".btn-copy").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        navigator.clipboard.writeText(idSala).then(function() {
            notyf.success("Copy success")
        }).catch(function(error) {
            notyf.success("Copy error")

        });
    })
})

iptProjectName.addEventListener("input", (e)=>{
    console.log(e.target.value)
    socket.emit("changeNameProject", idSala,e.target.value)
})


// Soket io

socket.on("connect", ()=>{
    idSala = getPathParam()
    console.log("Conectado desde el cliente", idSala)


    socket.emit("userConnected", idSala)

    socket.on("disconnect", ()=>{
        console.log("usuario desconetado")
    })
})

socket.on("statusUser", (userSala)=>{
    user.id = userSala.id
    user.name = userSala.name
    user.role = userSala.role
    users.push(user)
    console.log("user recibido")
    addItemUser(user.name, user.id, user.role)
})

socket.on("changeNameProject", (name)=>{
    iptProjectName.focus()
    iptProjectName.value = name
})

socket.on("statusAdmin", (msg)=>{
    notyf.success(msg)
    user.role = "admin"
    users.changeActionsRole("admin")
    socket.emit("changeRole", "admin")
})

socket.on("solicitarNotas", (idReceptor)=>{
    const notesJson = notes.getNotesJson()
    socket.emit("enviarNotas", idReceptor, notesJson)
    console.log("Enviando notas----", notesJson)
})


socket.on("solicitarUsers", (idReceptor)=>{
    socket.emit("enviarUsers", idReceptor, users.getUsers())
    console.log("Enviando users----", users)
})



socket.on("notasIniciales", (notasIniciales)=>{
    console.log(notasIniciales)
    notes.convertNotesJson(notasIniciales)
})

socket.on("usersIniciales", (usersIniciales)=>{
    console.log(usersIniciales)
    const idx = usersIniciales.findIndex(us=>us.id == user.id)
    if(idx!== -1){
        const usersTemp = usersIniciales
        usersTemp.splice(idx, 1)
        users.convertUsersJson(usersTemp)
        users.changeActionsRole(user.role)
    }
    //users = usersIniciales
    //console.log("Users recebidos: ", usersIniciales)
    //console.log("Users totales: ", users)
    //users.forEach(us=>{
    //    if(us.id !== user.id) addItemUser(us.name, us.id, user.role)
    //})
})

socket.on('nuevaNota', (noteJson) => {
    console.log("ente")
    notes.convertNotesJson([noteJson])
    //addNoteToInterface(nota);
});

socket.on('removeNote', (idNote) => {
    notes.removeNote(idNote)
});

socket.on("moverNota", (note)=>{
    //moverNotaEnInterfaz(notaId, notaPosition)
    console.log("Socket mover: ", note.position)
    notes.move(note.id, note.position)
})

socket.on("h1", (msg, noteData)=>{
    console.log(msg, noteData)
})

socket.on("userConnect", (userConnect)=>{
    notyf.success(`${userConnect.name} connected to the room`)
    console.log(userConnect)
    users.convertUsersJson([userConnect])
    users.changeActionsRole(user.role)
    //addItemUser(user.name, user.id, user.role)
})

socket.on("userDesconnect", (userId)=>{
    //const index = users.findIndex(us=>us.id == userId)
    //const userDelete = users[index]
    const deleteUser = users.getUser(userId)
    notyf.error(`${deleteUser.name} disconnects from the room`)
    users.deleteUser(userId)
    //deleteItemUser(userId)
})

socket.on("success", (msg)=>{
    notyf.success(msg)
})

socket.on("error", (msg)=>{
    notyf.error(msg)
})

socket.on("disconnected", (msg)=>{
    notyf.error(msg)
    window.location.href = "/join"
})

socket.on("closeAllRoom", ()=>{
    console.log("La sala se cerro")
    notyf.error("La sala finalizo")
    window.location.href = "/join"
})



// funciones

function openAddNoteCard(){
    containerCenter.classList.remove("hidden")
    document.getElementById("cardAddNote").classList.remove("hidden")
}

function closeCardAddNote(){
    containerCenter.classList.add("hidden")
    document.getElementById("cardAddNote").classList.add("hidden")
    txtNote.value = ""
    changeColorNote("--note-crema")
}

function openCardShareRoom(){
    containerCenter.classList.remove("hidden")
    document.getElementById("cardShareNote").classList.remove("hidden")
}

function closeCardShareRoom(){
    containerCenter.classList.add("hidden")
    document.getElementById("cardShareNote").classList.add("hidden")
}

function closeMenuUsers(){
    document.getElementById("usersMenu").classList.replace("open-menu-right", "close-menu-right")
    containerRight.classList.replace("visible-animation","hidden-animation")
}

function openMenuUsers(){
    containerRight.classList.remove("hidden")
    containerRight.classList.replace("hidden-animation", "visible-animation")
    document.getElementById("usersMenu").classList.replace("close-menu-right", "open-menu-right")
}
    
function closeMenu(){
    document.getElementById("menuSmall").classList.replace("open-menu-right", "close-menu-right")
    document.getElementById("containerFull").classList.replace("visible-animation","hidden-animation")
}
function openMenu(){
    document.getElementById("containerFull").classList.remove("hidden")
    document.getElementById("containerFull").classList.replace("hidden-animation", "visible-animation")
    document.getElementById("menuSmall").classList.replace("close-menu-right", "open-menu-right")
}

function startLoader(idLoader){
    document.getElementById(idLoader).classList.remove("hidden")
}

function stopLoader(idLoader){
    document.getElementById(idLoader).classList.add("hidden")
}

function changeColorNote(color){
    colorNote = `var(${color})`
    document.getElementById("cardAddNote").style.backgroundColor = colorNote
}

function addItemUser(userName, userId, userRole){
    const buttonHTML = `
        <button class="btn-none ${userRole === 'user' ? 'hidden' : ''}">
            <img src="/img/logout.svg" alt="">
        </button>
    `;

    const liHTML = `
        <li class="item-user" id="${userId}">
            <h3>
                <div class="circle-small color-bronw"></div>
                ${userName}
            </h3>
            ${buttonHTML}
        </li>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = liHTML;
    const li = tempDiv.firstElementChild;
    const button = li.querySelector("button");

    button.addEventListener("click", () => {
        socket.emit("deleteUser", userId);
        alert(userId)
    });

    document.querySelectorAll(".list-users").forEach(ltU => {
        const liClone = li.cloneNode(true);
        liClone.querySelector("button").addEventListener("click", () => {
            socket.emit("deleteUser", userId);
            alert(userId)
        });
        ltU.appendChild(liClone);
    });
    
}


function deleteItemUser(userId){
    const listUser = document.querySelectorAll(".list-users")
    listUser.forEach(usNode => {
        const userItem = usNode.querySelector(`#${userId}`);
        if (userItem) {
            usNode.removeChild(userItem);
        }
    });
}



