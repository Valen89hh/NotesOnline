//const socket = io()
const btnCreate = document.getElementById("btnCreate")
const btnJoin = document.getElementById("btnJoin")
const iptPin = document.getElementById("iptPin")
const notyf = new Notyf({
    position: {
        x: "center",
        y: "top"
    }
});


btnCreate.addEventListener("click", async(e)=>{
    //socket.emit("createServer")
    btnCreate.disabled = true
    const res = await fetch("/create-sala")
    const data = await res.json()
    console.log(data)
    if(data.nameServer){
        window.location.href = "/sala/"+data.nameServer
        btnCreate.disabled = false
    }
})

btnJoin.addEventListener("click", async(e)=>{
    e.preventDefault()
    btnJoin.disabled = true

    if(iptPin.value){
        const res = await fetch("/exist-sala/"+iptPin.value)
        const data = await res.json()
        if(data.exist){
            notyf.success("Entering the room")
            window.location.href = "/sala/"+iptPin.value
        }else{
            notyf.error("Room not found")
        }
        iptPin.value=""
        btnJoin.disabled = true
    }
})
