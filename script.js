
let lista = [];
let total = 0;

function iniciarCompra() {
  const estabelecimento = $('#estabelecimento').val().trim();
  if (!estabelecimento) {
    alert('Por favor, informe o nome do estabelecimento antes de adicionar itens.');
    return;
  }
  sessionStorage.setItem('estabelecimento', estabelecimento);
  $('#formularioItens').show();
}

$('#estabelecimento').on('change', function() {
  if ($(this).val().trim()) {
    $('#formularioItens').show();
  } else {
    $('#formularioItens').hide();
  }
});

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
}

function atualizarTabela() {
  let html = `<h4>Estabelecimento: ${sessionStorage.getItem('estabelecimento')}</h4><table class="table table-bordered"><thead><tr>
    <th>Item</th><th>Marca</th><th>Valor Unitário</th><th>Qtd</th><th>Subtotal</th></tr></thead><tbody>`;

  lista.forEach(item => {
    html += `<tr><td>${item.descricao}</td><td>${item.marca}</td><td>R$ ${item.valor.toFixed(2)}</td>
      <td>${item.quantidade}</td><td>R$ ${item.subtotal.toFixed(2)}</td></tr>`;
  });

  html += `</tbody></table><h5>Total Geral: €$ ${total.toFixed(2)}</h5>`;
  $('#tabelaCompras').html(html);
}

function finalizarCompra() {
  if (lista.length === 0) {
    alert('Adicione ao menos um item antes de finalizar.');
    return;
  }
  if (confirm('Deseja finalizar a compra?')) {
    let comprasRealizadas = JSON.parse(localStorage.getItem('comprasRealizadas') || '[]');
    comprasRealizadas.push({
      estabelecimento: sessionStorage.getItem('estabelecimento'),
      data: new Date().toLocaleDateString(),
      itens: lista,
      total
    });
    localStorage.setItem('comprasRealizadas', JSON.stringify(comprasRealizadas));
    alert('Compra finalizada e salva!');
    lista = [];
    total = 0;
    $('#formularioItens').hide();
    $('#tabelaCompras').html('');
    $('#estabelecimento').val('');
  }
}
