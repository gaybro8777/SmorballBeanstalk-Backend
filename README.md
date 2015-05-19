## Installation
This project uses on NodeJS and MongoDB to create a OCR correction database/server.  
[Mongo install instructions](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)  
[NodeJS install instructions](https://github.com/creationix/nvm)  
Once those two dependencies are installed, start Mongo.
``` [bash]
mongod
```
``` [bash]
git clone https://github.com/jesusrmoreno/BHLREWRITE.git BHL_Server
cd BHL_Server
npm install
npm start
```
Which will output:
``` [bash]
> bhl-server@1.0.0 start /Users/jesus/BHL_Server
> node server.js

~/BHL_Server/routes/AToken.js
~/BHL_Server/routes/bookRoute.js
~/BHL_Server/routes/differenceRoute.js
~/BHL_Server/routes/pageRoute.js
Started on: 8081
```
By default the server is started on port 8081 and the endpoints are defined under:  
`~/BHL_Server/routes/`

Some endpoints require a jwt token to function. To generate a token:  
```[bash]
node tokenGen.js
```

And then follow the onscreen instructions.
Valid token subjects are 'Tiltfactor', 'BHL', and 'Game'.

## End Points
.... to be written
