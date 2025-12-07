const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Resumo dos Cards
router.get('/resumo', (req, res) => {
  // Queries aninhadas no Postgres funcionam igual
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM produtos) as "totalProdutos",
      (SELECT COUNT(*) FROM vendas) as "totalVendas",
      (SELECT COALESCE(SUM(valor_total), 0) FROM vendas) as faturamento,
      (SELECT COUNT(*) FROM produtos WHERE estoque < 5) as "estoqueBaixo"
  `;
  // Nota: COALESCE substitui IFNULL no Postgres. E aspas duplas preservam camelCase nas colunas.
  
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Gráfico
router.get('/grafico', (req, res) => {
  // Postgres requer group by explicito ou window functions.
  // TO_CHAR converte data para string, mas manter como date é melhor para ordenar.
  const sql = `
    SELECT data, SUM(valor_total) as total 
    FROM vendas 
    GROUP BY data 
    ORDER BY data ASC 
    LIMIT 7
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!rows || rows.length === 0) {
      return res.json({ labels: [], data: [] });
    }

    const labels = rows.map(r => {
      // Postgres retorna objeto Date, precisamos formatar
      const d = new Date(r.data); 
      // Ajuste de fuso horário simples (evita dia anterior)
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    });
    const data = rows.map(r => r.total);
    
    res.json({ labels, data });
  });
});

module.exports = router;
