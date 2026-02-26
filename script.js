import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQvYAPoDseWSDV50RHXoImk2zzx822amU",
  authDomain: "meuzap-be2dd.firebaseapp.com",
  databaseURL: "https://meuzap-be2dd-default-rtdb.firebaseio.com",
  projectId: "meuzap-be2dd",
  storageBucket: "meuzap-be2dd.firebasestorage.app",
  messagingSenderId: "4751380990",
  appId: "1:4751380990:web:34b4219fb8b19407ecb0af"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'mensagens');
const onlineRef = ref(db, 'online');

let meuNome = "";
const coresUsuarios = {};
const notifySound = new Audio('snap.mp3');

// Elementos do DOM
const modal = document.getElementById('loginModal');
const startBtn = document.getElementById('startChat');
const nameInput = document.getElementById('usernameInput');
const displayMyName = document.getElementById('displayMyName');
const onlineCountSpan = document.getElementById('onlineCount');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const clearBtn = document.getElementById('clearChatBtn');
const emojiBtn = document.getElementById('emojiBtn');

// --- 1. CONFIGURAÇÃO DO EMOJI PICKER ---
try {
    const picker = new EmojiButton({
        position: 'top-start',
        autoHide: false,
        rootElement: document.body
    });

    emojiBtn.addEventListener('click', () => {
        picker.togglePicker(emojiBtn);
    });

    picker.on('emoji', selection => {
        messageInput.value += selection;
        messageInput.focus();
    });
} catch (e) { console.error("Erro no Emoji Button:", e); }

// --- 2. LÓGICA DE LOGIN ---
startBtn.onclick = () => {
    const nome = nameInput.value.trim();
    if (nome !== "") {
        meuNome = nome;
        displayMyName.innerText = meuNome; // Atualiza o nome na barra lateral
        modal.style.display = 'none';

        if (meuNome.toUpperCase() === "MAIKE") {
            clearBtn.style.display = "block";
        }

        const myStatusRef = ref(db, 'online/' + meuNome);
        set(myStatusRef, true);
        onDisconnect(myStatusRef).remove();
    }
};

// --- 3. CONTADOR ONLINE ---
onValue(onlineRef, (snapshot) => {
    const total = snapshot.size || 0;
    onlineCountSpan.innerText = total;
});

// --- 4. ENVIAR MENSAGENS ---
function enviar() {
    const texto = messageInput.value.trim();
    if (texto !== "" && meuNome !== "") {
        push(messagesRef, {
            texto: texto,
            usuario: meuNome,
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}
sendBtn.onclick = enviar;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') enviar(); };

// --- 5. LIMPAR HISTÓRICO ---
clearBtn.onclick = () => {
    if (confirm("Apagar tudo?")) {
        remove(messagesRef);
        chatBox.innerHTML = "";
    }
};

// --- 6. RECEBER MENSAGENS ---
const gerarCor = () => ['#34B7F1', '#FF5733', '#25D366', '#FFC300', '#A29BFE'][Math.floor(Math.random() * 5)];

onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    const div = document.createElement('div');
    const hora = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    div.classList.add('message');
    if (msg.usuario === meuNome) {
        div.classList.add('sent');
        div.innerHTML = `<span>${msg.texto}</span><small style="display:block; font-size:10px; opacity:0.5; text-align:right;">${hora}</small>`;
    } else {
        if (!coresUsuarios[msg.usuario]) coresUsuarios[msg.usuario] = gerarCor();
        div.classList.add('received');
        div.innerHTML = `<small style="color:${coresUsuarios[msg.usuario]}; font-weight:bold;">${msg.usuario}</small><br><span>${msg.texto}</span><small style="display:block; font-size:10px; opacity:0.5; text-align:right;">${hora}</small>`;
        notifySound.play().catch(() => {});
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});
