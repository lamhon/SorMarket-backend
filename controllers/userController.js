const Users = require('../models/Users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

const userController = {
    /***
    *   Func: Register client user
    *   Method: POST
    *   Params:
    *   obj: { username, password, confirmPassword, email }
    *   return: JSON { msg: string }
    */
    register: async (req, res) => {
        try {
            const { username, email, password, confirmPassword } = req.body

            // No.1-1 - Check duplicate email
            const checkMail = await Users.findOne({ email })
            if (checkMail) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0001']
                    }
                )
            }

            // No.1-2 - Check format email
            if (email.indexOf('@') === -1) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0006']
                    }
                )
            }

            // No.2-1 - Check duplicate username
            const checkUserName = await Users.findOne({ username })
            if (checkUserName) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0002']
                    }
                )
            }

            // No.2-2 - Check username has specific character(included '@' character)
            pattern = new RegExp(/[~`!#$%\^&@*+=\-\[\]\\';,/{}|\\":<>\?]/)
            if (pattern.test(username)) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0005']
                    }
                )
            }

            // No.3-1 - Check password length
            if (password.length < 8) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0003']
                    }
                )
            }

            // No.3-2 - Check password confirm
            if (confirmPassword !== password) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0004']
                    }
                )
            }

            // No.4 - Hash password
            const pwdHash = bcrypt.hashSync(password, 10)

            // No.5 - Create a new User
            const newUser = new Users({
                username, email, password: pwdHash
            })

            // No.6 - Save new user to mongodb
            // await newUser.save()
            console.log('+[Create][Client][User] ID:', newUser._id.toString(), 'at', new Date())

            return res.status(200).json(
                {
                    'msg': 'Success',
                    'data': {
                        '_id': newUser._id.toString(),
                        'email': email
                    }
                }
            )
        } catch (e) {
            return res.status(500).json(
                {
                    'msg': 'Failure',
                    'data': e.message
                }
            )
        }
    },

    /*
    *   Func: Login user client
    *   Method: POST
    *   Params:
    *   obj: { username, password, confirmPassword, email }
    *   return: JSON { msg: string }
    */
    login: async (req, res) => {

    }
}

module.exports = userController
