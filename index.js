const express = require('express')
const path = require('path')
const parser = require('body-parser')
const ejs = require('ejs')

const app = express()
app.use(parser.json())
app.use(parser.urlencoded())
app.set('view engine', 'ejs')
const PORT = 3000

let events = [
    {
        id: 0,
        name: "Return to University",
        date: Date.parse("10-08-2022"),
        attendees: []
    }
]
let curID = 1

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/createEvent.html'))
})

app.get('/:id', (request, response) => {
    const id = Number(request.params.id)
    const event = events.find(event => event.id === id)
    response.render('signup', {
        eventName: event.name,
        eventDate: event.date
    })
})

app.post('/', (request, response) => {
    const newEvent = request.body
    if (newEvent.eventName && newEvent.eventDate) {
        newEvent.id = curID
        curID += 1
        newEvent.attendees = []
        events = events.concat(newEvent)
        response.redirect(`/${newEvent.id}`)
    } else {
        response.status(400)
    }
})

app.listen(PORT, () => {
    console.log(`Express running on port ${PORT}`)
})