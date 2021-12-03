const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find(user => user.username === username);

  if(!user){
    return res.status(404).json({error: 'User not found'})
  }

  req.user = user;

  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const usernameExists = users.some((user) => user.username === username);
  if(usernameExists) {
    return res.status(400).json({error: "This Username Already Exists"});
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  };
  users.push(user);

  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo)

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = user.todos.find(todo => todo.id === req.params.id);
  if(!todo){
    return res.status(404).json({ error: 'TO-DO not found' })
  };

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const todo = user.todos.find(todo => todo.id === req.params.id);
  if(!todo){
    return res.status(404).json({ error: 'TO-DO not found' })
  };

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const todo = user.todos.find((todo) => todo.id === req.params.id);

  if (!todo) {
    return res.status(404).json({ error: "TODO Not Found" });
  }
  
  user.todos.splice(todo, 1);
  
  return res.status(204).json()
});

module.exports = app;