const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const e = require("express");
const { findUserByEmail } = require('./helpers')
const { generateRandomString } = require('./helpers')

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
    res.redirect('/login')
  }

  res.redirect('/urls')
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
  const userID = req.session.userID;
  let userURL = {} // placeholder for user specific URLs, gets new URLs from urlDatabase everytime /url page is run

  // finds if id is equal. if equal returns userURLs only
  for (url in urlDatabase) {
    if (urlDatabase[url]['userID'] === userID) {
      userURL[url] = urlDatabase[url]; // fix this, shouldn't use entire database
    }
  }
  
  if (!userID) { // redirects to /login if you are not logged in
    res.status(401).send('you have to be logged in to view this page'); /* assignment asks to be redirected to html page but it is hard to navigate back to home page
    because / redirects you back to /urls which directs you redirects you to this error page. */
  }

  const templateVars = { urls: userURL, userID: userID, users: users }; // urls detected are only from userURLs
  res.render('urls_index', templateVars);
});

// DELETE POST all post should end with redirect all gets should end with render
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.userID;

  if (urlDatabase[req.params.shortURL]['userID'] !== userID) { // if userID !== logged in userID return error
    return res.status(401).send('You are not authorized to delete this URL.')
  }

  delete urlDatabase[req.params.shortURL]; // deletes shortURL key: value pair
  res.redirect('/urls'); // redirects back to /urls
})
 
 app.post("/urls", (req, res) => { // add POST request
  const userID = req.session.userID;
  const longURL = req.body['longURL'];  // Log the POST request body to the console, req.body = { longURL: 'input'}
  const randomString = generateRandomString()

  if (!userID) { // if userID !== logged in userID return error
    return res.status(401).send('You are not authorized to POST on this page.')
  }

  urlDatabase[randomString] = { 'longURL': longURL, 'userID': req.session.userID}; // inputs new id and longURL
  res.redirect(`/urls/${randomString}`);
});


 app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  

  const templateVars = { userID: userID, users: users}
  if (!userID) {
    res.status(404).send('you are not authorized to create new URLs')
  }
  res.render("urls_new", templateVars);
});

app.post('/urls/:shortURL/', (req, res) => { // edit URL fixed
  const shortURL = req.params.shortURL;
  const body = req.body // body['newURL'] is new URL inputted in to edit box

  if (req.body['newURL']) {
    urlDatabase[shortURL]['longURL'] = body['newURL']; // edits newURL in to oldURL
  }
  res.redirect(`/urls/${req.params.shortURL}`) // redirects back to new URL
})

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;

  if (urlDatabase[req.params.shortURL]['userID'] !== userID) { // if userID !== logged in userID return error
    res.status(401).send('You are not authorized to be on this page.')
  }

  for (url in urlDatabase) { // if url in hyperlink is equal to url in database go to url
    if (url == req.params.shortURL) {
      const longURL = urlDatabase[req.params.shortURL]['longURL']; // urlDatabase with b2xVn2 format(req.params.shortURL) as key
      const templateVars = { shortURL: req.params.shortURL, longURL: longURL, userID: userID, users: users }; 
      res.render("urls_show", templateVars);
    } 
  }

  res.status(404).send('404 error page not found'); // else return error 
});

app.get("/u/:shortURL", (req, res) => {

  for (url in urlDatabase) {
    if (req.params.shortURL === url) {
      const longURL = urlDatabase[req.params.shortURL]['longURL']; // fixed
      res.redirect(longURL);
    }
  }

  res.status(404).send('this page does not exist.')

});

app.get('/login', (req,res) => { // renders login
  const userID = req.session.userID;

  if (userID) {
    res.redirect('/urls');
  }

  const templateVars = { userID: userID, users: users }
  res.render('login', templateVars);
})

app.post('/logout', (req, res) => { // logout
  req.session = null;
  res.redirect('/login');
})

app.get('/error', (req, res) => {
  res.render('error');
})

app.get('/register', (req, res) => { // renders register page
  const userID = req.session.userID;

  if (userID) { // if user is logged in redirect to
    res.redirect('/urls')
  }

  const templateVars = { userID: userID, users: users }
  res.render('register', templateVars)
})

app.post('/register', (req, res) => { // register
  const email = req.body['email'];
  const password = req.body['password'];
  const id = generateRandomString()

  if (email === '' || password === '') { // will return err if email/pw are blank but used type-require for email + pw so this err will probably never show up
    return res.status(400).send('email/password cannot be blank');
  }

  user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send('email already exists')
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      users[id]['password'] = hash;
    })
  })

  users[id] = {}; // creates new user
      users[id]['id'] = id;
      users[id]['email'] = email;
      req.session.userID = users[id]['id'];
      res.redirect('/urls');
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  user = findUserByEmail(email, users);

  if (!user) {
    res.status(400).send('email not found')
  }
  
  bcrypt.compare(password, user.password, (err, result) => { // compares hashed password
    if (!result) {
      return res.status(400).send('password does not match')
    }
    req.session.userID = user.id
    res.redirect('/urls');
  });
})

app.get('/protected', (req, res) => {
  const userID = req.session.userID;


  if (!userID) {
    return res.status(401).send('you are not authorized to be here');
  }

  const user = users[userID]


  res.render('protected', { user, users, userID });

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
