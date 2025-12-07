const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar vendas
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
  const { produto_id, quantidade, forma_pagamento, data } = req.body; 
  
  // 1. Verifica Produto e Estoque
  db.get('SELECT preco_venda, estoque FROM produtos WHERE id = $1', [produto_id], (err, produto) => {
    if (err || !produto) return res.status(404).json({ error: 'Produto não encontrado' });
    
    if (produto.estoque < quantidade) {
      return res.status(400).json({ error: 'Estoque insuficiente!' });
    }

    const valor_total = produto.preco_venda * quantidade;
    const dataVenda = data || new Date().toISOString().split('T')[0];

    // 2. Insere Venda
    const sqlVenda = `INSERT INTO vendas (data, produto_id, quantidade, valor_total, forma_pagamento) VALUES ($1, $2, $3, $4, $5)`;
    
    db.run(sqlVenda, [dataVenda, produto_id, quantidade, valor_total, forma_pagamento], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // 3. Atualiza Estoque
      db.run('UPDATE produtos SET estoque = estoque - $1 WHERE id = $2', [quantidade, produto_id], (err) => {
        if (err) console.error('Erro ao atualizar estoque');
        res.json({ message: 'Venda registrada com sucesso!' });
      });
    });
  });
});

module.exports = router;
