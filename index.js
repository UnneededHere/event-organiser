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
        date: "2022-09-10",
        attendees: []
    }
]
let curID = 1

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/createEvent.html'))
})

app.get('/all', (request, response) => {
    response.json(events)
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
    if (request.body.eventName && request.body.eventDate) {
        const newEvent = {
            name: request.body.eventName,
            date: request.body.eventDate,
            id: curID,
            attendees: []
        }
        events = events.concat(newEvent)
        response.redirect(`/${newEvent.id}`)
    } else {
        response.status(400).end()
    }
})

app.post('/:id', (request, response) => {
    const id = Number(request.params.id)
    if (request.body) {
        console.log(request.body)
        let newPerson = {
            name: request.body.personName,
            email: request.body.personEmail,
            requirements: []
        }
        request.body.required.forEach(requirement => {
            if (requirement) {
                newPerson.requirements.push(requirement)
            }
        });
        events.find(event => event.id === id).attendees.push(newPerson)
        response.send("<p>You're signed up!</p>")
    } else {
        response.status(400).end()
    }
})

app.listen(PORT, () => {
    console.log(`Express running on port ${PORT}`)
})