const express = require('express') // Import the express module
const path = require('path') // Import the path module
const parser = require('body-parser') // Import the body-parser module
const ejs = require('ejs') // Import the ejs module

const app = express() // Create an express application
app.use(parser.json()) // Use body-parser middleware to parse JSON bodies
app.use(parser.urlencoded()) // Use body-parser middleware to parse URL-encoded bodies
app.set('view engine', 'ejs') // Set the view engine to ejs
app.use(express.static('public')) // Serve static files from the 'public' directory
const PORT = 3000 // Define the port number

// Function to determine the list of attendees based on requirements and unwanted lists
const getAttendees = (attendeeList) => {
    // Helper function to recursively check if an attendee meets all requirements
    const helperFunc = (attendee, alreadySeen) => {
        // If the attendee's email is already in the 'alreadySeen' list, it indicates a circular dependency, so return true to avoid infinite recursion
        if (alreadySeen.includes(attendee.email)) {
            return true
        }

        // If the attendee has no requirements, they are considered valid, so return true
        if (!attendee.requirements) {
            return true;
        }

        // Check if all requirements of the attendee are met
        return attendee.requirements.every(required => {
            // Find the person who is required by the current attendee
            const requiredPerson = attendeeList.find(attendee => attendee.email === required)
            // Recursively check if the required person meets their own requirements
            return requiredPerson && helperFunc(requiredPerson, alreadySeen.concat(attendee.email))
        })
    }
    // Filter the attendee list to include only those who meet all requirements
    let initialAttendees = attendeeList.filter(attendee => helperFunc(attendee, []));

    let finalAttendees = [...initialAttendees]; // Create a copy to modify

    for (let i = 0; i < initialAttendees.length; i++) {
        const attendee = initialAttendees[i];

        for (let j = 0; j < attendee.unwanted?.length; j++) { // Use optional chaining in case unwanted is undefined
            const unwantedEmail = attendee.unwanted[j];
            const unwantedPerson = finalAttendees.find(a => a.email === unwantedEmail);

            if (unwantedPerson) {
                const index = finalAttendees.findIndex(a => a.email === attendee.email);
                if (index > -1) {
                    finalAttendees.splice(index, 1);
                }
                break; // Only remove the attendee once per unwanted person
            }
        }
    }

    return finalAttendees;
}

// Sample events data (can be replaced with a database)
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
let curID = 1 // Initialize the current ID for new events

// Define a route for the root path ('/')
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/createEvent.html')) // Send the createEvent.html file as the response
})

// Define a route to get all events
app.get('/all', (request, response) => {
    response.json(events) // Send the events data as a JSON response
})

// Define a route to get a specific event by ID
app.get('/:id', (request, response) => {
    const id = Number(request.params.id) // Extract the event ID from the request parameters
    const event = events.find(event => event.id === id) // Find the event with the matching ID
    if (new Date().toISOString().slice(0, 10) < event.date) { // Check if the current date is before the event date
        response.render('signup', { // Render the 'signup' view
            eventName: event.name, // Pass the event name to the view
            eventDate: event.date // Pass the event date to the view
        })
    } else {
        response.render('guestList', { // Render the 'guestList' view
            eventName: event.name, // Pass the event name to the view
            attendees: getAttendees(event.attendees) // Pass the filtered list of attendees to the view
        })
    }
})

// Define a route to create a new event
app.post('/', (request, response) => {
    if (request.body.eventName && request.body.eventDate) { // Check if the request body contains the event name and date
        const newEvent = { // Create a new event object
            name: request.body.eventName, // Set the event name from the request body
            date: request.body.eventDate, // Set the event date from the request body
            id: curID, // Set the event ID to the current ID
            attendees: [] // Initialize an empty array for attendees
        }
        events = events.concat(newEvent) // Add the new event to the events array
        curID += 1 // Increment the current ID for the next event
        response.redirect(`/${newEvent.id}`) // Redirect the user to the event page
    } else {
        response.status(400).end() // Send a 400 Bad Request status if the event name or date is missing
    }
})

// Define a route to sign up for an event
app.post('/:id', (request, response) => {
    const id = Number(request.params.id) // Extract the event ID from the request parameters
    if (request.body) { // Check if the request body is not empty
        let newPerson = { // Create a new person object
            name: request.body.personName, // Set the person's name from the request body
            email: request.body.personEmail, // Set the person's email from the request body
            requirements: [], // Initialize an empty array for requirements
            unwanted: [] // Initialize an empty array for unwanted people
        }
        if (request.body.required) { // Check if the request body contains required people
            request.body.required.forEach(requirement => { // Iterate over the required people
                if (requirement) { // Check if the required person is not empty
                    newPerson.requirements.push(requirement) // Add the required person to the requirements array
                }
            });
        }
        if (request.body.unwanted) { // Check if the request body contains unwanted people
            request.body.unwanted.forEach(unwantedPerson => { // Iterate over the unwanted people
                if (unwantedPerson) { // Check if the unwanted person is not empty
                    newPerson.unwanted.push(unwantedPerson) // Add the unwanted person to the unwanted array
                }
            });
        }
        events.find(event => event.id === id).attendees.push(newPerson) // Add the new person to the event's attendees array
        response.render('success', { message: "You're signed up!" }) // Render the 'success' view with a success message
    } else {
        response.status(400).end() // Send a 400 Bad Request status if the request body is empty
    }
})

// Start the express server
app.listen(PORT, () => {
    console.log(`Express running on port ${PORT}`) // Log a message to the console when the server is running
})