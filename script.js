import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// 1. Suas chaves do Firebase
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
const clearBtn = document.getElementById('clearChatBtn'); // O botão de limpar

// 5. Lógica de Login e Segurança do Botão ADM
startBtn.onclick = () => {
    const nomeDigitado = nameInput.value.trim();
    if (nomeDigitado !== "") {
        meuNome = nomeDigitado;
        modal.style.display = 'none';

        // Só mostra o botão de limpar se o nome for MAIKE (em maiúsculo)
        if (meuNome.toUpperCase() === "MAIKE") {
            clearBtn.style.display = "block";
        } else {
            clearBtn.style.display = "none";
        }
    }
};

// 6. Função para gerar cores aleatórias para os outros
const gerarCor = () => {
    const cores = ['#34B7F1', '#FF5733', '#C70039', '#900C3F', '#FFC300', '#A29BFE'];
    return cores[Math.floor(Math.random() * cores.length)];
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

sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// 8. Lógica para LIMPAR TUDO (Apenas para você)
clearBtn.onclick = () => {
    if (confirm("ATENÇÃO: Deseja apagar TODO o histórico de mensagens?")) {
        remove(messagesRef)
            .then(() => {
                chatBox.innerHTML = ""; // Limpa a tela localmente
                alert("O banco de dados foi zerado!");
            })
            .catch((error) => alert("Erro ao apagar: " + error.message));
    }
};

// 9. Recebimento de Mensagens em Tempo Real
onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    const div = document.createElement('div');
    
    const dataMsg = new Date(msg.timestamp);
    const hora = dataMsg.getHours().toString().padStart(2, '0') + ':' + 
                 dataMsg.getMinutes().toString().padStart(2, '0');
    
    div.classList.add('message');

    if (msg.usuario === meuNome) {
        div.classList.add('sent');
        div.innerHTML = `
            <span>${msg.texto}</span>
            <small style="display:block; font-size:10px; opacity:0.5; text-align:right; margin-top:4px;">${hora}</small>
        `;
    } else {
        if (!coresUsuarios[msg.usuario]) {
            coresUsuarios[msg.usuario] = gerarCor();
        }

        div.classList.add('received');
        div.innerHTML = `
            <small style="display:block; color:${coresUsuarios[msg.usuario]}; font-weight:bold; margin-bottom:4px;">${msg.usuario}</small>
            <span>${msg.texto}</span>
            <small style="display:block; font-size:10px; opacity:0.5; text-align:right; margin-top:4px;">${hora}</small>
        `;

        // Toca o som se a aba estiver ativa
        notifySound.play().catch(() => {});
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});
