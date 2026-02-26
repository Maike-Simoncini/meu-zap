import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// 1. Configurações do seu Firebase (Mantenha as suas chaves aqui)
const firebaseConfig = {
  apiKey: "AIzaSyCQvYAPoDseWSDV50RHXoImk2zzx822amU",
  authDomain: "meuzap-be2dd.firebaseapp.com",
  databaseURL: "https://meuzap-be2dd-default-rtdb.firebaseio.com",
  projectId: "meuzap-be2dd",
  storageBucket: "meuzap-be2dd.firebasestorage.app",
  messagingSenderId: "4751380990",
  appId: "1:4751380990:web:34b4219fb8b19407ecb0af"
};

// 2. Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'mensagens');

// 3. Variáveis de Controle
let meuNome = "";
const coresUsuarios = {}; // Armazena a cor de cada pessoa
const notifySound = new Audio('snap.mp3'); // Certifique-se de subir o snap.mp3 no GitHub

// 4. Referências dos Elementos do HTML
const modal = document.getElementById('loginModal');
const startBtn = document.getElementById('startChat');
const nameInput = document.getElementById('usernameInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

// 5. Função para gerar cor aleatória (para o nome dos amigos)
const gerarCor = () => {
    const cores = ['#25D366', '#34B7F1', '#FF5733', '#C70039', '#900C3F', '#581845', '#FFC300'];
    return cores[Math.floor(Math.random() * cores.length)];
};

// 6. Lógica de Login (Modal)
startBtn.onclick = () => {
    if (nameInput.value.trim() !== "") {
        meuNome = nameInput.value;
        modal.style.display = 'none';
    }
};

// 7. Função de Enviar Mensagem
function sendMessage() {
    const text = messageInput.value.trim();
    if (text !== "" && meuNome !== "") {
        push(messagesRef, {
            texto: text,
            usuario: meuNome,
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}

// Eventos de clique e tecla Enter
sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// 8. Ouvir Novas Mensagens (Tempo Real)
onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    const div = document.createElement('div');
    
    // Formatação da Hora
    const dataMsg = new Date(msg.timestamp);
    const hora = dataMsg.getHours().toString().padStart(2, '0') + ':' + 
                 dataMsg.getMinutes().toString().padStart(2, '0');
    
    div.classList.add('message');

    // Se a mensagem for minha
    if (msg.usuario === meuNome) {
        div.classList.add('sent');
        div.innerHTML = `
            <span>${msg.texto}</span>
            <small style="display:block; font-size:10px; opacity:0.5; text-align:right; margin-top:4px;">${hora}</small>
        `;
    } 
    // Se a mensagem for de outra pessoa
    else {
        // Atribui uma cor fixa para esse usuário durante a sessão
        if (!coresUsuarios[msg.usuario]) {
            coresUsuarios[msg.usuario] = gerarCor();
        }

        div.classList.add('received');
        div.innerHTML = `
            <small style="display:block; color:${coresUsuarios[msg.usuario]}; font-weight:bold; margin-bottom:4px;">${msg.usuario}</small>
            <span>${msg.texto}</span>
            <small style="display:block; font-size:10px; opacity:0.5; text-align:right; margin-top:4px;">${hora}</small>
        `;

        // Tocar som de notificação
        notifySound.play().catch(() => {
            // O som pode ser bloqueado pelo navegador se o usuário não interagiu com a página ainda.
        });
    }
    
    chatBox.appendChild(div);
    
    // Scroll automático para a última mensagem
    chatBox.scrollTop = chatBox.scrollHeight;
});
