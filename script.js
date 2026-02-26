import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Ajuste para mobile não esconder o campo de texto
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// Toda vez que enviar mensagem, rolar para o fim
function scrollDown() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

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

// Elementos
const modal = document.getElementById('loginModal');
const startBtn = document.getElementById('startChat');
const nameInput = document.getElementById('usernameInput');
const displayMyName = document.getElementById('displayMyName');
const onlineCountSpan = document.getElementById('onlineCount');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const clearBtn = document.getElementById('clearChatBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

// --- LÓGICA DO MENU MOBILE ---
menuToggle.onclick = () => {
    sidebar.classList.toggle('active');
};

// Fecha o menu ao clicar fora dele (nas mensagens)
chatBox.onclick = () => {
    sidebar.classList.remove('active');
};

// LOGIN E PRESENÇA
startBtn.onclick = () => {
    const nome = nameInput.value.trim();
    if (nome !== "") {
        meuNome = nome;
        if (displayMyName) displayMyName.innerText = meuNome;
        modal.style.display = 'none';

        if (meuNome.toUpperCase() === "MAIKE") {
            clearBtn.style.display = "block";
        }

        const myStatusRef = ref(db, 'online/' + meuNome);
        set(myStatusRef, true);
        onDisconnect(myStatusRef).remove();
    }
};

// CONTADOR ONLINE
onValue(onlineRef, (snapshot) => {
    if (onlineCountSpan) onlineCountSpan.innerText = snapshot.size || 0;
});

// ENVIAR MENSAGEM
function enviar() {
    const texto = messageInput.value.trim();
    if (texto !== "" && meuNome !== "") {
        push(messagesRef, { texto: texto, usuario: meuNome, timestamp: Date.now() });
        messageInput.value = "";
    }
}
sendBtn.onclick = enviar;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') enviar(); };

// LIMPAR TUDO
clearBtn.onclick = () => {
    if (confirm("Zerar chat?")) {
        remove(messagesRef);
        chatBox.innerHTML = "";
        sidebar.classList.remove('active'); // Fecha o menu no celular após limpar
    }
};

// RECEBER MENSAGENS
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

