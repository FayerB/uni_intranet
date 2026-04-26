const bcrypt = require('bcrypt');

bcrypt.hash('1111', 10).then(hash => {
  console.log(hash);
});
