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

const modal = document.getElementById('loginModal'),
      startBtn = document.getElementById('startChat'),
      nameInput = document.getElementById('usernameInput'),
      messageInput = document.getElementById('messageInput'),
      sendBtn = document.getElementById('sendBtn'),
      chatBox = document.getElementById('chatBox'),
      sidebar = document.getElementById('sidebar'),
      menuToggle = document.getElementById('menuToggle'),
      closeMenu = document.getElementById('closeMenu'),
      themeToggle = document.getElementById('themeToggle'),
      newChatBtn = document.getElementById('newChatBtn'),
      displayMyName = document.getElementById('displayMyName'),
      onlineCountSpan = document.getElementById('onlineCount');

// LOGIN
startBtn.onclick = () => {
    const nome = nameInput.value.trim();
    if (nome !== "") {
        meuNome = nome;
        displayMyName.innerText = meuNome;
        modal.style.display = 'none';
        const myStatusRef = ref(db, 'online/' + meuNome);
        set(myStatusRef, true);
        onDisconnect(myStatusRef).remove();
    }
};

// ENVIAR MENSAGEM
function enviar() {
    const txt = messageInput.value.trim();
    if (txt !== "" && meuNome !== "") {
        push(messagesRef, { texto: txt, usuario: meuNome, timestamp: Date.now() });
        messageInput.value = "";
        messageInput.focus();
    }
}
sendBtn.onclick = enviar;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') enviar(); };

// MENU E TEMAS
closeMenu.onclick = () => sidebar.classList.toggle('expanded');
menuToggle.onclick = () => { sidebar.classList.add('active'); sidebar.classList.add('expanded'); };
chatBox.onclick = () => { sidebar.classList.remove('active'); if(window.innerWidth < 768) sidebar.classList.remove('expanded'); };
themeToggle.onclick = () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};
newChatBtn.onclick = () => {
    if (confirm("Apagar histórico para TODOS?")) remove(messagesRef);
};

// FIREBASE LISTENER
onValue(onlineRef, (s) => onlineCountSpan.innerText = s.size || 0);
const gerarCor = () => ['#8ab4f8', '#ff8bcb', '#c4c7c5', '#34B7F1', '#FFC300'][Math.floor(Math.random() * 5)];

onChildAdded(messagesRef, (d) => {
    const msg = d.val();
    const div = document.createElement('div');
    const hora = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    div.className = `message ${msg.usuario === meuNome ? 'sent' : 'received'}`;
    
    if (msg.usuario !== meuNome) {
        if (!coresUsuarios[msg.usuario]) coresUsuarios[msg.usuario] = gerarCor();
        div.innerHTML = `<small style="color:${coresUsuarios[msg.usuario]};font-weight:bold">${msg.usuario}</small><br>`;
    }
    div.innerHTML += `<span>${msg.texto}</span><small style="display:block;font-size:10px;opacity:0.4;text-align:right">${hora}</small>`;
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (msg.usuario !== meuNome) notifySound.play().catch(()=>{});
});

if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
