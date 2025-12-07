const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Listar todos os produtos
router.get('/', (req, res) => {
  db.all('SELECT * FROM produtos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Cadastrar
router.post('/', (req, res) => {
  const { nome, categoria, preco, estoque, imagem } = req.body; // <--- Adicionado imagem
  const sql = `INSERT INTO produtos (nome, categoria, preco_venda, estoque, imagem) VALUES (?, ?, ?, ?, ?)`;
  
  // Se imagem vier vazia, coloca uma placeholder
  const imgFinal = imagem || 'https://placehold.co/100?text=Foto';

  db.run(sql, [nome, categoria, preco, estoque, imgFinal], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Sucesso' });
  });
});

// Excluir (DELETE)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM produtos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto excluído' });
  });
});

// Editar (PUT) - Simplificado (atualiza tudo)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco, estoque, imagem } = req.body;
  
  const sql = `UPDATE produtos SET nome = ?, categoria = ?, preco_venda = ?, estoque = ?, imagem = ? WHERE id = ?`;
  
  db.run(sql, [nome, categoria, preco, estoque, imagem, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto atualizado' });
  });
});

module.exports = router;
