const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(cookieParser());


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// DELETE POST all post should end with redirect all gets should end with render
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]; // deletes shortURL key: value pair
  res.redirect('/urls'); // redirects back to /urls
})
 
 app.post("/urls", (req, res) => { // add POST request
  const longURL = req.body['longURL'];  // Log the POST request body to the console, req.body = { longURL: 'input'}
  urlDatabase[generateRandomString()] = longURL;
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this), output on page after input
});


 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post('/urls/:shortURL/', (req, res) => { // edit URL
  const longURL = req.params.shortURL;
  const body = req.body // body['newURL'] is new URL inputted in to edit box
  if (req.body['newURL']) {
    urlDatabase[longURL] = body['newURL']; // edits newURL in to oldURL
  }
  res.redirect(`/urls/${req.params.shortURL}`) // redirects back to new URL
})

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // urlDatabase with b2xVn2 format(req.params.shortURL) as key
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL }; 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
  // res.redirect('http://www.lighthouselabs.ca')
});

app.get('/login', (req,res) => { // renders login
  res.render('login')
})

app.post('/login', (req, res) => { // /login
  res.cookie('username', req.body['username'])
  res.redirect('/urls');
})

app.post('/logout', (req, res) => { // logout
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get('/register', (req, res) => { // renders register page
  res.render('register')
})

app.post('/register', (req, res) => { // register
  const email = req.body['email'];
  const password = req.body['password'];
  const id = generateRandomString()
  const newUser = id
  users[newUser]['id'] = newUser;
  users[newUser]['email'] = email;
  users[newUser]['password'] = password;
  console.log(users);

  res.redirect('/register');
})