const fs = require('fs')

const notificationsStore = '/root/data/.notifications.json'

function deleteNotification(id) {
  const currentNotifications = readNotifications()

  const targetNotification = currentNotifications.find(n => n.id === id)
  if (!targetNotification) {
    throw new Error(`Notification does not exist [notificationId=${id}]`)
  }

  const finalNotifications = currentNotifications.filter(n => n.id !== id)
  const stringNotifications = JSON.stringify(finalNotifications)
  fs.writeFileSync(notificationsStore, stringNotifications)
}

function readNotifications() {
  if (fs.existsSync(notificationsStore)) {
    const rawFile = fs.readFileSync(notificationsStore)
    return JSON.parse(rawFile)
  }

  return []
}

function saveNotification(notification) {
  const currentNotifications = readNotifications()
  if (currentNotifications.find(n => n.id === notification.id)) {
    throw new Error(`Notification with the same id already exists [notificationId=${notification.id}]`)
  }

  currentNotifications.push(notification)

  const stringNotifications = JSON.stringify(currentNotifications.sort((a, b) => b.timestamp - a.timestamp))
  fs.writeFileSync(notificationsStore, stringNotifications)
}

function updateNotification(id, update) {
  const currentNotifications = readNotifications()

  const targetNotification = currentNotifications.find(n => n.id === id)
  if (!targetNotification) {
    throw new Error(`Notification does not exist [notificationId=${id}]`)
  }

  const updatedNotifications = currentNotifications.map(n => {
    if (n.id !== id) return n
    return Object.assign(n, update)
  })
  const stringNotifications = JSON.stringify(updatedNotifications)
  fs.writeFileSync(notificationsStore, stringNotifications)
}

module.exports = { deleteNotification, readNotifications, saveNotification, updateNotification }
