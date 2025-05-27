const express = require('express')
const { readNotifications, saveNotification, deleteNotification, updateNotification } = require('../clients/notifications')
var router = express.Router()

router.delete('/:id', function (req, res) {
  const { id } = req.params
  try {
    deleteNotification(id)
    res.status(200)
  } catch (err) {
    console.error('Unexpected error deleting notification [notificationId=' + id + ']', err)
    res.status(500)
  }

  res.end()
})

router.get('/', function (req, res) {
  try {
    const notifications = readNotifications()
    res.json(notifications.sort((a, b) => b.timestamp - a.timestamp))
  } catch (err) {
    console.error('Unexpected error getting user notifications', err)
    res.status(500)
  }

  res.end()
})

router.post('/', function (req, res) {
  try {
    const notification = req.body
    saveNotification(notification)
    res.status(200)
  } catch (err) {
    console.error('Unexpected error saving notification', err)
    res.status(500)
  }

  res.end()
})

router.put('/:id', function (req, res) {
  const { id } = req.params
  try {
    const update = req.body
    updateNotification(id, update)
    res.status(200)
  } catch (err) {
    console.error('Unexpected error updating notification [notificationId=' + id + ']', err)
    res.status(500)
  }

  res.end()
})

module.exports = router
