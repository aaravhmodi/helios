const recordBtn = document.getElementById('recordBtn');
const chat = document.getElementById('chat');
const status = document.getElementById('status');

let recognition;
let isRecording = false;

// Initialize speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        recordBtn.textContent = 'Listening...';
        recordBtn.classList.add('recording');
        status.textContent = 'Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addMessage('user', transcript);
        handleUserInput(transcript);
    };

    recognition.onerror = (event) => {
        status.textContent = `Error: ${event.error}`;
        stopRecording();
    };

    recognition.onend = () => {
        stopRecording();
    };
} else {
    recordBtn.disabled = true;
    status.textContent = 'Speech recognition not supported in this browser';
}

function stopRecording() {
    isRecording = false;
    recordBtn.textContent = 'Start';
    recordBtn.classList.remove('recording');
    status.textContent = '';
}

function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? 'You' : 'Jarvis';
    
    const content = document.createElement('div');
    content.textContent = text;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

function handleUserInput(text) {
    // Simple response logic (replace with actual AI API call)
    let response = generateResponse(text);
    
    // Simulate processing delay
    setTimeout(() => {
        addMessage('assistant', response);
        speak(response);
    }, 500);
}

function generateResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return 'Hello. How can I assist you?';
    } else if (lowerInput.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lowerInput.includes('weather')) {
        return 'I cannot access weather data in this MVP version.';
    } else if (lowerInput.includes('thank')) {
        return 'You\'re welcome.';
    } else {
        return `I heard: "${input}". This is a minimal MVP - full AI integration coming soon.`;
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }
}

recordBtn.addEventListener('click', () => {
    if (!isRecording && recognition) {
        recognition.start();
    } else if (isRecording) {
        recognition.stop();
        stopRecording();
    }
});