function sendMessage() {
    const inputBox = document.getElementById("userInput");
    const chat = document.getElementById("chat");
    const userText = inputBox.value.toLowerCase();

    if (!userText) return; // Ignorera tom input

    chat.innerHTML += "<b>Du:</b> " + inputBox.value + "<br>";
    
    let response = "Förlåt, jag förstår inte riktigt.";

    // Kolla om något nyckelord matchar
    for (let key in aiResponses) {
        if (userText.includes(key)) {
            response = aiResponses[key];
            break;
        }
    }

    chat.innerHTML += "<b>AI:</b> " + response + "<br>";
    inputBox.value = "";
    chat.scrollTop = chat.scrollHeight; // scrolla ner
}
