const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar
router.get('/', (req, res) => {
  db.all('SELECT * FROM produtos ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Cadastrar
router.post('/', (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body;
  const imgFinal = imagem || 'https://placehold.co/100?text=Foto';
  
  // POSTGRES: Usa RETURNING id para devolver o ID criado
  const sql = `INSERT INTO produtos (nome, categoria, preco_venda, estoque, imagem) VALUES ($1, $2, $3, $4, $5)`;

  db.run(sql, [nome, categoria, preco, estoque, imgFinal], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    // O meu wrapper db.js já adapta 'this.lastID', então isso deve funcionar:
    res.json({ id: this.lastID, message: 'Sucesso' });
  });
});

// Excluir
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM produtos WHERE id = $1', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto excluído' });
  });
});

// Editar
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco, estoque, imagem } = req.body;
  
  const sql = `UPDATE produtos SET nome = $1, categoria = $2, preco_venda = $3, estoque = $4, imagem = $5 WHERE id = $6`;
  
  db.run(sql, [nome, categoria, preco, estoque, imagem, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto atualizado' });
  });
});

module.exports = router;
