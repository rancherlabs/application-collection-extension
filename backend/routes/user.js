var express = require('express')
const { getAuth, login, logout } = require('../clients/helm')
var router = express.Router()

router.get('/auth', function (req, res) {
  try {
    const auth = getAuth()
    if (auth) {
      res.json(auth)
    } else {
      res.status(404)
    }
  } catch (err) {
    console.error('Unexpected error getting user auth', err)
    res.status(500)
  }
      
  res.end()
})

router.post('/login', function(req, res) {
  const { username, password } = req.body
  login(username, password)
    .then(() => res.status(200).end()) 
    .catch(err => {
      console.error('Unexpected error login user', err)
      res.status(500).end()
    })
})

router.post('/logout', function(req, res) {
  logout()
    .then(() => res.status(200).end()) 
    .catch(err => {
      console.error('Unexpected error logout user', err)
      res.status(500).end()
    })
})

module.exports = router