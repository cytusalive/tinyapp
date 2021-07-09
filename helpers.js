const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

const generateRandomString = function() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let string = '';
  const digits = 6;
  for (let i = 0; i < digits; i++) {
    string += chars[parseInt(chars.length * Math.random())];
  }
  return string;
}

const urlsForUser = function(id, database) {
  const userURLs = {};
  for (const URL in database) {
    if (database[URL].userID === id) {
      userURLs[URL] = database[URL];
    }
  }
  return userURLs;
}


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};