if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

var fs = require('fs');

function readLines(input, func) {
  var remaining = '';

  input.on('data', function (data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function () {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

let x = 0;
let aa, bb, cc, dd;

function func(data) {
  //console.log('Line: ' + data);
  
  if(x==0)
    aa=data.toString();
  if(x==1)
    bb=data.toString();
  if(x==2)
    cc=data.toString();
  if(x==3)
    dd=data.toString();

  x++;

  if (x == 4) {
    users.push({
      id: aa,
      name: bb,
      email: cc,
      password: dd
    })

    x=0;

      // console.log('0 :: ' + aa);
      // console.log('1 :: ' + bb);
      // console.log('2 :: ' + cc);
      // console.log('3 :: ' + dd);
  }

}

var input = fs.createReadStream('file.txt');
readLines(input, func);

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })

    // for (i in users) {

    let i = users.length - 1;
    fs.appendFile('file.txt', users[i].id + '\n' + users[i].name + '\n' + users[i].email + '\n' + users[i].password + '\n', (err) => {
      if (err) throw err;
      console.log('The file was updated!');
    });

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)