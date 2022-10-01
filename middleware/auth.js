const jwt = require('jsonwebtoken')
const config = require('../config/config')

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')

        if (!token) {
            return res.status(400).json(
                {
                    'msg': 'Failure',
                    'data': config['W-0008']
                }
            )
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(400).json(
                    {
                        'msg': 'Failure',
                        'data': config['W-0008']
                    }
                )
            }

            req.user = user
            next()
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

module.exports = auth