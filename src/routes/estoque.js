const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar produtos com status calculado
router.get('/', (req, res) => {
  db.all('SELECT * FROM produtos ORDER BY estoque ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Adiciona status lógico antes de enviar
    const produtosComStatus = rows.map(p => ({
      ...p,
      status: p.estoque === 0 ? 'Esgotado' : p.estoque < 5 ? 'Baixo' : 'Em Estoque',
      corStatus: p.estoque === 0 ? 'danger' : p.estoque < 5 ? 'warning' : 'success'
    }));
    
    res.json(produtosComStatus);
  });
});

// Atualizar quantidade (Repor Estoque)
router.post('/repor', (req, res) => {
  const { id, quantidade } = req.body;
  const qtd = parseInt(quantidade);

  if (!id || isNaN(qtd)) return res.status(400).json({ error: 'Dados inválidos' });

  db.run('UPDATE produtos SET estoque = estoque + ? WHERE id = ?', [qtd, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estoque atualizado com sucesso!' });
  });
});

module.exports = router;
