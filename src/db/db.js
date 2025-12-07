const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'edvariedades.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT,
      descricao TEXT,
      custo_material REAL,
      custo_mao_obra REAL,
      preco_venda REAL,
      estoque INTEGER,
      imagem TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      produto_id INTEGER,
      quantidade INTEGER,
      valor_total REAL,
      forma_pagamento TEXT,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )
  `);
});

module.exports = db;
