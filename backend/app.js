const express = require('express')
const bodyParser = require('body-parser')

const chartsRouter = require('./routes/charts')
const notificationsRouter = require('./routes/notifications')
const userRouter = require('./routes/user')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json())
app.use('/charts', chartsRouter)
app.use('/notifications', notificationsRouter)
app.use('/user', userRouter)

module.exports = app
