const express = require('express')
const socketio = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = socketio(server)
const path = require('path')
const port = process.env.PORT || 8000
const publicDirectory = path.join(__dirname, '../public')
const Filter = require('bad-words')
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users')

app.use(express.static(publicDirectory))

io.on('connection', (socket) => {
  console.log('New WebSocket connection established');

  socket.on('join', (options, callbackMessage) => {
    const {error, user} = addUser({
      id: socket.id,
      ...options
    })

    if (error) {
      return callbackMessage(error)
    }

    socket.emit('message', generateMessage('Генади(Админчето)', `Здрасти ${user.username}, само без глупости :)`))
    socket.join(user.room)
    socket.broadcast.to(user.room).emit('message', generateMessage('Генади(Админчето)', `${user.username} влезна (можеше и без него) !`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callbackMessage()
  })

  socket.on('sendMessage', (payload, acknowledgment) => {
    const user = getUser(socket.id)
    const filter = new Filter();

    //Using socket io acknowledgment event
    if (filter.isProfane(payload.message)) {
      return acknowledgment('Bad boy')
    }

    io.to(user.room).emit('message', generateMessage(user.username, payload))

    acknowledgment('Message was delivered!')
  })

  socket.on('sendLocation', (payload, acknowledgment) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${payload.location.lat},${payload.location.long}`))

    acknowledgment('Location shared')
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Тоз пък ся за ко излезе ?', `${user.username} Has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})


server.listen(port, () => {
  console.log(`App listen on port: ${port}`);
})
