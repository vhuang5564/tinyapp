const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { findUserByEmail, generateRandomString } = require('./helpers');

app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    res.redirect('/login');
  }

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  let userURL = {};

  // finds if id is equal. if equal returns userURLs only
  for (const url in urlDatabase) {
    if (urlDatabase[url]['userID'] === userID) {
      userURL[url] = urlDatabase[url];
    }
  }
  
  if (!userID) {
    return res.status(401).send('you have to be logged in to view this page');
  }

  const templateVars = { urls: userURL, userID: userID, users: users };
  res.render('urls_index', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.userID;

  if (urlDatabase[req.params.shortURL]['userID'] !== userID) {
    return res.status(401).send('You are not authorized to delete this URL.');
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
 
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const longURL = req.body['longURL'];
  const randomString = generateRandomString();

  if (!userID) {
    return res.status(401).send('You are not authorized to POST on this page.');
  }

  urlDatabase[randomString] = { 'longURL': longURL, 'userID': req.session.userID}; // inputs new id and longURL
  res.redirect(`/urls/${randomString}`);
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  
  const templateVars = { userID: userID, users: users};
  if (!userID) {
    return res.status(404).send('you are not authorized to create new URLs');
  }
  res.render("urls_new", templateVars);
});

app.post('/urls/:shortURL/', (req, res) => {
  const shortURL = req.params.shortURL;
  const body = req.body;

  if (req.body['newURL']) {
    urlDatabase[shortURL]['longURL'] = body['newURL']; // edits newURL in to oldURL
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;

  if (urlDatabase[req.params.shortURL]['userID'] !== userID) {
    return res.status(401).send('You are not authorized to be on this page.');
  }

  for (const url in urlDatabase) { // if url in hyperlink is equal to url in database go to url
    if (url === req.params.shortURL) {
      const longURL = urlDatabase[req.params.shortURL]['longURL'];
      const templateVars = { shortURL: req.params.shortURL, longURL: longURL, userID: userID, users: users };
      return res.render("urls_show", templateVars);
    }
  }

  res.status(404).send('404 error page not found');
});

app.get("/u/:shortURL", (req, res) => {

  for (const url in urlDatabase) {
    if (req.params.shortURL === url) {
      const longURL = urlDatabase[req.params.shortURL]['longURL'];
      return res.redirect(longURL);
    }
  }

  res.status(404).send('this page does not exist.');

});

app.get('/login', (req,res) => {
  const userID = req.session.userID;

  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { userID: userID, users: users };
  res.render('login', templateVars);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/error', (req, res) => {
  res.render('error');
});

app.get('/register', (req, res) => {
  const userID = req.session.userID;

  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { userID: userID, users: users };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  const id = generateRandomString();

  if (email === '' || password === '') {
    return res.status(400).send('email/password cannot be blank');
  }

  let user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send('email already exists');
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      users[id]['password'] = hash;
    });
  });

  // creates new users
  users[id] = {};
  users[id]['id'] = id;
  users[id]['email'] = email;
  req.session.userID = users[id]['id'];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  let user = findUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('email not found');
  }
  
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(400).send('password does not match');
    }
    req.session.userID = user.id;
    res.redirect('/urls');
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
