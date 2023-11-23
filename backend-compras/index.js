// index.js
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const serviceAccount = require('./proj-petfodd-firebase-adminsdk-pyfks-9b3bed0cda.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
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
    const docRef = await db.collection('produtos').add({
      nome,
      preco,
      quantidade,
    });

    res.json({ id: docRef.id, nome, preco, quantidade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Erro ao cadastrar o produto: ${error}` });
  }
});

// Rota para obter todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const snapshot = await db.collection('produtos').get();
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Erro ao obter os produtos: ${error}` });
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
app.patch('/api/produtos/:id', async (req, res) => {
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

