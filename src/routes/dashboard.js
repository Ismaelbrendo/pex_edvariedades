const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Rota 1: Resumo dos Cards
router.get('/resumo', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM produtos) as totalProdutos,
      (SELECT COUNT(*) FROM vendas) as totalVendas,
      (SELECT IFNULL(SUM(valor_total), 0) FROM vendas) as faturamento,
      (SELECT COUNT(*) FROM produtos WHERE estoque < 5) as estoqueBaixo
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Rota 2: Dados do Gráfico (ESTA ESTAVA FALTANDO OU ERRADA)
router.get('/grafico', (req, res) => {
  const sql = `
    SELECT data, SUM(valor_total) as total 
    FROM vendas 
    GROUP BY data 
    ORDER BY data ASC 
    LIMIT 7
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Se não tiver vendas, manda array vazio para não quebrar
    if (!rows || rows.length === 0) {
      return res.json({ labels: [], data: [] });
    }

    const labels = rows.map(r => {
      // Formata data YYYY-MM-DD para DD/MM
      const [ano, mes, dia] = r.data.split('-');
      return `${dia}/${mes}`;
    });
    const data = rows.map(r => r.total);
    
    res.json({ labels, data });
  });
});

module.exports = router;
