
# JWT-tableau-broker

A little sample showing a ticket broker designed to be hosted on Tableau Server (so the IP to trsut is 127.0.0.1).
Can be useful in cloud env where all IP's are dynamic.

## USAGE

Generate a JWT (here valid for 1 year but you can tweak):

POST http://<tabIP>:3000/gimmeJWT

!!!!WARNING!!!!! OF COURSE YOU'LL HAVE TO REMOVE THIS ENDPOINT IN REAL LIFE :-)


Obtain  a ticket:
GET http://<tabIP>:3000/api/getTicket?username=<userName>
HEADERS MUST BE:
"Content-Type":"application/json"
"access-token":<JWT>

### INSTALL
Run the nodejs server:
- Install nodejs runtime
- Download the entire repo in zip or git clone

In the project folder, run the following:
- npm install

Run it with:
- node index.js

The server is running on port 3000 by default