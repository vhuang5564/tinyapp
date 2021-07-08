const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

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
  },
  'randomID': {
    id: 'a',
    email: 'a@a.com',
    password: '1234'
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

const findUserByEmail = email => {
  for (const id in users) {
    const user = users[id]
    if(user.email === email) {
      return user;
    } 
  }
  return null;
}

app.get("/", (req, res) => {
  res.redirect('/urls')
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
  const userID = req.cookies.userID;
  if (!userID) {
    return res.redirect('/login');
  }
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

app.post('/logout', (req, res) => { // logout
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get('/error', (req, res) => {
  res.render('error');
})

app.get('/register', (req, res) => { // renders register page
  res.render('register')
})

app.post('/register', (req, res) => { // register
  const email = req.body['email'];
  const password = req.body['password'];
  const id = generateRandomString()

  console.log(users);

  if (email === '') {
    return res.status(400).send('email cannot be blank');
  }

  user = findUserByEmail(email);

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
      console.log(users);
      res.redirect('/register');
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  user = findUserByEmail(email);
  console.log(findUserByEmail(email));

  if (!user) {
    res.status(400).send('email not found')
  }


  bcrypt.compare(password, user.password, (err, result) => { // compares hashed password
    if (!result) {
      return res.status(400).send('password does not match')
    }
    res.cookie('userID', user.ID);

    res.redirect('/protected');
  });
})

app.get('/protected', (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    return res.status(401).send('you are not authorized to be here');
  }

  const user = users[userID]

  console.log(user);

  res.render('protected', { user, users });

})