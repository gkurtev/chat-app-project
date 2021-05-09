const socket = io()

//Elements
const form = document.querySelector('.js-message-form')
const formInputField = form.querySelector('.js-message-input')
const formButton = form.querySelector('button')
const sendLocationBtn = document.querySelector('.js-send-location')
const $messages = document.querySelector('.js-messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
let {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
room = 'room-' + room

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild


  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


  //Visible Height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight


  // How far have I scrolled
  // scrolltop gives the ammount of distance we scrolled from the top
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('locationMessage', (location) => {
  const html = Mustache.render($locationMessageTemplate, {
    username: location.username,
    locationUrl: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('message', (message) => {

  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})


form.addEventListener('submit', function (e) {
  e.preventDefault()
  //disable
  formButton.setAttribute('disabled', 'disabled')

  const thisForm = this
  const formData = new FormData(thisForm)
  const formEntries = Object.fromEntries(formData);

  socket.emit('sendMessage', formEntries.message, (message) => {
    //enable
    formButton.removeAttribute('disabled')
    formInputField.value = ''
    formInputField.focus()
  })
})

sendLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Your browser is too old granny')
  }

  sendLocationBtn.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      location: {
        lat: position.coords.latitude,
        long: position.coords.longitude
      }
    }

    socket.emit('sendLocation', location, (message) => {
      sendLocationBtn.removeAttribute('disabled')
    })
  })
})

socket.emit('join', {username, room}, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render($sideBarTemplate, {
    room,
    users
  })

  $sidebar.innerHTML = html
})
