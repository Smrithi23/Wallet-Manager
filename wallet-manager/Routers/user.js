const express = require('express')
const router = new express.Router()
const path = require('path')
const User = require('../models/user')
const auth = require('../middleware/auth')
const hbs = require('hbs')
const Cookies = require('cookies')

router.use(express.urlencoded())
// Register
router.post('/users', async (req, res) => {

    try {
        console.log(req.body)
        const user = new User(req.body)
        console.log(user)
        await user.save()
        console.log('hi')
        const token = await user.generateAuthToken()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(201).redirect('/users')
    } catch (e) {
        var register = " "
        var email = " "
        var password = " "
        if(e.code === 11000)
        {
            register = "Already Registered"
        }
        else{
        if(e.errors.password)
        {
            password = "Password must contain atleast 7 characters"
        }
        if(e.errors.email)
        {
            email = "Email is invalid"
        }
        }
        res.status(400).render('index', { register, email, password })
    }
})
//Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(200).redirect('/users')
    } catch (e) {
        const loginerror = "Incorrect email or password"
        res.status(400).render('index', { loginerror })
    }
})
//Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.render('index')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.render('index')

    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/addexpense', auth, async (req, res) => {
    try {
        const user = req.user
        res.render('addexpense', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users', auth, async (req, res) => {
    try {
        const user = req.user
        await user.populate('expenses').execPopulate()
        var total = 0
        for (var i = 0; i < req.user.expenses.length; i++) {
            total = total + req.user.expenses[i].cost
        }
        res.render('home', { user, total })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/me', auth, async (req, res) => {

    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'password']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid Operation' })
        }
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        const user = req.user
        res.status(400).render('changeProfile', { e, user })

    }
})

module.exports = router