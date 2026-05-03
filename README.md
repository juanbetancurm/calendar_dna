# Simple Google Calendar Meeting Scheduler

This project is a very simple and easy-to-understand solution for creating prefilled meetings in Google Calendar.

The idea is simple: a user opens the page, picks an available day and time, confirms the slot, and is redirected to a Google Calendar event that is already filled out. They only need to click **Save**, and Google Calendar sends you the invitation so you are aware of the meeting.

### Clone it, update your personal information (*name* and *email*) and availability, and publish it as a simple scheduling page without needing a backend.

_Usefulness:
It can work well for a student doing a *pasantia* who needs classmates, advisors, or supervisors to book short meetings. 
It can also be useful for someone working with a tutor on a final degree project, thesis, or research assignment, where regular follow-up meetings need to be scheduled quickly. 
It can help mentors, teachers, freelance professionals, or anyone who wants a lightweight page for sharing availability and receiving meeting requests through Google Calendar._



## How to use your own copy

1. Clone or download this project.
2. Open [app.js](/C:/proj/calendar/app.js).
3. Update your name and email in the `MY_NAME` and `MY_EMAIL` variables.
4. Adjust the available days and hours in the `AVAILABILITY` object.
5. If needed, update the timezone and visible text in [index.html](/C:/proj/calendar/index.html).
6. Open `index.html` in a browser or deploy the files as a static site (*GitHub Pages in 2 minutes*).

## How it works

1. The page displays available meeting slots.
2. The user clicks one available slot.
3. A confirmation modal opens.
4. The user confirms and is redirected to a prefilled Google Calendar event.
5. The user saves the event in Google Calendar.
6. Google Calendar sends you the invitation, which acts as the alert that a new meeting was created.

## Notes

- This is a lightweight front-end solution.
- It does not require a backend.
- It relies on Google Calendar’s event creation flow and invitation system.

## Next steps

In the next version, I will add a backend and a database to control already assigned dates, avoid duplicated bookings, and store other useful meeting data.
