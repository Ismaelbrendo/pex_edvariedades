const { Pool } = require('pg');
require('dotenv').config();

// Conexão com o Banco na Nuvem (Neon/Supabase) ou Local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para Neon/Render/Supabase
  }
});

// Função auxiliar para inicializar as tabelas
const initDb = async () => {
  const client = await pool.connect();
  try {
    // Tabela Produtos
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria TEXT,
        preco_venda NUMERIC(10, 2),
        estoque INTEGER DEFAULT 0,
        imagem TEXT
      );
    `);

    // Tabela Vendas
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        data DATE,
        produto_id INTEGER REFERENCES produtos(id),
        quantidade INTEGER,
        valor_total NUMERIC(10, 2),
        forma_pagamento TEXT
      );
    `);
    console.log('Banco de dados PostgreSQL inicializado!');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
  } finally {
    client.release();
  }
};

// Chama a criação das tabelas ao iniciar
initDb();

// Adaptador para manter compatibilidade com seu código antigo (db.run, db.all, db.get)
// O SQLite usava callbacks (função(err, rows)), o PG usa Promises, mas vamos adaptar:

const db = {
  // Para SELECTs que retornam várias linhas
  all: (text, params, callback) => {
    pool.query(text, params)
      .then(res => callback(null, res.rows))
      .catch(err => callback(err, null));
  },
  // Para SELECT que retorna uma única linha
  get: (text, params, callback) => {
    pool.query(text, params)
      .then(res => callback(null, res.rows[0]))
      .catch(err => callback(err, null));
  },
  // Para INSERT, UPDATE, DELETE
  run: function(text, params, callback) {
    // Tratamento especial para INSERT que precisa retornar o ID inserido
    // No Postgres, precisamos adicionar "RETURNING id" no final da query SQL se quisermos o ID
    // Mas como mudar todas as queries dá trabalho, vamos fazer um 'hack' se for INSERT:
    
    const isInsert = text.trim().toUpperCase().startsWith('INSERT');
    const queryFinal = isInsert ? text + ' RETURNING id' : text;

    pool.query(queryFinal, params)
      .then(res => {
        // Simula o "this.lastID" e "this.changes" do SQLite
        const context = { 
          lastID: isInsert && res.rows[0] ? res.rows[0].id : null,
          changes: res.rowCount 
        };
        // callback.call preserva o 'this' para usarmos this.lastID
        if (callback) callback.call(context, null);
      })
      .catch(err => {
        if (callback) callback(err);
      });
  }
};

module.exports = db;
