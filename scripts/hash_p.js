const bcrypt = require('bcrypt');

const password = '1234'; // <- Cambia esto por la contraseña que desees
const saltRounds = 12;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log("Contraseña hasheada:", hash);
});
