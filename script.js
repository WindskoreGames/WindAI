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

    // Korrigerad Levenshtein-avstånd funktion
    function levenshteinDistance(a, b) {
        const m = a.length;
        const n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;

        let row = [];
        for (let i = 0; i <= n; i++) {
            row[i] = i;
        }

        for (let j = 1; j <= m; j++) {
            let prev = row[0];
            row[0] = j;
            for (let i = 1; i <= n; i++) {
                const curr = row[i];
                const cost = (a[j - 1] === b[i - 1]) ? 0 : 1;
                row[i] = Math.min(
                    row[i - 1] + 1, // insert
                    curr + 1,       // delete
                    prev + cost     // substitute
                );
                prev = curr;
            }
        }
        return row[n];
    }

    // Funktion för att hitta bästa matchning
    function findBestResponse(query) {
        query = query.toLowerCase().trim();
        let bestMatch = null;
        let highestScore = 0;

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
