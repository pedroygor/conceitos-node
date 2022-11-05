const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if(!users.some((user) => user.username === username)) {
    return response.status(400).json({error: 'Mensagem do erro'})
  }

  request.username = username;
  return next();
}

function findUserByUsername(username) {
  return users.find((user) => user.username === username)
}

app.post('/users', (request, response) => {
  const user = {id: v4(), ...request.body, todos: []}
  users.push(user)
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = findUserByUsername(username)

  response.status(200).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const todo = {
    id: v4(), 
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date()
  }
  const user = findUserByUsername(request.username)
  user.todos.push(todo);

  response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;