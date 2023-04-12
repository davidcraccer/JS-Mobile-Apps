import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

//database setting
const appSettings = {
    databaseURL: "https://encouragemate-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const messagesListInDB = ref(database, "messages")

//dom manipulation
const get = id => document.querySelector(id)
const endorsementMsg = get('#cta-msg')
const addresserEl = get('#addresser')
const receiverEl = get('#receiver')
const publishBtn = get('#cta-btn')
const endorsementsContainer = get('.endorsements-container')
const endorsementsTitle = get('.endorsements h2')

const likeBtn = get('#like-btn')


publishBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (!isValidInputs()) return; 

    const msg = endorsementMsg.value
    const addresser = addresserEl.value
    const receiver = receiverEl.value
    const msgObj = {
        msg,
        addresser,
        receiver,
        likes: 0,
        isLiked: false
    }
    push(messagesListInDB, msgObj)
    clearInputfieldsEl()
})

onValue(messagesListInDB, (snapshot) => {
    if (!snapshot.exists()){
        endorsementsTitle.classList.add('hidden')
        clearMessagesList()
        return
    }
        endorsementsTitle.classList.remove('hidden')

    const messagesArr = Object.entries(snapshot.val())
    //show newest msg on top
    messagesArr.reverse()

    clearMessagesList()
    messagesArr.forEach( item => {
    appendItemToMessagesList(item)
    })
})

function appendItemToMessagesList(item){
    const itemId = item[0]
    const itemValue = item[1]
    let newMsg = `
    <div class="endorsement" data-item-id="${itemId}">
        <p>To ${itemValue.receiver}</p>
        <p class="endorsement-msg">${itemValue.msg}</p>
        <div class="endorsement-bottom flex">
            <p>From ${itemValue.addresser}</p>
            <div class="flex">
                <img src="/assets/icon-heart.png" alt="Heart Icon" class="like-btn">
                <p>${itemValue.likes}</p>
            </div>
        </div>
    </div>
    `
    
    const msgElement = document.createElement('div')
    msgElement.innerHTML = newMsg

    msgElement.addEventListener("dblclick", () => handleDeleteMsg(itemId))
    //only works for one button, the icon doesnt change, the number goes up infinite times
    const likeButton = msgElement.querySelector('.like-btn')
    likeButton.addEventListener('click', () => {
        handleLikeBtn(itemId, itemValue.likes)
    })

    endorsementsContainer.appendChild(msgElement)
}


function handleLikeBtn(id, likes){
    let exactLocationOfItemInDB = ref(database, `messages/${id}/likes`)
    let updatedLikes = likes + 1;
    set(exactLocationOfItemInDB, updatedLikes);
}

function handleDeleteMsg(id){
    let exactLocationOfItemInDB = ref(database, `messages/${id}`)
    remove(exactLocationOfItemInDB)
}

function isValidInputs() {
    const msg = endorsementMsg.value
    const addresser = addresserEl.value
    const receiver = receiverEl.value
    if (msg.trim() === '' || addresser.trim() === '' || receiver.trim() === '') {
        return false
    }
    return true
}

function clearInputfieldsEl(){
    endorsementMsg.value = ''
    addresserEl.value = ''
    receiverEl.value = ''
}


function clearMessagesList(){
    endorsementsContainer.innerHTML = ''
}
