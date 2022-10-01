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
            await newUser.save()
            console.log('[+][Create][Client][User] ID:', newUser._id.toString(), 'at', new Date())

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
        try {
            const { loginInfo, password, loginType } = req.body

            // No.1 - Check login type
            if (loginType === 1) {
                // Login with email
                // No.1-2 - Check email format
                if (loginInfo.indexOf('@') === -1) {
                    return res.status(400).json(
                        {
                            'msg': 'Failure',
                            'data': config['W-0006']
                        }
                    )
                }

                // No.1-3 - Check email on database
                const user = await Users.findOne({ email: loginInfo })
                if (!user) {
                    return res.status(400).json(
                        {
                            'msg': 'Failure',
                            'data': config['E-0002']
                        }
                    )
                }

                // No.1-4 - Check compare password
                const isMatch = bcrypt.compareSync(password, user.password, (err, result) => {
                    if (!err) {
                        return result
                    } else {
                        return res.status(400).json(
                            {
                                'msg': 'Failure',
                                'data': config['W-0007']
                            }
                        )
                    }
                })

                if (!isMatch) {
                    return res.status(400).json(
                        {
                            'msg': 'Failure',
                            'data': config['E-0003']
                        }
                    )
                }

                // Create access token and refresh token
                const accessToken = createAccessToken({ id: user._id })
                const refreshToken = createRefreshToken({ id: user._id })

                res.cookie('refreshtoken', refreshToken, {
                    httpOnly: true,
                    path: 'user/refresh_token'
                })

                res.json(
                    {
                        'msg': 'Success',
                        'data': {
                            'accessToken': accessToken,
                            'user': {
                                '_id': user._id,
                                'username': user.username,
                                'email': user.email,
                                'cart': user.cart,
                                'verify': user.verify
                            }
                        }
                    }
                )
                console.log('[#][Login][Client][User] ID:', user._id.toString(), 'at', new Date())
            } else {
                // Login with username
            }
        } catch (err) {
            return res.status(500).json(
                {
                    'msg': 'Failure',
                    'data': err.message
                }
            )
        }
    },

    /*
     *  Func: Logout user client
     *  Method: POST
     *  Params:
     *  Obj:
     *  Return: JSON { msg: String }
     */
    logout: async (req, res) => {
        try {
            const { id } = req.body
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })

            console.log('[#][Logout][Client][User] ID:', id.toString(), 'at', new Date())
            return res.json(
                {
                    'msg': 'Success',
                    'data': 'Logged out'
                }
            )
        } catch (err) {
            return res.status(500).json(
                {
                    'msg': 'Failure',
                    'data': err.message
                }
            )
        }
    },

    refreshToken: (req, res) => {
        try {
            const rfToken = req.cookies.refreshToken

            if (!rfToken) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['E-0001']
                    }
                )
            }

            jwt.verify(rfToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    return res.status(400).json(
                        {
                            'msg': 'Failure',
                            'data': config['E-0001']
                        }
                    )
                }

                const accessToken = createAccessToken({ id: user.id })

                res.json({ accessToken })
            })
        } catch (err) {
            return res.status(500).json(
                {
                    'msg': 'Failure',
                    'data': err.message
                }
            )
        }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' })
}

module.exports = userController
