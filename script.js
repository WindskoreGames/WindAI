// script.js
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    let knowledgeBase = [];

    // Ladda data från data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            knowledgeBase = data;
            addMessage('AI', 'Hej! Jag är en statisk AI byggd med HTML, JS och JSON. Fråga mig något smart!');
        })
        .catch(error => console.error('Fel vid laddning av data:', error));

    // Funktion för att lägga till meddelande i chatten
    function addMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender.toLowerCase());
        msgDiv.textContent = `${sender}: ${message}`;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Funktion för att hitta bästa matchning
    function findBestResponse(query) {
        query = query.toLowerCase().trim();
        let bestMatch = null;
        let highestScore = 0;

        // Beräkna likhet med Levenshtein-avstånd (enkel implementation)
        function levenshteinDistance(a, b) {
            const matrix = Array.from({ length: b.length + 1 }, (_, i) => i);
            for (let i = 1; i <= a.length; i++) {
                let prev = i;
                for (let j = 1; j <= b.length; j++) {
                    const temp = matrix[j];
                    matrix[j] = prev + (a[i-1] !== b[j-1]);
                    matrix[j] = Math.min(matrix[j], matrix[j-1] + 1, prev + 1);
                    prev = temp;
                }
            }
            return matrix[b.length];
        }

        knowledgeBase.forEach(item => {
            item.keywords.forEach(keyword => {
                const dist = levenshteinDistance(query, keyword.toLowerCase());
                const score = 1 - (dist / Math.max(query.length, keyword.length));
                if (score > highestScore && score > 0.7) { // Tröskel för matchning
                    highestScore = score;
                    bestMatch = item;
                }
            });
        });

        if (bestMatch) {
            // Om det finns follow-ups, hantera kontext (simpel statisk kontext)
            if (bestMatch.followUps && bestMatch.followUps.length > 0) {
                return bestMatch.response + ' ' + bestMatch.followUps[Math.floor(Math.random() * bestMatch.followUps.length)];
            }
            return bestMatch.response;
        }

        // Fallback om ingen match
        const fallbacks = [
            'Hmm, det var en svår fråga. Kan du omformulera?',
            'Jag är statisk, så min kunskap är begränsad till min JSON. Försök med något annat!',
            'Intressant! Men jag behöver mer data för att svara på det.'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Hantera skickning
    sendBtn.addEventListener('click', () => {
        const query = userInput.value;
        if (query) {
            addMessage('Användare', query);
            const response = findBestResponse(query);
            addMessage('AI', response);
            userInput.value = '';
        }
    });

    // Enter-knapp stöd
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
});