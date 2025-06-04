// Desenvolvido por Lks Modder

let tempoRestanteGlobal = 0;
let tempoInterval;
let tituloInterval;
let filaDeTitulos = [];
let tempoPorAtividade = {};
let atived = false;

function solicitarTempoUsuario(tasks) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10000',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out'
    });
    setTimeout(() => (overlay.style.opacity = 1), 10);

    const caixa = document.createElement('div');
    Object.assign(caixa.style, {
      background: 'rgba(15, 15, 20, 0.95)',
      color: '#f0f0f0',
      padding: '40px 40px',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
      textAlign: 'center',
      width: '90%',
      maxWidth: '500px',
      transform: 'scale(0.8)',
      transition: 'transform 0.4s ease',
      position: 'relative'
    });
    setTimeout(() => (caixa.style.transform = 'scale(1)'), 100);

    const botaoFechar = document.createElement('button');
    botaoFechar.textContent = '✖';
    Object.assign(botaoFechar.style, {
      position: 'absolute',
      right: '15px',
      top: '15px',
      background: 'transparent',
      border: 'none',
      color: '#ccc',
      fontSize: '22px',
      cursor: 'pointer',
      padding: '4px'
    });
    botaoFechar.onmouseover = () => (botaoFechar.style.color = 'white');
    botaoFechar.onmouseout = () => (botaoFechar.style.color = '#ccc');
    botaoFechar.onclick = () => {
      document.body.removeChild(overlay);
      if (correct) correct = false;
    };

    const titulo = document.createElement('h2');
    titulo.textContent = correct ? '🛠️ Corrigir Atividades' : '📋 Atividades';
    Object.assign(titulo.style, {
      marginBottom: '18px',
      fontSize: '24px',
      color: '#00fff7'
    });

    caixa.appendChild(titulo);

    const atividadesContainer = document.createElement('div');
    Object.assign(atividadesContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingLeft: '10px',
      gap: '10px',
      marginBottom: '24px',
      maxHeight: '220px',
      overflowY: 'auto'
    });

    const checkboxElements = [];

    tasks.forEach((task, idx) => {
      const label = document.createElement('label');
      Object.assign(label.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '15.5px',
        cursor: 'pointer',
        padding: '6px 10px',
        borderRadius: '8px',
        transition: 'background 0.2s',
        width: '100%'
      });

      label.onmouseenter = () => label.style.background = 'rgba(255,255,255,0.05)';
      label.onmouseleave = () => label.style.background = 'transparent';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.transform = 'scale(1.2)';
      checkbox.style.cursor = 'pointer';

      const span = document.createElement('span');
      const title = task.title || task.nome || `Tarefa ${idx + 1}`;
      const tipo = correct
        ? (task.tipo ? ` - ${task.tipo} - NOTA: ${task.nota}` : '')
        : (task.tipo ? ` - ${task.tipo}` : '');
      const emoji = '🔹';
      span.textContent = `${emoji} ${title}${tipo}`;

      label.appendChild(checkbox);
      label.appendChild(span);
      atividadesContainer.appendChild(label);

      checkboxElements.push({ checkbox, task });
    });

    caixa.appendChild(atividadesContainer);

    if (!correct) {
      const tituloTempo = document.createElement('p');
      tituloTempo.textContent = '⏱️ Tempo por atividade (minutos)';
      Object.assign(tituloTempo.style, {
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '12px',
        color: '#dddddd'
      });
      caixa.appendChild(tituloTempo);
    }

    const inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    });
    caixa.appendChild(inputContainer);

    const decrementButton = document.createElement('button');
    decrementButton.textContent = '-';
    const incrementButton = document.createElement('button');
    incrementButton.textContent = '+';

    [incrementButton, decrementButton].forEach(btn => {
      Object.assign(btn.style, {
        padding: '8px 12px',
        fontSize: '18px',
        background: '#00c853',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      });
      btn.onmouseover = () => btn.style.background = '#00e676';
      btn.onmouseout = () => btn.style.background = '#00c853';
    });

    const inputTempo = document.createElement('input');
    inputTempo.value = 1;
    inputTempo.min = 1;
    inputTempo.max = 6;
    Object.assign(inputTempo.style, {
      width: '80px',
      padding: '8px',
      fontSize: '16px',
      textAlign: 'center',
      border: '1px solid #555',
      borderRadius: '10px',
      background: '#333',
      color: '#fff'
    });

    incrementButton.onclick = () => {
      if (parseInt(inputTempo.value) < 6) {
        inputTempo.value = parseInt(inputTempo.value) + 1;
      }
    };
    decrementButton.onclick = () => {
      if (parseInt(inputTempo.value) > 1) {
        inputTempo.value = parseInt(inputTempo.value) - 1;
      }
    };

    if (!correct) {
      inputContainer.appendChild(decrementButton);
      inputContainer.appendChild(inputTempo);
      inputContainer.appendChild(incrementButton);
    } else {
      const msg = document.createElement('p');
      Object.assign(msg.style, {
        marginBottom: '18px',
        fontSize: '12px',
        color: '#f2f2f2'
      });
      msg.textContent = 'Selecione as atividades que você já finalizou e quer corrigir.';
      caixa.appendChild(msg);
    }

    const erro = document.createElement('p');
    Object.assign(erro.style, {
      color: 'tomato',
      fontSize: '14px',
      margin: '6px 0',
      display: 'none'
    });
    caixa.appendChild(erro);

    const botao = document.createElement('button');
    botao.textContent = '✅ Confirmar';
    Object.assign(botao.style, {
      marginTop: '15px',
      padding: '12px 28px',
      background: '#00c853',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    });
    botao.onmouseover = () => botao.style.background = '#00e676';
    botao.onmouseout = () => botao.style.background = '#00c853';

    botao.onclick = () => {
      const valor = parseInt(inputTempo.value);
      if (!correct && (isNaN(valor) || valor < 1 || valor > 6)) {
        erro.textContent = 'Digite um número válido de 1 a 6.';
        erro.style.display = 'block';
        return;
      }

      const tarefasSelecionadas = checkboxElements
        .filter(({ checkbox }) => checkbox.checked)
        .map(({ task }) => task);

      if (tarefasSelecionadas.length === 0) {
        erro.textContent = 'Selecione pelo menos uma tarefa.';
        erro.style.display = 'block';
        return;
      }

      document.body.removeChild(overlay);
      resolve({
        tempo: valor,
        tarefasSelecionadas
      });
    };

    caixa.appendChild(botao);
    caixa.appendChild(botaoFechar);
    overlay.appendChild(caixa);
    document.body.appendChild(overlay);
  });
}
