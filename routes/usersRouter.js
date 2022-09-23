const router = require('express').Router()
// const { route } = require('express/lib/router')
const userController = require('../controllers/userController')

// create user
router.post('/register', userController.register)

module.exports = router