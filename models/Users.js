const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create model
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    cart: {
        type: Array,
        default: []
    },
    verify: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('UserClient', userSchema)