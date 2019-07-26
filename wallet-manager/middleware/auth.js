const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Cookies = require('cookies')

const auth = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ','')
        var cookies = new Cookies(req, res)
        const token = cookies.get('token')
        const decoded = jwt.verify(token, 'thisismynewcourse')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token':token })
        
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch(e) {
        const message = "Please Login"
        res.status(401).render('index',{message})
    }
}

module.exports = auth