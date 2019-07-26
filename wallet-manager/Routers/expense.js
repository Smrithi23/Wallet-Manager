const express = require('express')
const router = new express.Router()
const Expense = require('../models/expense')
const auth = require('../middleware/auth')
const Cookies = require('cookies')

router.post('/expenses', auth, async (req, res) => {
    const expense = new Expense({
        ...req.body,
        owner: req.user._id
    })

    try {
        await expense.save()
        await req.user.populate('expenses').execPopulate()
        const user = req.user
        res.status(201).redirect('/users')
    } catch(e) {
        const message = "Expense must be a number"
        res.status(400).render('addexpense', {message})
    }
})


router.get('/expenses/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const expense = await Expense.findOne({_id, owner: req.user._id})

        if(!expense) {
            return res.status(404).send()
        }
        const user = req.user
        res.render('UpdateExpense',{expense, user})

    } catch(e) {
        const message = "Expense must be a number"
        res.status(400).render('UpdateExpense', {message})
    }
})

router.post('/expenses/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'paid', 'title', 'cost']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(404).send({error: 'Invalid updates!'})
    }
    try {
        const expense = await Expense.findOne({ _id: req.params.id, owner: req.user._id})
        
        if(!expense) {
            return res.status(404).send()
        }
        updates.forEach((update) => expense[update] = req.body[update])
        await expense.save()
        res.render('UpdateExpense', {expense})

    } catch(e) {
        const message = "Expense must be a number"
        const expense = await Expense.findOne({ _id: req.params.id, owner: req.user._id})
        res.status(400).render('UpdateExpense', {expense, message})
    }
})

router.post('/expense/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!expense) {
            res.status(404).send()
        }
        res.redirect('/users/delete')

    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/delete', auth, async (req,res) => {
    const message = "Deleted"
    const user = req.user
    res.render('delete', {message, user})
})

module.exports = router