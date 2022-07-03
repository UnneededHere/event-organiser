const express = require('express')
const path = require('path')
const parser = require('body-parser')
const ejs = require('ejs')

const app = express()
app.use(parser.json())
app.use(parser.urlencoded())
app.set('view engine', 'ejs')
const PORT = 3000

const getAttendees = (attendeeList) => {
    const helperFunc = (attendee, alreadySeen) => {
        if (alreadySeen.includes(attendee.email) || !(attendee.requirements)) {
            return true
        } else {
            return attendee.requirements.every(required => {
                const requiredPerson = attendeeList.find(attendee => attendee.email === required)
                return requiredPerson && helperFunc(requiredPerson, alreadySeen.concat(attendee.email))
            })
        }
    }
    return attendeeList.filter(attendee => helperFunc(attendee, []))
}

let events = [
    {
        id: 0,
        name: "Return to University",
        date: "2022-01-10",
        attendees: [{
            name: "Kyle Scorgie",
            email: "krjs@outlook.com",
            requirements: ["zugsteyn@gmail.com", "oskarkhess@gmail.com"]
        }, {
            name: "Enoch Zugsteyn",
            email: "zugsteyn@gmail.com",
            requirements: ["krjs@outlook.com"]
        }]
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
    if (new Date().toISOString().slice(0, 10) < event.date) {
        response.render('signup', {
            eventName: event.name,
            eventDate: event.date
        })
    } else {
        response.render('guestList', {
            eventName: event.name,
            attendees: getAttendees(event.attendees)
        })
    }
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