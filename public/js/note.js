class Note{
    #noteHtml
    #draggable
    #offset
    #color
    #position

    constructor(content, color, id="", position={x: 20, y: 20}){
        console.log("Creando la nota")
        this.id = id ? id : generateId()
        this.content = content
        this.#color = color
        this.#position = position
        this.#draggable = false
        this.#noteHtml = this.#createNoteHtml()
        this.#offset = {
            x: 0,
            y: 0
        }
    }

    getNote(){
        return this.#noteHtml
    }

    setDraggable(value){
        this.#draggable = value
    }

    getNoteJson(){
        return {
            id: this.id,
            position: this.getPosition(),
            color: this.#color,
            content: this.content
        }
    }

    getPosition(){
        return this.#position
    }

    #startMove(e){
        e.preventDefault()
        this.#offset.x = e.clientX - this.#noteHtml.getBoundingClientRect().left
        this.#offset.y = e.clientY - this.#noteHtml.getBoundingClientRect().top
        this.#noteHtml.style.cursor = "move"
        this.#draggable = true
    }

    #finishMove(e){
        this.#noteHtml.style.cursor = "pointer"
        this.#draggable = false
    }

    move(x, y){
        if(this.#draggable){
            console.log("moviendo")
            this.#position.x = (x-this.#offset.x)
            this.#position.y = (y-this.#offset.y)
            this.#noteHtml.style.top = this.#position.y+"px"
            this.#noteHtml.style.left = this.#position.x+"px"
            const eventMove = new CustomEvent("noteMove", {
                detail: {
                    note: this.getNoteJson()
                }
            })
            document.dispatchEvent(eventMove)
        }
    }

    receiveMovement(x, y){
        this.#position.x = x
        this.#position.y = y
        this.#noteHtml.style.top = this.#position.y+"px"
        this.#noteHtml.style.left = this.#position.x+"px"
    }

    #createNoteHtml(){
        const div = document.createElement("div")
        const p = document.createElement("p")
        div.id = this.id
        div.classList.add("note")
        p.textContent = this.content
        div.style.backgroundColor = this.#color
        div.style.top = this.#position.y+"px"
        div.style.left = this.#position.x+"px"

        div.addEventListener("mousedown", this.#startMove.bind(this))

        div.addEventListener("mouseup", this.#finishMove.bind(this))

        div.addEventListener("contextmenu", (e)=>{
            e.preventDefault()
            const eventDialog = new CustomEvent("openDialog", {
                detail: {
                    id: this.id,
                    position: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            })
            document.dispatchEvent(eventDialog)
        })

        div.appendChild(p)

        return div
    }
}

class NoteList{
    #notes
    #pizarra
    constructor(pizarra){
        this.#notes = []
        this.#pizarra = pizarra
    }

    #emitEvent(nameEvent, data){
        const eventEmit = new CustomEvent(nameEvent, {
            detail: data
        })

        document.dispatchEvent(eventEmit)
    }

    getNotesJson(){
        return this.#notes.map(note=>note.getNoteJson())
    }

    convertNotesJson(notesJson){
        notesJson.forEach(noteJson=>{
            const newNote = new Note(
                noteJson.content,
                noteJson.color,
                noteJson.id,
                noteJson.position
            )
            this.#notes.push(newNote)
            this.#pizarra.appendChild(newNote.getNote())
        })
    }

    addNote(note, statusEmitEvent=true){
        if(note instanceof Note){
            this.#notes.push(note)
            this.#pizarra.appendChild(note.getNote())
            if(statusEmitEvent){
                this.#emitEvent("addNote", {
                    note: note.getNoteJson()
                })
            }
        }else{
            console.error("Only instances of Note can be added")
        }
    }

    move(idNote, position){
        const note = this.#notes.find(nt=>nt.id === idNote)
        if(note){
            note.receiveMovement(position.x, position.y)
        }
    }

    findNote(idNote){
        return this.#notes.find(nt=>nt.id === idNote)
    }

    moveNotes(position){
        this.#notes.forEach(note=>{
            note.move(position.x, position.y)
        })
    }

    removeNote(idNote){
        const index = this.#notes.findIndex(note=>note.id === idNote)
        console.log(index)
        if(index !== -1){
            const note = this.#notes[index]
            this.#pizarra.removeChild(note.getNote())
            this.#notes.splice(index, 1)
        }
    }
}