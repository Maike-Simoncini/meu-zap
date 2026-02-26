import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// 1. Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCQvYAPoDseWSDV50RHXoImk2zzx822amU",
  authDomain: "meuzap-be2dd.firebaseapp.com",
  databaseURL: "https://meuzap-be2dd-default-rtdb.firebaseio.com",
  projectId: "meuzap-be2dd",
  storageBucket: "meuzap-be2dd.firebasestorage.app",
  messagingSenderId: "4751380990",
  appId: "1:4751380990:web:34b4219fb8b19407ecb0af"
};

// 2. Inicialização
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'mensagens');
const onlineRef = ref(db, 'online');

// 3. Variáveis Globais
let meuNome = "";
const coresUsuarios = {};
const notifySound = new Audio('snap.mp3');

// 4. Referências do HTML
const modal = document.getElementById('loginModal');
const startBtn = document.getElementById('startChat');
const nameInput = document.getElementById('usernameInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const clearBtn = document.getElementById('clearChatBtn');
const displayMyName = document.getElementById('displayMyName');
const onlineCountSpan = document.getElementById('onlineCount');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// --- 5. LÓGICA DO MENU LATERAL (ABRIR/FECHAR) ---
menuToggle.onclick = (e) => {
    e.stopPropagation(); // Impede o clique de fechar o menu na mesma hora
    sidebar.classList.toggle('active'); // Abre ou fecha a gaveta
};

// Fecha o menu se o usuário clicar na área de mensagens (melhor p/ celular)
chatBox.onclick = () => {
    sidebar.classList.remove('active');
};

// --- 6. LÓGICA DE LOGIN E PRESENÇA ---
startBtn.onclick = () => {
    const nomeDigitado = nameInput.value.trim();
    if (nomeDigitado !== "") {
        meuNome = nomeDigitado;
        
        // Atualiza o nome na barra lateral imediatamente
        if(displayMyName) displayMyName.innerText = meuNome; 
        
        modal.style.display = 'none'; // Esconde o login

        // Se for o Admin, mostra o botão de limpar
        if (meuNome.toUpperCase() === "MAIKE") {
            clearBtn.style.display = "block";
        }

        // Registra presença no Firebase
        const myStatusRef = ref(db, 'online/' + meuNome);
        set(myStatusRef, true);
        onDisconnect(myStatusRef).remove(); // Remove da lista se desconectar
    }
};

// --- 7. ATUALIZAR CONTADOR ONLINE EM TEMPO REAL ---
onValue(onlineRef, (snapshot) => {
    const totalOnline = snapshot.size || 0;
    if(onlineCountSpan) onlineCountSpan.innerText = totalOnline;
});

// --- 8. FUNÇÕES DE MENSAGEM ---
function sendMessage() {
    const text = messageInput.value.trim();
    if (text !== "" && meuNome !== "") {
        push(messagesRef, {
            texto: text,
            usuario: meuNome,
            timestamp: Date.now()
        });
        messageInput.value = ""; // Limpa campo
    }
}

sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// --- 9. LIMPAR HISTÓRICO (ADM) ---
clearBtn.onclick = () => {
    if (confirm("Deseja apagar TODO o histórico?")) {
        remove(messagesRef);
        chatBox.innerHTML = "";
        sidebar.classList.remove('active'); // Fecha o menu após limpar
    }
};

// --- 10. RECEBER MENSAGENS E GERAR BALÕES ---
const gerarCor = () => ['#34B7F1', '#FF5733', '#C70039', '#25D366', '#FFC300'][Math.floor(Math.random() * 5)];

onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    const div = document.createElement('div');
    const hora = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    div.classList.add('message');

    if (msg.usuario === meuNome) {
        div.classList.add('sent'); // Sua mensagem
        div.innerHTML = `<span>${msg.texto}</span>
                         <small style="display:block; font-size:10px; opacity:0.5; text-align:right;">${hora}</small>`;
    } else {
        if (!coresUsuarios[msg.usuario]) coresUsuarios[msg.usuario] = gerarCor();
        div.classList.add('received'); // Mensagem de outros
        div.innerHTML = `<small style="color:${coresUsuarios[msg.usuario]}; font-weight:bold;">${msg.usuario}</small><br>
                         <span>${msg.texto}</span>
                         <small style="display:block; font-size:10px; opacity:0.5; text-align:right;">${hora}</small>`;
        
        // Toca o som se não for você enviando
        notifySound.play().catch(() => {});
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight; // Sempre rola para baixo
});
