## Installation
This project uses on NodeJS and MongoDB to create a OCR correction database/server.  
[Mongo install instructions](http://docs.mongodb.org/manual/installation/)  
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
> bhl-server@1.0.0 start /Users/<$USER>/BHL_Server
> node server.js

~/BHL_Server/routes/AToken.js
~/BHL_Server/routes/bookRoute.js
~/BHL_Server/routes/differenceRoute.js
~/BHL_Server/routes/pageRoute.js
Started on: 8081

```
By default the server is started on port 8081 and the endpoints are defined under:  
```
~/BHL_Server/routes/
```
You can modify settings in the config.js file.


All endpoints require a jwt token to function. To generate a token make sure you are in the BHL_Server directory:  
Valid token subjects are 'Tiltfactor', 'BHL', and 'Game'.
```[bash]
node tokenGen.js
```
And then follow the onscreen instructions.
Any pre-existing token will be replaced. 

Tokens can be included either as a query param under access_token or a header under x-access-token.
The token is the token field in the generated object.
``` [json]
{ 
  __v: 0,
  iat: 1432236887475,
  subject: 'Tiltfactor',
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUaWx0ZmFjdG9yIiwiaWF0IjoxNDMyMjM2ODg3NDc1LCJpc3MiOiJCSExTZXJ2ZXIifQ.opAZfrVHdNVo6PCzePBZKyVNuvPw_JnM7oRl1GUDk2Y',
  _id: 555e335728ad5e17321ac376 
}
```

# Persistance
PM2 is a production process manager for Node.js / io.js applications with a built-in load balancer. It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.
Run with [PM2](https://github.com/Unitech/pm2)
[PM2](https://github.com/Unitech/pm2)
``` [bash]
npm install pm2 -g
pm2 start server.js -i max
```

Going to: 
http://localhost:8081/   
http://[site-url]:8081/
Should print out "Hello did you get lost?" if it is working. 

