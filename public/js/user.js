class User{
    constructor(name, id, role){
        this.name = name
        this.id = id
        this.role = role
        this.nodeHtml = this.#createNodoHtml()
    }

    #createNodoHtml(){
        console.log(this.role, this.name)
        const buttonHTML = `
            <button class="btn-none ${this.role === 'user' ? 'hidden' : ''}">
                <img src="/img/logout.svg" alt="">
            </button>
        `;

        const liHTML = `
            <li class="item-user" id="_${this.id}">
                <h3>
                    <div class="circle-small color-bronw"></div>
                    ${this.name}
                </h3>
                ${buttonHTML}
            </li>
        `;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = liHTML;
        const li = tempDiv.firstElementChild;
        const button = li.querySelector("button");

        button.addEventListener("click", () => {
            const deleteEvent = new CustomEvent("deleteUser", {
                detail: {
                    userId: this.id
                }
            })

            document.dispatchEvent(deleteEvent)
        });

        document.querySelectorAll(".list-users").forEach(ltU => {
            const liClone = li.cloneNode(true);
            liClone.querySelector("button").addEventListener("click", () => {
                const deleteEvent = new CustomEvent("deleteUser", {
                    detail: {
                        userId: this.id
                    }
                })
    
                document.dispatchEvent(deleteEvent)
            });
            ltU.appendChild(liClone);
        });

        return li
    }

    delete(){
        const listUser = document.querySelectorAll(".list-users")
        listUser.forEach(usNode => {
            const userItem = usNode.querySelector(`#_${this.id}`);
            if (userItem) {
                usNode.removeChild(userItem);
            }
        });
    }

    getUserJson(){
        return {
            id: this.id,
            name: this.name,
            role: this.role
        }
    }

    changeActionsRole(role){
        
        const buttons = document.querySelectorAll(`#_${this.id} button`);
        console.log(buttons, this.name, role)
        buttons.forEach(button => {
            if (role === 'admin') {
                button.classList.remove('hidden');
            } else if (role === 'user') {
                button.classList.add('hidden');
            }
        });
    }

}

class Users{
    #users
    constructor(){
        this.#users = []
    }

    addUser(user){
        if(user instanceof User){
            this.#users.push(user)
        }
    }

    deleteUser(idUser){
        const indexUser = this.#users.findIndex(user=>user.id == idUser)
        if(indexUser !== -1){
            const user = this.#users[indexUser]
            user.delete()
            this.#users.splice(indexUser, 1)
        }
    }

    getUsers(){
        return this.#users.map(user=>user.getUserJson())
    }

    convertUsersJson(usersJson){
        usersJson.forEach(userJ=>{
            const user = new User(
                userJ.name,
                userJ.id, 
                userJ.role
            )
            this.#users.push(user)
        })
    }

    getUser(idUser){
        return this.#users.find(us=>us.id==idUser)
    }

    changeActionsRole(role){
        console.log(role, "change")
        this.#users.forEach(user=>user.changeActionsRole(role))
    }
}