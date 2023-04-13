import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

//database setting
const appSettings = {
    databaseURL: "https://encouragemate-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const messagesListInDB = ref(database, "messages")

//dom manipulation
const getEl = id => document.querySelector(id)
const endorsementMsg = getEl('#cta-msg')
const addresserEl = getEl('#addresser')
const receiverEl = getEl('#receiver')
const publishBtn = getEl('#cta-btn')
const endorsementsContainer = getEl('.endorsements-container')
const endorsementsTitle = getEl('.endorsements h2')



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
        isLiked: false,
        imgSrc: '/assets/icon-heart.png',
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
                <img src=${itemValue.imgSrc} alt="Heart Icon" class="like-btn">
                <p>${itemValue.likes}</p>
            </div>
        </div>
    </div>
    `
    
    const msgElement = document.createElement('div')
    msgElement.innerHTML = newMsg
    msgElement.addEventListener("dblclick", () => handleDeleteMsg(itemId))

    //the icon doesnt change, the number goes up infinite times
    const likeButton = msgElement.querySelector('.like-btn')
    likeButton.addEventListener('click', () => {
        handleLikeBtn(itemId, itemValue.likes)
    })

    endorsementsContainer.appendChild(msgElement)
}


function handleLikeBtn(id, likes){
    const isLikedRef = ref(database, `messages/${id}/isLiked`)
    const exactLocationOfLikesInDB = ref(database, `messages/${id}/likes`)
    const imgSrcRef = ref(database, `messages/${id}/imgSrc`)
    get(isLikedRef).then((snapshot) => {
        const isLiked = snapshot.val()
        if (isLiked){
            const updatedLikes = likes - 1
            set(isLikedRef, false)
            set(imgSrcRef, '/assets/icon-heart.png')
            set(exactLocationOfLikesInDB, updatedLikes)
        }
        else if (!isLiked){
            const updatedLikes = likes + 1
            set(isLikedRef, true)            
            set(imgSrcRef, '/assets/filled-heart.png')
            set(exactLocationOfLikesInDB, updatedLikes)
        }
    })
}

function handleDeleteMsg(id){
    const exactLocationOfItemInDB = ref(database, `messages/${id}`)
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
