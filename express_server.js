const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://github.com/cytusalive/tinyapp",
      userID: "cytus"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "cytus"
  }
};

const users = { 
  "cytus": {
    id: "cytus", 
    email: "cytus@alive.com", 
    password: "$2b$10$kSUsspaw/FDEsMUL0XpOPeJoAkW8qd5mIoyvY0yFOyGNfNNoGN3i."
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

function urlsForUser(id) {
  const userURLs = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      userURLs[URL] = urlDatabase[URL];
    }
  }
  return userURLs;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
     urls: urlsForUser(req.cookies["user_id"]),
     user: users[req.cookies["user_id"]] 
  };  
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("This shortURL does not exist.")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,
      URLuser: urlDatabase[req.params.shortURL].userID,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("This shortURL does not exist.")
  }
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_login", templateVars);
  }
})

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortenedURL = generateRandomString();
    urlDatabase[shortenedURL] = {
      longURL: req.body['longURL'],
      userID: req.cookies["user_id"]
    }
    res.redirect(`/urls/${shortenedURL}`);
  } else {
    res.status(401).send("You must be logged in to generate a shortURL");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"]) {
    if (req.params.shortURL in urlDatabase) {
      const userURLs = urlsForUser(req.cookies["user_id"]);
      if (req.params.shortURL in userURLs) {
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');  
      } else {
        res.status(401).send("You do not own this URL.");
      }
    } else {
      res.status(401).send("This URL does not exist.");
    }
  } else {
    res.status(401).send("You are not logged in.");
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["user_id"]) {
    if (req.params.id in urlDatabase) {
      const userURLs = urlsForUser(req.cookies["user_id"]);
      if (req.params.id in userURLs) {
        urlDatabase[req.params.id].longURL = req.body.newURL;
        res.redirect('/urls'); 
      } else {
        res.status(401).send("You do not own this URL.");
      }
    } else {
      res.status(401).send("This URL does not exist.");
    }
  } else {
    res.status(401).send("You are not logged in.");
  }
})

const ifUserExists = function (email) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
  return false;
}

app.post("/login", (req, res) => {
  let user = ifUserExists(req.body.email); 
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {  
      res.cookie("user_id", user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("Invalid password.");
    }
  } else {
    res.status(403).send("Invalid email address");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if (ifUserExists(req.body.email)) {
    res.status(400).send("This email address is not available.");
  } else if (!req.body.email) {
    res.status(400).send("Email address cannot be empty");
  } else if (!req.body.password) {
    res.status(400).send("Password is invalid.")
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }  
    res.cookie('user_id', userID)
    res.redirect('/urls')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

