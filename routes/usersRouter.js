const router = require('express').Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

// create user
router.post('/register', userController.register)

// login user
router.post('/login', userController.login)

// refresh token
router.get('/refresh_token', userController.refreshToken)

module.exports = router