# Event Organiser
The basic premise of this web app is that oftentimes when considering whether or not to attend a particular function, you'd only want to go if certain other people were there too. Now you don't want to tell the organiser this - that would be rude - so you either have to agree to come and risk not enjoying the experience, or opt out and potentially miss a fun time.
This web app solves this problem by allowing you to privately specify your requirements for attending an event. It works like this:

 - The organiser of the event creates an event instance on the app
 - This generates a unique link which the organiser can share with their friends
 - When those friends go to sign up, they can choose to specify which people they would need to be there in order for them to want to go
 - When the date of the event arrives, navigating to the link will show a list of all the people who will attending, generated behind the scenes using each attendee's specifications
 - This way, uncertainty and social embarrassment can be avoided, and everyone can have a good time

An event is hard-coded into the app to offer an example - navigating to the link by default will produce an empty list, as Kyle wants Enoch and Oskar to be there, but only Enoch has signed up. Removing Kyle's requirement for Oskar will produce a list of Kyle and Enoch.
## Future Additions
Possibly to be added in the future:

 - [x] Styling
 - [x] The option to specify people you *don't* want to be there
 - [ ] The option to have the system email users upon sign-up and when the guest-list is generated
 - [ ] Integration with permanent database storage
