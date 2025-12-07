const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = 3000;
const produtosRouter = require('./src/routes/produtos');
const vendasRouter = require('./src/routes/vendas');
const dashboardRouter = require('./src/routes/dashboard');
const estoqueRouter = require('./src/routes/estoque');


// Middleware para JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'segredo-ed-variedades', // Chave para assinar a sessão
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 'true' só se tiver HTTPS
}));

// 2. Middleware de Proteção (O porteiro)
function protegerRota(req, res, next) {
  if (req.session.usuarioLogado) {
    next(); // Pode passar
  } else {
    res.redirect('/'); // Volta pro login
  }
}



app.use('/api/vendas', vendasRouter);

// Arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/api/produtos', produtosRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/estoque', estoqueRouter);

// Rotas de páginas


// 3. Rota de Login (POST)
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  
  // Login simples fixo (para o PEX é suficiente)
  // Em produção real, buscaria do banco com hash
  if (email === 'admin@edvariedades.com' && senha === 'admin123') {
    req.session.usuarioLogado = true;
    res.json({ sucesso: true });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Email ou senha incorretos' });
  }
});

// 4. Rota de Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
// A página de login (/) NÃO tem proteção
app.get('/', (req, res) => {
  if (req.session.usuarioLogado) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'src', 'views', 'login.html'));
});

// As outras rotas ganham o 'protegerRota'
app.get('/dashboard', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'dashboard.html'));
});

app.get('/produtos', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'produtos.html'));
});

app.get('/vendas', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'vendas.html'));
});

app.get('/estoque', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'estoque.html'));
});





// Aqui depois você importa e usa rotas de /routes (produtos, vendas etc.)

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
