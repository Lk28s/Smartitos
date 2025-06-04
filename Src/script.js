// Desenvolvido por Lks Modder

let MostrarSenha = document.getElementById("VerSenha");
let Senha = document.getElementById("senha");
let imagem = document.getElementById("OlhoVer");
let trava = false;
let correct = false;

function adicionarSemDuplicar(array, items) {
  const idsExistentes = new Set(array.map(t => t.id));
  for (const item of items) {
    if (!idsExistentes.has(item.id)) {
      array.push(item);
      idsExistentes.add(item.id);
    }
  }
}

MostrarSenha.addEventListener("click", () => {
  if (Senha.type === "password") {
    Senha.type = "text";
    imagem.src = "visivel.png";
  } else {
    Senha.type = "password";
    imagem.src = "olho.png";
  }
});

document.getElementById('Enviar').addEventListener('submit', (e) => {
  e.preventDefault();

  const botaoClicado = e.submitter;
  if (botaoClicado.id === 'Corrigir') {
    correct = true;
  } else if (botaoClicado.id === 'Logar') {
    correct = false;
  }

  const options = {
    TEMPO: 3,
    ENABLE_SUBMISSION: true,
  };

  function sendRequest() {
    const url = 'https://api.smartitos.cloud/?type=token';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: document.getElementById('ra').value,
        password: document.getElementById('senha').value,
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`❌ Erro: ${response.status}`);
        return response.json();
      })
      .then(data => {
        Atividade('SALA-DO-FUTURO', 'Logado com sucesso!');
        if (correct) {
          fetchTeste(data.auth_token);
        } else {
          fetchUserRooms(data.auth_token);
        }
      })
      .catch(() => Atividade('SALA-DO-FUTURO', 'RA/SENHA Incorreto!'));
  }

  async function fetchTeste(token) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch('https://api.smartitos.cloud/?type=teste', {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error(`❌ Erro HTTP: ${response.status}`);
      const data = await response.json();
      config = await solicitarTempoUsuario(data);
      options.TEMPO = config.tempo;

      for (let a = 0; a < config.tarefasSelecionadas.length; a++) {
        const tarefa = config.tarefasSelecionadas[a];
        const dadosFiltrados = {
          accessed_on: tarefa.accessed_on,
          executed_on: tarefa.executed_on,
          answers: tarefa.answers,
          result_score: 40
        };

        Atividade('TAREFA-SP', `Corrigindo atividade: ${tarefa.title}`);
        setTimeout(() => {
          corrigirAtividade(dadosFiltrados, tarefa.task_id, tarefa.answer_id, token, tarefa.title);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  }

  async function fetchUserRooms(token) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch('https://api.smartitos.cloud/?type=room', {
        method: 'POST',
        headers,
        body: JSON.stringify({ apiKey: token }),
      });

      if (!response.ok) throw new Error(`❌ Erro HTTP: ${response.status}`);
      const data = await response.json();

      if (data.rooms && data.rooms.length > 0) {
        Atividade('TAREFA-SP', 'Procurando atividades...');
        const fetchPromises = data.rooms.map(room =>
          fetchTasks(token, room.name, room.topic, room.group_categories)
        );
        await Promise.all(fetchPromises);
      } else {
        console.warn('⚠️ Nenhuma sala encontrada.');
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  }

  async function fetchTasks(token, room, name, groups) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch('https://api.smartitos.cloud/?type=tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({ token, room, groups }),
      });

      if (!response.ok) throw new Error(`❌ Erro HTTP: ${response.status}`);
      const data = await response.json();

      const allTasks = data.results.flatMap(result => {
        return (result.data || []).map(task => ({ ...task, tipo: result.label }));
      });

      loadTasks(allTasks, token, room, 'TODOS');
    } catch (error) {
      console.error('❌ Erro ao buscar tarefas:', error);
    }
  }

  async function loadTasks(data, token, room, tipo) {
    if (!Array.isArray(data) || data.length === 0) {
      Atividade('TAREFA-SP', '🚫 Nenhuma atividade disponível');
      return;
    }

    let config = await solicitarTempoUsuario(data);
    options.TEMPO = config.tempo;

    for (let a = 0; a < config.tarefasSelecionadas.length; a++) {
      await processTask(config.tarefasSelecionadas[a], a);
    }

    async function processTask(task, index) {
      const taskId = task.id;
      const taskTitle = task.title;
      const type = task.tipo;
      const isRascunho = (type === 'Rascunho' || type === 'RascunhoE');
      const answerId = (isRascunho && task.answer_id != null) ? task.answer_id : undefined;

      const url = isRascunho
        ? `https://api.smartitos.cloud/?type=previewTaskR`
        : `https://api.smartitos.cloud/?type=previewTask`;

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = isRascunho && answerId != null
        ? JSON.stringify({ token, taskId, answerId })
        : JSON.stringify({ token, taskId });

      try {
        const response = await fetch(url, { method: 'POST', headers, body });
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
        const details = await response.json();

        const answersData = {};
        details.questions.forEach(question => {
          if (!question || question.type === 'info') return;

          const questionId = question.id;
          let answer = {};

          if (question.options && typeof question.options === 'object') {
            const options = Object.values(question.options);
            const correctIndex = Math.floor(Math.random() * options.length);
            options.forEach((_, i) => {
              answer[i] = i === correctIndex;
            });
          }

          answersData[questionId] = {
            question_id: questionId,
            question_type: question.type,
            answer,
          };
        });

        Atividade('TAREFA-SP', `Fazendo atividade: ${taskTitle}`);
        if (options?.ENABLE_SUBMISSION) {
          try {
            iniciarModalGlobal(data.length);
            submitAnswers(taskId, answersData, token, room, taskTitle, index + 1, data.length, type, answerId);
          } catch (submitErr) {
            console.error(`❌ Erro ao enviar respostas para ${taskId}:`, submitErr);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar task:', error);
      }
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function submitAnswers(taskId, answersData, token, room, taskTitle, index, total, tipo, answerId) {
    const body = {
      taskId,
      token,
      status: 'submitted',
      accessed_on: 'room',
      executed_on: room,
      answers: answersData,
      ...(tipo === 'Rascunho' || tipo === 'RascunhoE' ? { answerId } : {})
    };

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    atualizarModalGlobal(taskTitle, options.TEMPO * 60, index, total);
    await delay(options.TEMPO * 60 * 1000);

    try {
      const url = (tipo === 'Rascunho' || tipo === 'RascunhoE')
        ? `https://api.smartitos.cloud/?type=submitR`
        : `https://api.smartitos.cloud/?type=submit`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const response_json = await response.json();
      const new_task_id = response_json.id;

      fetchCorrectAnswers(taskId, new_task_id, token, taskTitle);
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
    }
  }

  async function fetchCorrectAnswers(taskId, answerId, token, taskTitle) {
    const url = `https://api.smartitos.cloud/?type=fetchSubmit`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token, taskId, answerId }),
      });

      if (!response.ok) throw new Error(`❌ Erro HTTP: ${response.status}`);
      const data = await response.json();

      putAnswer(data, taskId, answerId, token, taskTitle);
    } catch (error) {
      console.error('❌ Erro ao buscar respostas:', error);
    }
  }

  function corrigirAtividade(body, taskId, answerId, token, taskTitle) {
    const url = `https://api.smartitos.cloud/?type=putSubmit`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const payload = {
      taskId,
      answerId,
      token,
      ...body
    };

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(() => {
        Atividade('TAREFA-SP', `✅ Atividade Corrigida - ${taskTitle}`);
      })
      .catch(error => {
        console.error('❌ Erro ao corrigir:', error);
        Atividade('TAREFA-SP', `❌ Erro ao corrigir - ${taskTitle}`);
      });
  }

  sendRequest();
});
