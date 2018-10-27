# freckle-overtime

Node.js CLI tool for calculating overtime for [letsfreckle.com](https://letsfreckle.com/). 

**NOTE:** Currently does not support selecting a user. This tool will only be beneficial to you if you are the sole person making entries in your freckle sub-domain.

## How to use

To install:

    npm install freckle-overtime -g

To run the initial setup:
    
    freckle-overtime configure
    
To calculate overtime:

    freckle-overtime
    
For help:
  
    freckle-overtime -h

## Demo

[![asciicast](https://asciinema.org/a/ghFixFUHhyowESNuONxUNPTS3.png)](https://asciinema.org/a/ghFixFUHhyowESNuONxUNPTS3)

## FAQ

**Where do I get my Freckle API authentication token?**

- Log in to your Freckle sub-domain
- From the bar on the left select *Integrations & Apps*
- Click the *Freckle API* tab
- Click on the *Settings...* button next to *API v1 Token*
- Click on *click to reveal* to get the token
- Then copy/paste the token into the command line

**How does the overtime calculation work?**

- If there is at least one time entry on a work-day (default: Mon, Tue, Wed, Thu, Fri), we assume it is an actual work day
- If there is no time entry on a work-day, we assume it is a holiday or vacation. Might seem dangerous at first, but this makes using the tool a lot easier.
- If it is a work day then calculate overtime: `daily overtime = sum(all time entries for that day) - configured working hours per day`
- For non work-days (default: Sat, Sun) we do not subtract the configured working hours. Basically all time entries on such a day will be added to overtime. The calculation becomes: `daily overtime = sum(all time entries for that day)`

**How do I use overtime in the tool?**

Just work less than you are supposed to. If you are supposed to work 8 hours each day and you only make time entries for 6 hours, then 2 hours will be deducted from your overtime.

If you want to take **a full day off** then just add a time entry with zero hours.