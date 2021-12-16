let dev = true;

let currentThread = []
let clickableThreads = []
let currentThreadId = 0

for (var i = 0; i < friendsList.length; i ++) {
    clickableThreads.push(false)
}

function setThread (t) {
    var tmp = currentThreadId
    for (var i = 0; i < currentThread.length; i++) {
        currentThread[i] = false;
    }
    currentThread[t] = true;
    currentThreadId = t
    return tmp
}

function threadClickable (t) {
    if (clickableThreads[t] == null || clickableThreads[t] == false) {
        return false
    }
    return true
}

function makeNextThreadClickable (t) {
    clickableThreads[t + 1] = true
}

function showCurrentThread (threadName) {
    t = $(".thread")
    for (var i = 0; i < t.length; i ++) {
        if (t[i].classList.contains(threadName)) {
            t[i].classList.remove("hide")
        } else {
            t[i].classList.add("hide")
        }
    }
}


$(".friend").click(function(e) {
    var name = e.currentTarget.childNodes[3].innerHTML
    name = name.slice(0, name.indexOf("<span")).trim()
    
    selectedFriend = document.querySelector(".friend.selected")
    
    if (e.currentTarget.classList.contains("disabled")) {
        console.log("Denied access to thread " + e)
        return
    }
    
    if ($("#contactsMenu").hasClass("show")) {
        $("#contactsMenu").toggleClass("show")    
    }
    
    document.querySelector("body > div.topBar > h2").innerHTML = name
    
    selectedFriend.classList.remove("selected")
    e.currentTarget.classList.add("selected")
    selectedFriend = e.currentTarget
    
    selectedFriendName = name
    
    showCurrentThread(name.replace(/ /g, '-'))
    window.scrollTo({
        left: 0,
        top: document.body.scrollHeight
    });
    
    document.querySelector("#box").focus()
    
})

let chats = $("#contactsMenu > div")
for (var i = 0; i < chats.left; i ++) {
    // This initializes all of the chats so that they can listen for messages.
    chats[i].click()
}
$("#contactsMenu > div:nth-child(2)").click()

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]))
}

var socket = io.connect('http://' + document.domain + ':' + location.port);
var senderName = prompt("Name");
let messageData;

$("#messageForm").submit(function(e) {
    var message = document.getElementById("box").value;

    if (message != "") {
        var lorem = `"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident`

        if (message == "/help") {
            spawnMessage("/help", "mine", selectedFriendName)
            spawnMessage(`
            <h3>Command list:</h3>
            <table class="tg">
                <tbody>
                    <tr>
                        <td class="tg-0lax">/lorem them</td>
                        <td class="tg-0lax">sends lorem text from "them"</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax">/lorem me</td>
                        <td class="tg-0lax">sends lorem text from "you"</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax">/yt</td>
                        <td class="tg-0lax">sends embedded youtube video</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax">//message</td>
                        <td class="tg-0lax">sends your "message" from "them"</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax">/dev</td>
                        <td class="tg-0lax">Toggles timer for automatic messages</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax">/restart</td>
                        <td class="tg-0lax">Restarts the presentation</td>
                    </tr>
                </tbody>
            </table><br>
            `, "them", selectedFriendName)
        } else {
            spawnMessage(sanitize(message), "mine", selectedFriendName, senderName)
        }
    }

    messageData = {
        message_recipient: selectedFriendName,
        message_author: senderName,
        message_content: sanitize(message) // Also sanitized on the other end
    }
    socket.emit('client_message', messageData)

    $("#messageForm")[0].reset()
    e.preventDefault()
})

document.querySelector("#box").focus()

socket.on('connect', function() {
    console.log('connected');
});

socket.on('message', function(data) {
    console.log(data);
    if (data.connected) {
        return;
    }
    if (data.message_author != senderName && data.message_content != "") {
        let content = sanitize(data.message_content)
        spawnMessage(content, "them", data.message_recipient, data.message_author)
    }
});