const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "cytus": {
    id: "cytus", 
    email: "cytus@alive.com", 
    password: "chocological"
  },
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


function generateRandomString() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let string = '';
  const digits = 6;
  for (let i = 0; i < digits; i++) {
    string += chars[parseInt(chars.length * Math.random())];
  }
  return string;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
     urls: urlDatabase,
     user: users[req.cookies["user_id"]] 
    };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
})

app.post("/urls", (req, res) => {
  const shortenedURL = generateRandomString();
  urlDatabase[shortenedURL] = req.body['longURL'];
  res.redirect(`/urls/${shortenedURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

const ifUserExists = function (email) {
  for (const user in users) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

app.post("/register", (req, res) => {
  if (ifUserExists(req.body.email)) {
    res.send(400, "This email address is not available.");
  } else if (!req.body.email) {
    res.send(400, "Email address cannot be empty");
  } else if (!req.body.password) {
    res.send(400, "Password is invalid.")
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    }  
    res.cookie('user_id', userID)
    res.redirect('/urls')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

