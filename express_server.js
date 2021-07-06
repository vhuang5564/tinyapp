const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

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

 
 app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console, req.body = { longURL: 'input'}
  res.send("Ok");         // Respond with 'Ok' (we will replace this), output on page after input
});

 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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
