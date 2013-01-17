metapoint.io
============

This is the code powering http://metapoint.io

This readme notes what things are required to get the site running. It's not like this is supposed to be done by a wide range of people with no prior experience, so it's not going to give a step-by-step procedure. I'm assuming that I'm the one reading it, because something is going on and I don't remember what I'm supposed to do.

## Environment

Environment variables metapoint.io uses, and what happens without them. Note: all of these variables should be considered **secret** (except maybe PORT). Exposing their values could lead to all sorts of unfortunate access breaches. **Don't put them anywhere they'll be public-facing.**

### PORT

The HTTP port to bind to. If not set, will bind to 80.

* Bare node process: This is probably what you want. You'll need to figure out how to let Node bind to port 80 on your own (sudo works, but that's hacky).
* Heroku: PORT is always defined. I'm not sure how they handle apps that bind to something else.
* Nodejitsu: PORT isn't defined by default, but Nodejitsu magically works with any apps connecting to 80 (I think) or any port above 1024, so the unspecified PORT default case works fine.

### MONGODB_URL || MONGOLAB_URI || MONGOHQ_URL

The MongoDB connection URL for the database. If not set, will connect to 'default' on localhost.

* Bare node process: If you've set up mongod on 27017 just for metapoint, the default will be fine: otherwise, set it up differently and specify MONGODB_URL.
* Heroku: Adding a database with either the MongoLab addon will set MONGOLAB_URI to the connection URL; likewise for MongoHQ and MONGOHQ_URL. If both are specified, metapoint will use MongoLab. You could also configure either of those manually and outside Heroku's system, then set the appropriate environment variable (I would recommend setting MONGODB_URL, so if you do ever set up one of the addons, your can remove your manual setting separately).
* Nodejitsu: You can get the connection URL of any mongo database you create through `jitsu databases`: use `jitsu env set MONGODB_URL <the appropriate URL` after you've got the one you're going to use.

### ADMINPATH

The secret path prefix to the administration console pages for tinkering with the database (approving/rejecting suggestions).

### FACEBOOK_APP_ID, FACEBOOK_SECRET

The app ID and secret for Facebook's entry for this site (the Facebook developer can find it by going to the app's page from https://developers.facebook.com/apps ). Without them, Facebook authentication won't go.

* Bare node process: Set the app up on Facebook, copy the values into whatever environment variable setup you're running.
* Heroku: Heroku has this little thing you can do where you can create an app on Facebook that sets up a Heroku environment with these variables pre-defined, but I'd say it's only worth starting there if you're actually making a Facebook-centric app. Just set the two up separately then `heroku config:add` the values normally.
* Nodejitsu: Set the app up on Facebook, then `jitsu env set` as you will.

## Database

Metapoint started with a completely blank MongoDB database, and it can still run from one (although you might want to run the 'setup.js' script in the 'mongo' directory for `db.topics.ensureIndex({topic:1,scope:1},{unique:true})` if that's not already part of the database as you have it).

## Setup and deployment

Set the appropriate environment variables according to your deployment strategy. Set up your database by whatever combination of dump / export / import / restore and ./mongo/setup.js is appropriate for the current scenario.

Metapoint.io expects the deployment environment to handle HTTPS itself from the HTTP connection.