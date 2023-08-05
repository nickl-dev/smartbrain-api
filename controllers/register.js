const handleRegister = (request, response, database, bcrypt) => {
  const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const { name, email, password } = request.body;

  // Check if the name, email, and password have been entered
  if (!name || !email || !password) return response.status(400).json('Invalid form submission');
  
  // Check to make sure that the email address is valid
  if (!emailRegexp.test(email)) return response.status(400).json('Invalid email address');

  bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(password, salt, (error, hash) => {

        // Store hash in the login database
      database.transaction((trx) => {
        trx.insert({ hash, email })
          .into('login')
          .returning('email')
          .then((loginEmail) => {
            return trx('users')
              .returning('*')
              .insert({
                name,
                email: loginEmail[0].email,
                joined: new Date ()
              })
              .then((user) => response.json(user[0]))
          })
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .catch(() => response.status(400).json('Unable to register'))
    });
  });
}

module.exports = { handleRegister };