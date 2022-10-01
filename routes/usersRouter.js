const router = require('express').Router()
// const { route } = require('express/lib/router')
const userController = require('../controllers/userController')

// create user
router.post('/register', userController.register)

// login user
router.post('/login', userController.login)

// logout
router.post('/logout', userController.logout)

module.exports = router