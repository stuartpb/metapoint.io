metapoint.io
============

This is the code powering http://metapoint.io

This readme notes what things are required to get the site running. It's not like this is supposed to be done by a wide range of people with no prior experience, so it's not going to give a step-by-step procedure. I'm assuming that I'm the one reading it, because something is going on and I don't remember what I'm supposed to do.

## Environment

metapoint.io uses the port, mongodb, and (eventually) facebook configuration variables from [envigor](https://github.com/stuartpb/envigor), as well as some app-specific variables:

### ADMINPATH

The secret path prefix to the administration console pages for tinkering with the database (approving/rejecting suggestions).

## Database

Metapoint started with a completely blank MongoDB database, and it can still run from one (although you might want to run the 'setup.js' script in the 'mongo' directory for `db.topics.ensureIndex({topic:1,scope:1},{unique:true})` if that's not already part of the database as you have it).

## Setup and deployment

Set the appropriate environment variables according to your deployment strategy. Set up your database by whatever combination of dump / export / import / restore and ./mongo/setup.js is appropriate for the current scenario.

Metapoint.io expects the deployment environment to handle HTTPS itself from the HTTP connection.
