const users = []

// add User
const addUser = ({id, username, room}) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    }
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  //validate user name
  if (existingUser) {
    return {
      error: 'Username is in use!'
    }
  }

  //Store user
  const user = {id, username, room}

  users.push(user)

  return {user}
}

// remove User
const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id)

  if (~index) {
    return users.splice(index, 1)[0]
  }
}

// get User
// accpets the id of the user and returns user object if matched
const getUser = (id) => {
  return users.find(user => user.id === id)
}

// get Users in Room
//Accepts the room name and returns an array of users that are in that room
const getUsersInRoom = (room) => {
  room = room.toLowerCase().trim()
  return users.filter(user => user.room === room)
}

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser
}
