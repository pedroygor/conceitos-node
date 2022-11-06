const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function findUserByUsername(username) {
  return users.find((user) => user.username === username)
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if(!users.some((user) => user.username === username)) {
    return response.status(404).json({error: 'user not found'})
  }

  request.username = username;
 
  return next();
}

function checkExistsUsername(request, response, next) {
  if (users.some((usr) => usr.username === request.body.username)) {
    return response.status(400).json({ error: 'username is exists' })
  }
  return next();
}

function checkExistsTodoID(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;
  const user = findUserByUsername(username);

  if (!user.todos.some((todo) => todo.id === id)) {
    return response.status(404).json({ error: 'todo not found' })
  }

  request.username = username;
  return next();
}


app.post('/users', checkExistsUsername, (request, response) => {
 
  const user = {id: v4(), ...request.body, todos: []}
  
  users.push(user)
  
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  
  const user = findUserByUsername(username)

  return response.status(200).json(user.todos)
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

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodoID, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const user = findUserByUsername(username);
  const update = {...request.body}
  user.todos.forEach((todo) => {
    if(todo.id === id) {
      todo.title = request.body.title;
      todo.deadline = new Date(request.body.deadline);
      update.done = todo.done;
    }
  })
  
  return response.status(200).send(update)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodoID, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = findUserByUsername(username);
  let todoModify = {}
  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.done = true;
      todoModify = todo;
    }
  })

  return response.status(200).send(todoModify)
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodoID, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = findUserByUsername(username);

  const todos = user.todos.filter((todo) => todo.id !== id)

  user.todos = todos;

  return response.status(204).send(user.todos)
});

module.exports = app;