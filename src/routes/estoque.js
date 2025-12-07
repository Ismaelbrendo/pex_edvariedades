const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar produtos com status
router.get('/', (req, res) => {
  db.all('SELECT * FROM produtos ORDER BY estoque ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const produtosComStatus = rows.map(p => ({
      ...p,
      status: p.estoque === 0 ? 'Esgotado' : p.estoque < 5 ? 'Baixo' : 'Em Estoque',
      corStatus: p.estoque === 0 ? 'danger' : p.estoque < 5 ? 'warning' : 'success'
    }));
    
    res.json(produtosComStatus);
  });
});

// Repor Estoque
router.post('/repor', (req, res) => {
  const { id, quantidade } = req.body;
  const qtd = parseInt(quantidade);

  if (!id || isNaN(qtd)) return res.status(400).json({ error: 'Dados inválidos' });

  // Postgres update
  db.run('UPDATE produtos SET estoque = estoque + $1 WHERE id = $2', [qtd, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estoque atualizado com sucesso!' });
  });
});

module.exports = router;
