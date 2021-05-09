const socket = io()

const $selectHolder = document.querySelector('#select-holder')
const $loginRoom = document.querySelector('.js-login-room')
//Templates
const $chatRoomsTemplate = document.querySelector('#chat-rooms-template').innerHTML

socket.on('allRooms', (roomsArray) => {

  if (roomsArray.length > 0) {
    roomsArray = roomsArray.map(room => ({
      value: room,
      name: room.replace('-', ' ')
    }))

    const html = Mustache.render($chatRoomsTemplate, {
      rooms: roomsArray
    })

    $selectHolder.insertAdjacentHTML('beforeend', html)

    roomsSelect()
  }
})

const roomsSelect = () => {
  document.querySelector('.js-rooms-selector').addEventListener('change', function () {
    $loginRoom.value = this.value
    $selectHolder.style.display = 'none'
  })
}

