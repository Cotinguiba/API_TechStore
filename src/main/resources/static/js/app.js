const API_URL = '/api';

let currentEntity = 'produtos';
let editingId = null;
let cache = { categorias: [], fornecedores: [], produtos: [], clientes: [] };

const SCHEMAS = {
    categorias: {
        titulo: 'Categorias',
        campos: [
            { name: 'nome', label: 'Nome da Categoria', type: 'text', required: true },
            { name: 'descricao', label: 'Descrição', type: 'text', required: false }
        ],
        colunas: [
            { key: 'id', label: 'ID' },
            { key: 'nome', label: 'NOME' },
            { key: 'descricao', label: 'DESCRIÇÃO' }
        ]
    },
    fornecedores: {
        titulo: 'Fornecedores',
        campos: [
            { name: 'razaoSocial', label: 'Razão Social', type: 'text', required: true },
            { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
            { name: 'telefone', label: 'Telefone', type: 'text', required: true },
            { name: 'email', label: 'E-mail', type: 'email', required: true }
        ],
        colunas: [
            { key: 'id', label: 'ID' },
            { key: 'razaoSocial', label: 'RAZÃO SOCIAL' },
            { key: 'cnpj', label: 'CNPJ' },
            { key: 'telefone', label: 'TELEFONE' },
            { key: 'email', label: 'E-MAIL' }
        ]
    },
    produtos: {
        titulo: 'Produtos',
        campos: [
            { name: 'nome', label: 'Nome do Produto', type: 'text', required: true },
            { name: 'codigoSku', label: 'Código SKU', type: 'text', required: true },
            { name: 'preco', label: 'Preço (R$)', type: 'number', step: '0.01', required: true },
            { name: 'estoque', label: 'Estoque', type: 'number', required: true },
            { name: 'categoria', label: 'Categoria', type: 'relation', source: 'categorias', labelKey: 'nome', required: true },
            { name: 'fornecedor', label: 'Fornecedor', type: 'relation', source: 'fornecedores', labelKey: 'razaoSocial', required: true }
        ],
        colunas: [
            { key: 'id', label: 'ID' },
            { key: 'codigoSku', label: 'SKU' },
            { key: 'nome', label: 'PRODUTO' },
            { key: 'preco', label: 'PREÇO (R$)' },
            { key: 'estoque', label: 'ESTOQUE' },
            { key: 'categoria.nome', label: 'CATEGORIA' },
            { key: 'fornecedor.razaoSocial', label: 'FORNECEDOR' }
        ]
    },
    clientes: {
        titulo: 'Clientes',
        campos: [
            { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
            { name: 'cpf', label: 'CPF', type: 'text', required: true },
            { name: 'email', label: 'E-mail', type: 'email', required: true },
            { name: 'telefone', label: 'Telefone', type: 'text', required: true }
        ],
        colunas: [
            { key: 'id', label: 'ID' },
            { key: 'nome', label: 'NOME' },
            { key: 'cpf', label: 'CPF' },
            { key: 'email', label: 'E-MAIL' },
            { key: 'telefone', label: 'TELEFONE' }
        ]
    },
    pedidos: {
        titulo: 'Pedidos de Venda',
        campos: [
            { name: 'cliente', label: 'Cliente', type: 'relation', source: 'clientes', labelKey: 'nome', required: true },
            { name: 'produto', label: 'Produto', type: 'relation', source: 'produtos', labelKey: 'nome', required: true },
            { name: 'quantidade', label: 'Quantidade', type: 'number', required: true },
            { name: 'status', label: 'Status', type: 'select-static', options: ['CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'], required: true }
        ],
        colunas: [
            { key: 'id', label: 'ID' },
            { key: 'dataPedido', label: 'DATA' },
            { key: 'cliente.nome', label: 'CLIENTE' },
            { key: 'produto.nome', label: 'PRODUTO' },
            { key: 'quantidade', label: 'QTD' },
            { key: 'valorTotal', label: 'TOTAL (R$)' },
            { key: 'status', label: 'STATUS' }
        ]
    }
};

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '-';
}

function showFeedback(message, type = 'success') {
    const box = document.getElementById('feedback');
    box.textContent = message;
    box.className = `feedback ${type}`;
    setTimeout(() => box.classList.add('hidden'), 4500);
}

async function carregarAuxiliares() {
    try {
        const [categorias, fornecedores, produtos, clientes] = await Promise.all([
            fetch(`${API_URL}/categorias`).then(r => r.json()),
            fetch(`${API_URL}/fornecedores`).then(r => r.json()),
            fetch(`${API_URL}/produtos`).then(r => r.json()),
            fetch(`${API_URL}/clientes`).then(r => r.json())
        ]);
        cache = { categorias, fornecedores, produtos, clientes };
    } catch {
        showFeedback('Falha de conexão com a API Spring Boot.', 'error');
    }
}

function renderForm(dadosEdicao = null) {
    const schema = SCHEMAS[currentEntity];
    const form = document.getElementById('entity-form');
    document.getElementById('form-title').textContent = dadosEdicao
        ? `Editar ${schema.titulo} #${dadosEdicao.id}`
        : `Novo Cadastro — ${schema.titulo}`;

    form.innerHTML = '';

    schema.campos.forEach(campo => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = campo.label;
        div.appendChild(label);

        let input;
        if (campo.type === 'relation') {
            input = document.createElement('select');
            input.name = campo.name;
            input.dataset.isRelation = 'true';
            if (campo.required) input.required = true;

            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = 'Selecione...';
            input.appendChild(optDefault);

            (cache[campo.source] || []).forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                opt.textContent = `${item[campo.labelKey]} (ID: ${item.id})`;
                if (dadosEdicao && dadosEdicao[campo.name]?.id === item.id) opt.selected = true;
                input.appendChild(opt);
            });
        } else if (campo.type === 'select-static') {
            input = document.createElement('select');
            input.name = campo.name;
            campo.options.forEach(op => {
                const opt = document.createElement('option');
                opt.value = op;
                opt.textContent = op;
                if (dadosEdicao && dadosEdicao[campo.name] === op) opt.selected = true;
                input.appendChild(opt);
            });
        } else {
            input = document.createElement('input');
            input.type = campo.type;
            input.name = campo.name;
            if (campo.step) input.step = campo.step;
            if (campo.required) input.required = true;
            if (dadosEdicao && dadosEdicao[campo.name] !== undefined) {
                input.value = dadosEdicao[campo.name];
            }
        }

        div.appendChild(input);
        form.appendChild(div);
    });

    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.className = 'btn-primary';
    btnSubmit.textContent = dadosEdicao ? 'Salvar Alterações' : 'Cadastrar';
    actions.appendChild(btnSubmit);

    if (dadosEdicao) {
        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.className = 'btn-secondary';
        btnCancel.textContent = 'Cancelar';
        btnCancel.onclick = () => { editingId = null; renderForm(); };
        actions.appendChild(btnCancel);
    }

    form.appendChild(actions);
}

async function carregarTabela() {
    const loading = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');

    loading.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tbody.innerHTML = '';

    const schema = SCHEMAS[currentEntity];
    document.getElementById('list-title').textContent = `Lista de ${schema.titulo}`;
    thead.innerHTML = `<tr>${schema.colunas.map(c => `<th>${c.label}</th>`).join('')}<th>AÇÕES</th></tr>`;

    try {
        const res = await fetch(`${API_URL}/${currentEntity}`);
        if (!res.ok) throw new Error('Erro ao carregar registros.');
        const lista = await res.json();

        if (lista.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            lista.forEach(item => {
                const tr = document.createElement('tr');
                schema.colunas.forEach(col => {
                    const td = document.createElement('td');
                    td.textContent = getNestedValue(item, col.key);
                    tr.appendChild(td);
                });

                const tdAcoes = document.createElement('td');
                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn-edit';
                btnEdit.textContent = 'Editar';
                btnEdit.onclick = () => { editingId = item.id; renderForm(item); };

                const btnDel = document.createElement('button');
                btnDel.className = 'btn-delete';
                btnDel.textContent = 'Excluir';
                btnDel.onclick = () => excluirRegistro(item.id);

                tdAcoes.append(btnEdit, btnDel);
                tr.appendChild(tdAcoes);
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        showFeedback(err.message, 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

async function excluirRegistro(id) {
    if (!confirm(`Confirmar exclusão do registro #${id}?`)) return;
    try {
        const res = await fetch(`${API_URL}/${currentEntity}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.erro || 'Não foi possível excluir o registro.');
        }
        showFeedback('Registro excluído com sucesso!');
        await atualizarTela();
    } catch (err) {
        showFeedback(err.message, 'error');
    }
}

document.getElementById('entity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {};

    e.target.querySelectorAll('input, select').forEach(el => {
        if (el.dataset.isRelation === 'true') {
            payload[el.name] = el.value ? { id: Number(el.value) } : null;
        } else if (el.type === 'number') {
            payload[el.name] = Number(el.value);
        } else {
            payload[el.name] = el.value;
        }
    });

    const url = editingId ? `${API_URL}/${currentEntity}/${editingId}` : `${API_URL}/${currentEntity}`;
    const method = editingId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro de validação.');

        showFeedback(editingId ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
        editingId = null;
        await atualizarTela();
    } catch (err) {
        showFeedback(err.message, 'error');
    }
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEntity = btn.dataset.entity;
        editingId = null;
        await atualizarTela();
    });
});

async function atualizarTela() {
    await carregarAuxiliares();
    renderForm();
    await carregarTabela();
}

atualizarTela();