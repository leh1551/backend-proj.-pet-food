// index.js
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();


app.use(cors()); // Isso permite solicitações de qualquer origem
// Configurar cabeçalhos CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir solicitações de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
  app.options('/api/produto', cors());
  
});



// Middleware para processar o corpo da solicitação
app.use(bodyParser.json());

// Rota para lidar com solicitações POST para /api/produto
app.post('/api/produto', (req, res) => {
  // Lógica para processar a solicitação POST aqui
  console.log(req.body); // Exemplo de como acessar o corpo da solicitação

  // Envie uma resposta ao cliente
  res.json({ message: 'Produto criado com sucesso!' });
});
const serviceAccount = require('./proj-petfodd-firebase-adminsdk-pyfks-9b3bed0cda.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(express.static('public'));

// Rota para a tela de administração
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});



// Rota para cadastrar produtos
app.post('/api/cadastrar-produto', async (req, res) => {
  const { nome, preco, quantidade } = req.body;

  try {
    // Certifique-se de que a variável 'nome' está definida
    if (nome !== undefined) {
      const docRef = await db.collection('produtos').add({
        nome,
        preco,
        quantidade,
      });
  
      // Obtenha os dados diretamente do objeto que você adicionou
      const dadosDoDocumento = {
        nome,
        preco,
        quantidade,
      };
  
      res.json({
        id: docRef.id,
        ...dadosDoDocumento,
      });
    } else {
      // Se 'nome' não estiver definido, trate o erro
      throw new Error('O campo "nome" não está definido.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Erro ao cadastrar o produto: ${error.message}` });
  }
});

// Rota para obter todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const querySnapshot = await db.collection('produtos').get();
  
    const documentos = [];
    querySnapshot.forEach((doc) => {
      documentos.push({
        id: doc.id,
        ...doc.data(),
      });
    });
  
    res.json(documentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Não foi possivel localizar os produtos: ${error.message}` });
  }
});
  

// Rota para obter um produto específico
app.get('/api/produtos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const doc = await db.collection('produtos').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter o produto' });
  }
});

// Rota para atualizar um produto existente
app.put('/api/produtos/:id', async (req, res) => {
  const id = req.params.id;
  const atualizacao = req.body;

  try {
    const docRef = db.collection('produtos').doc(id);
    await docRef.update(atualizacao);

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o produto' });
  }
});

// Rota para excluir um produto
app.delete('/api/produtos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await db.collection('produtos').doc(id).delete();
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir o produto' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

