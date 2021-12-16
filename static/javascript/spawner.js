// Todo: change wording of yours to them, and last to first (for message tails)

let createNewParentOnClick = false

let lastMessage
let lastAuthorName
let selectedFriend = document.querySelector(".friend.selected")
let selectedFriendName = selectedFriend.innerHTML.slice(0, selectedFriend.childNodes[3].innerHTML.indexOf("<span")).trim()

let friendsList = $(".friend")
let lastThread = "";

let threads = []
for (var i = 0;  i < friendsList.length; i ++) {
    var n = friendsList[i].childNodes[3].innerHTML.slice(0, friendsList[i].childNodes[3].innerHTML.indexOf("<span")).trim()
    var threadDiv = document.createElement("DIV")
    threadDiv.classList.add("thread")
    threadDiv.classList.add(n.replace(/ /g, '-'))
    
    threads.push({
        name: n,
        div: threadDiv,
        lastParent: null
    })
    
    document.querySelector("body > div.chat.main > div.messages").appendChild(threadDiv)
}

function findObjectByKey (array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            return array[i]
        }
    }
    return null
}

function getTime() {
    var d = new Date();
    var hr = d.getHours();
    var min = d.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var ampm = "AM";
    if (hr > 12) {
        hr -= 12;
        ampm = "PM";
    }
    return time = hr + ":" + min + " " + ampm
}

function spawnMessageParent(sender, lastParent, thread, messageAuthor) {

    // var messagesParents = $(".messages")
    // var lastParent = messagesParents[messagesParents.length - 1]
    // if (messageAuthor == undefined) {
    //     messageAuthor = ""
    // }
    // console.log("Spawn Message Parent in thread: " + thread + "\nlast thread: " + lastThread )

    var messageParent
    
    if (sender == "them") {
        sender = "yours"
    }
    
    pContains = function (p, className) {
        return p.classList.contains(className)
    }

    let threadsLastParent = findObjectByKey(threads, 'name', thread).lastParent

    console.log(lastParent)

    // messageParent.innerHTML = messageAuthor
    if (createNewParentOnClick) {
        messageParent = document.createElement("DIV")
        messageParent.classList.add(sender)
        messageParent.classList.add("messages")
        threadsLastParent = messageParent
        messageParent.innerHTML = messageAuthor + " " + getTime()
        createNewParentOnClick = false
        // console.log("Called 1")
    } else {
        // Use the last message parent if its owner is the same as the current sender
        if ((pContains(lastParent, sender) && thread == lastThread) || messageAuthor == lastAuthorName) {    
            // If the last globally stored message parent is from the local sender, and is in the same thread, then use it
            messageParent = lastParent
            threadsLastParent = messageParent
            // console.log("Called 2")
        } else if (threadsLastParent != null) {
            if (pContains(threadsLastParent, sender)) {
                // If this thread has a last parent stored locally, then use it instead
                messageParent = findObjectByKey(threads, 'name', thread).lastParent
                threadsLastParent = messageParent
                // console.log("Called 3")
            }
        } else {
            // If there is no last parent to use, create a new parent
            messageParent = document.createElement("DIV")
            messageParent.classList.add(sender)
            messageParent.classList.add("messages")
            messageParent.innerHTML = messageAuthor + " " + getTime()
            threadsLastParent = null
            // console.log("Called 4")
        }
    }

    if (messageParent == null) {
        // If for some reason those checks above failed, create a new message parent
        messageParent = document.createElement("DIV")
        messageParent.classList.add(sender)
        messageParent.classList.add("messages")
        findObjectByKey(threads, 'name', thread).lastParent = null
        messageParent.innerHTML = messageAuthor + " " + getTime()
        // console.log("Called 5")
    }   
    
    messageParent.style.color = "lightgray"

    return messageParent
}

$(".friend").click(f => {
    createNewParentOnClick = true
})

function spawnMessageChild(str, sender, lastParent, thread, messageAuthor) {
    var message = document.createElement("DIV")
    message.classList.add("message")
    message.classList.add(thread.replace(/ /g, '-'))

    if (sender == "them") {
        sender = "yours"
    }
    if (messageAuthor != lastAuthorName) {
        message.classList.add("last")
    }
    if (lastParent == undefined) {
        message.classList.add("last")
    } else {
        if (!lastParent.classList.contains(sender) || thread != lastThread) {
            if (findObjectByKey(threads, 'name', thread).lastParent != null) {
                if (!findObjectByKey(threads, 'name', thread).lastParent.classList.contains(sender)) {
                    // If this thread's most recent parent message is not from the same sender, add the class to give it a tail
                    message.classList.add("last")
                }
            }
        }
    }
    message.style.opacity = 0
    message.innerHTML = str
    return message
}

function fade(msg) {
    var increment = 0.025;
    var opacity = 0;
    var instance = window.setInterval(function() {
        msg.style.opacity = opacity
        opacity += increment;
        if (opacity > 1) {
            window.clearInterval(instance);
        }
    }, 10)
}


function truncate(str, n, useWordBoundary){
    // credit: https://stackoverflow.com/questions/1199352/smart-way-to-truncate-long-strings
    if (str.length <= n) { return str; }
    const subString = str.substr(0, n - 1)
    return (useWordBoundary 
      ? subString.substr(0, subString.lastIndexOf(" ")) 
      : subString) + "&hellip;"
};

function addMessage(msgParent, thread, messageAuthor) {

    if (thread == "") {
        console.log("[ERROR] Thread empty, could not send message.")
        return
    }

    thread = findObjectByKey(threads, 'name', thread)
    thread.div.appendChild(msgParent)

    let recipientThread;
    for (const h3 of document.querySelectorAll("h3")) {
        if (h3.textContent.includes(thread.name)) {
            recipientThread = h3.parentNode
        }
    }

    recipientThread.childNodes[5].innerHTML = truncate(msgParent.childNodes[msgParent.childNodes.length - 1].innerHTML, 40, true);
    recipientThread.childNodes[3].childNodes[1].innerHTML = " at " + getTime()

    fade(msgParent.childNodes[msgParent.childNodes.length - 1])

    if (typeof lastMessage != 'undefined') {
        lastMessage.classList.remove("lastMessage")
    }

    lastMessage = msgParent.childNodes[msgParent.childNodes.length - 1]
    lastMessage.classList.add("lastMessage")
    lastAuthorName = messageAuthor
    lastThread = thread
}

function scrollToBottom() {
    window.scrollTo({
        left: 0,
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}

function spawnMessage(msg, sender, thread, messageAuthor) {
    try {        
        let currentThread = document.getElementsByClassName(thread.replace(/ /g, '-'))[0]
        let currentParents = currentThread.childNodes
        console.log(messageAuthor)
        // console.log(currentThread)

        let lastParent = currentParents[currentParents.length - 1]
        let messageParent = spawnMessageParent(sender, lastParent, thread, messageAuthor)

        messageParent.appendChild(spawnMessageChild(msg, sender, lastParent, thread, messageAuthor))

        addMessage(messageParent, thread, messageAuthor)

        // let tmp = document.getElementsByClassName(thread.replace(/ /g, '-'))[0]
        // console.log("now after add:\n")
        // console.log(tmp)
        scrollToBottom()
    } catch (e) {
        console.log(e)
    }
}