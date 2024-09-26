// Variáveis Globais
let editMode = false;  // Verifica se o formulário está no modo de edição
let currentClientId = null;  // Guarda o ID do cliente sendo editado

// -------------------- Funções CRUD (Create, Read, Update, Delete) --------------------

// Puxa a lista de clientes para a tabela
const getList = async () => {
  const url = 'http://127.0.0.1:5000/clientes';
  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    const table = document.getElementById('clientTable');
    
    // Limpa a tabela antes de inserir novos dados
    table.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

    // Insere cada cliente na tabela
    data.clientes.forEach(client => insertList(client.id, client.nome, client.data_nasc, client.email, client.celular, client.instrumentos));

  } catch (error) {
    console.error('Error fetching client list:', error);
  }
};

// Adiciona um novo cliente através da requisição POST
const postItem = async (inputName, inputBirth, inputEmail, inputCellNo, inputInstrumentos) => {
  const formData = new FormData();
  formData.append('nome', inputName);
  formData.append('data_nasc', inputBirth);
  formData.append('email', inputEmail);
  formData.append('celular', inputCellNo);
  formData.append('instrumentos', inputInstrumentos);

  const url = 'http://127.0.0.1:5000/cliente';
  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();
    return data.id;  // Retorna o ID do novo cliente
  } catch (error) {
    console.error('Error adding new client:', error);
  }
};

// Atualiza um cliente através da requisição PUT
const updateClient = async (id, inputName, inputBirth, inputEmail, inputCellNo, inputInstrumentos) => {
  const formData = new FormData();
  formData.append('id', id);  // Inclui o ID
  formData.append('nome', inputName);
  formData.append('data_nasc', inputBirth);
  formData.append('email', inputEmail);
  formData.append('celular', inputCellNo);
  formData.append('instrumentos', inputInstrumentos);

  const url = `http://127.0.0.1:5000/cliente`;  // Não é necessário o ID na URL
  try {
    const response = await fetch(url, { method: 'PUT', body: formData });
    if (response.ok) {
      const data = await response.json();
      console.log('Cliente atualizado com sucesso:', data);
      alert(`Cliente atualizado com sucesso.`);
    } else {
      throw new Error('Erro ao atualizar o cliente');
    }
  } catch (error) {
    console.error('Erro ao atualizar o cliente:', error);
  }
};


// Deleta um cliente via ID
const deleteClient = async (id) => {
  const url = `http://127.0.0.1:5000/cliente?id=${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url, { method: 'DELETE' });
    const data = await response.json();
    if (data.message === "Cliente removido") {
      alert(`Cliente ${id} removido com sucesso.`);
    } else {
      alert(`Erro ao remover cliente: ${data.message}`);
    }
  } catch (error) {
    console.error('Error deleting client:', error);
  }
};

// -------------------- Controle do Formulário --------------------

// Lida com formulário ao adicionar ou editar um cliente
const newItem = () => {
  const inputName = document.getElementById("full-name").value;
  const inputBirth = document.getElementById("birth").value;
  const inputEmail = document.getElementById("email").value;
  const inputCellNo = document.getElementById("cell-no").value;
  const inputInstrumentos = document.getElementById("instrumentos").value;

  // Validação de campos
  if (!validateForm(inputName, inputCellNo)) return;

  // Se estamos em modo de edição
  if (editMode && currentClientId) {
    updateClient(currentClientId, inputName, inputBirth, inputEmail, inputCellNo, inputInstrumentos)
      .then(() => {
        alert("Cliente atualizado com sucesso.");
        getList();  // Atualiza a tabela
      })
      .catch(error => console.error('Erro ao atualizar o cliente:', error));
  } else {
    postItem(inputName, inputBirth, inputEmail, inputCellNo, inputInstrumentos)
      .then(id => {
        insertList(id, inputName, inputBirth, inputEmail, inputCellNo, inputInstrumentos);
        alert("Cliente cadastrado.");
      })
      .catch(error => console.error('Erro ao cadastrar o cliente:', error));
  }

  resetForm();  // Limpa o formulário
};


// Valida entradas do formulário
const validateForm = (name, cellNo) => {
  if (!name) {
    alert("Escreva o nome do cliente.");
    return false;
  }
  if (!cellNo) {
    alert("Por favor, insira um número de celular válido.");
    return false;
  }
  return true;
};

// Reseta o form. e retorna ao modo 'adicionar'
const resetForm = () => {
  document.getElementById("full-name").value = "";
  document.getElementById("birth").value = "";
  document.getElementById("email").value = "";
  document.getElementById("cell-no").value = "";
  document.getElementById("instrumentos").value = "";
  document.getElementById("add-btn").textContent = "ADICIONAR";

  editMode = false;
  currentClientId = null;
};

// -------------------- Gerenciador da Tabela (linhas e botões) --------------------

// Insere linha com dados e com botões na tabela
const insertList = (id, nome, data_nasc, email, celular, instrumentos) => {
  const table = document.getElementById('clientTable');
  const row = table.insertRow();
  const item = [nome, data_nasc, email, celular, instrumentos];

  item.forEach(text => {
    const cell = row.insertCell();
    cell.textContent = text;
  });

  const actionCell = row.insertCell();
  insertActionButtons(actionCell, id, nome, data_nasc, email, celular, instrumentos);
};

// Aplica as funções de inserir os botões de editar e deletar, passando parâmetros necessários
const insertActionButtons = (parent, id, nome, data_nasc, email, celular, instrumentos) => {
  insertEditButton(parent, id, nome, data_nasc, email, celular, instrumentos);
  insertDeleteButton(parent, id);
};

// Insere o botão de editar na linha da tabela
const insertEditButton = (parent, id, nome, data_nasc, email, celular, instrumentos) => {
  const editBtn = document.createElement("img");
  editBtn.src = "images/edit_icon.png";
  editBtn.className = "edit-btn";
  editBtn.alt = "Editar";
  editBtn.style.cursor = "pointer";

  parent.appendChild(editBtn);

  editBtn.onclick = () => {
    document.getElementById("full-name").value = nome;
    document.getElementById("birth").value = data_nasc;
    document.getElementById("email").value = email;
    document.getElementById("cell-no").value = celular;
    document.getElementById("instrumentos").value = instrumentos;

    currentClientId = id;  // Salva o ID do cliente atual
    editMode = true;  // Ativa o modo de edição
    document.getElementById("add-btn").textContent = "SALVAR ALTERAÇÕES";  // Muda o botão para 'Salvar'
  };
};


// Insere o botão de excluir na linha da tabela
const insertDeleteButton = (parent, id) => {
  const deleteBtn = document.createElement("span");
  deleteBtn.className = "close";
  deleteBtn.textContent = "\u00D7";  // Unicode para 'X'

  parent.appendChild(deleteBtn);

  deleteBtn.onclick = () => {
    if (confirm("Deseja remover o cadastro?")) {
      deleteClient(id);
      deleteBtn.parentElement.parentElement.remove();  // Remove a linha da tabela
    }
  };
};

// -------------------- Função de Busca --------------------

// Filtra clientes com base no nome
const searchClient = () => {
  const input = document.getElementById('search-input').value.toLowerCase();
  const table = document.getElementById('clientTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 1; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName('td')[0];
    if (nameCell) {
      const txtValue = nameCell.textContent || nameCell.innerText;
      rows[i].style.display = txtValue.toLowerCase().includes(input) ? "" : "none";
    }
  }
};

// Carrega lista de clientes
getList();
