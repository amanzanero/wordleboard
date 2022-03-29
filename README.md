# WordleBoard

WordleBoard is a webapp I built that is a clone of Wordle, but lets users create leaderboards and see each others guesses each day (after you've finished the day's wordle).

This uses the same solution set so you can still play with others on the original site.

## Tech
This is a fullstack application I built using [gqlgen](https://github.com/99designs/gqlgen) on the backend, and React/Next.js on the front-end. I use a shared grapql schema to codegen queries for the front-end and resolvers for the back-end.

All this might be overkill, but I thought it would be fun to learn some code generation technologies :p

## Deployment

Front end lives on Vercel, and backend is hosted on Goople App Engine (both are super easy to deploy so I chose those).
