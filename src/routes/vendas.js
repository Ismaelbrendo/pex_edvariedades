const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar vendas (mantém igual, só conferindo)
router.get('/', (req, res) => {
  const sql = `
    SELECT v.id, v.data, v.quantidade, v.valor_total, v.forma_pagamento, p.nome as produto_nome 
    FROM vendas v
    JOIN produtos p ON v.produto_id = p.id
    ORDER BY v.data DESC, v.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Registrar nova venda
router.post('/', (req, res) => {
  // Pega também o campo 'data' do corpo da requisição
  const { produto_id, quantidade, forma_pagamento, data } = req.body; 
  
  db.get('SELECT preco_venda, estoque FROM produtos WHERE id = ?', [produto_id], (err, produto) => {
    if (err || !produto) return res.status(404).json({ error: 'Produto não encontrado' });
    
    if (produto.estoque < quantidade) {
      return res.status(400).json({ error: 'Estoque insuficiente!' });
    }

    const valor_total = produto.preco_venda * quantidade;
    
    // Se veio data do form, usa ela. Se não, usa hoje (YYYY-MM-DD)
    const dataVenda = data || new Date().toISOString().split('T')[0];

    const sqlVenda = `INSERT INTO vendas (data, produto_id, quantidade, valor_total, forma_pagamento) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sqlVenda, [dataVenda, produto_id, quantidade, valor_total, forma_pagamento], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run('UPDATE produtos SET estoque = estoque - ? WHERE id = ?', [quantidade, produto_id], (err) => {
        if (err) console.error('Erro ao atualizar estoque');
        res.json({ message: 'Venda registrada com sucesso!' });
      });
    });
  });
});

module.exports = router;
