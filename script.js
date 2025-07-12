let lista = [];
let total = 0;

// Função para iniciar a compra
function iniciarCompra() {
  const estabelecimento = $('#estabelecimento').val().trim();
  const data = $('#data').val().trim();

  if (!estabelecimento) {
    alert('Por favor, informe o nome do estabelecimento antes de adicionar itens.');
    return;
  }
  if (!data) {
    alert('Por favor, informe a data da compra.');
    return;
  }

  sessionStorage.setItem('estabelecimento', estabelecimento);
  sessionStorage.setItem('data', data);
  $('#formularioItens').show();
  $('#estabelecimento').parent().hide();
  $('#data').parent().hide();
}

// Adiciona um item à lista de compras
function adicionarItem() {
  const descricao = $('#descricao').val().trim();
  const marca = $('#marca').val().trim();
  const valor = parseFloat($('#valor').val());
  const quantidade = parseInt($('#quantidade').val());

  if (!descricao || isNaN(valor) || isNaN(quantidade) || quantidade <= 0) {
    alert('Preencha todos os campos obrigatórios corretamente.');
    return;
  }

  const duplicado = lista.find(item => item.descricao === descricao && item.marca === marca);
  if (duplicado) {
    alert('Esse item já foi adicionado!');
    return;
  }

  const subtotal = valor * quantidade;
  lista.push({ descricao, marca, valor, quantidade, subtotal });
  total += subtotal;
  atualizarTabela();
  $('#descricao').val('');
  $('#marca').val('');
  $('#valor').val('');
  $('#quantidade').val('');
  $('#descricao').focus();

}

// Atualiza a tabela com os itens e o total
function atualizarTabela() {
  let html = `<h4>Estabelecimento: ${sessionStorage.getItem('estabelecimento')}</h4>
              <h5>Data: ${sessionStorage.getItem('data')}</h5>
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Marca</th>
                    <th>Valor Unitário</th>
                    <th>Qtd</th>
                    <th>Subtotal</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>`;

  lista.forEach((item, index) => {
    html += `
      <tr>
        <td>${item.descricao}</td>
        <td>${item.marca}</td>
        <td>R$ ${item.valor.toFixed(2)}</td>
        <td>${item.quantidade}</td>
        <td>R$ ${item.subtotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-warning" onclick="editarItem(${index})">Editar</button>
          <button class="btn btn-danger" onclick="excluirItem(${index})">Excluir</button>
        </td>
      </tr>`;
  });

  html += `</tbody></table><h5>Total Geral: R$ ${total.toFixed(2)}</h5>`;
  $('#tabelaCompras').html(html);
}

// Edita um item na lista de compras
function editarItem(index) {
  const item = lista[index];
  $('#descricao').val(item.descricao);
  $('#marca').val(item.marca);
  $('#valor').val(item.valor);
  $('#quantidade').val(item.quantidade);

  excluirItem(index); // Exclui o item para evitar duplicação
}

// Exclui um item da lista de compras
function excluirItem(index) {
  lista.splice(index, 1);
  total = lista.reduce((acc, item) => acc + item.subtotal, 0);
  atualizarTabela();
}

// Finaliza a compra e salva no armazenamento local
function finalizarCompra() {
  if (lista.length === 0) {
    alert('Adicione ao menos um item antes de finalizar.');
    return;
  }
  if (confirm('Tem certeza que deseja Finalizar a Compra?')) {
    let comprasRealizadas = JSON.parse(localStorage.getItem('comprasRealizadas') || '[]');
    comprasRealizadas.push({
      estabelecimento: sessionStorage.getItem('estabelecimento'),
      data: sessionStorage.getItem('data'),
      itens: lista,
      total
    });
    localStorage.setItem('comprasRealizadas', JSON.stringify(comprasRealizadas));
    alert('Compra finalizada e salva!');
    gerarExportacoes(lista);
    lista = [];
    total = 0;
    $('#formularioItens').hide();
    $('#tabelaCompras').html('');
    $('#estabelecimento').val('');
    $('#data').val('');
  }
}

// Função para consultar as compras anteriores
function consultarCompras() {
  let comprasRealizadas = JSON.parse(localStorage.getItem('comprasRealizadas') || '[]');
  if (comprasRealizadas.length === 0) {
    alert('Não há compras anteriores registradas.');
    return;
  }

  let html = '<h4>Compras Anteriores</h4><ul>';
  comprasRealizadas.forEach(compra => {
    html += `<li><strong>${compra.estabelecimento}</strong> - ${compra.data} - Total: R$ ${compra.total.toFixed(2)}</li>`;
  });
  html += '</ul>';
  $('#tabelaCompras').html(html);
}

function gerarExportacoes(lista) {
  let texto = `Estabelecimento: ${sessionStorage.getItem('estabelecimento')}\n`;
  texto += `Data: ${sessionStorage.getItem('data')}\n\n`;
  texto += `Itens:\n`;
  lista.forEach(item => {
    texto += `- ${item.descricao} ${item.marca ? '(' + item.marca + ')' : ''} x${item.quantidade} - R$ ${item.valor.toFixed(2)}\n`;
  });
  texto += `\nTotal: R$ ${total.toFixed(2)}`;

  // WhatsApp
  const whatsappURL = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  if (confirm("Deseja compartilhar a com  pra via WhatsApp?")) {
    window.open(whatsappURL, "_blank");
  }

  // Download .txt
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "compra.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
