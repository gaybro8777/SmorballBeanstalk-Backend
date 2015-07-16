# Backend for Smorball & Beanstalk

This project uses Node.js and MongoDB to create a OCR correction database/server for use with the HTML5 games [Smorball](https://github.com/tiltfactor/smorball) and [Beanstalk](https://github.com/tiltfactor/beanstalk).


### Contents

- [Installation](#installation)
- [Persistence](#persistence)
- [More Documentation](#documentation)


<a name="installation"></a>
## Installation

First, you will need to install MongoDB and Node.js. Note that Node can be acquired through nvm or as a direct download. We recommend using nvm for ease of maintenance.
- [Installing MongoDB](http://docs.mongodb.org/manual/installation/)
- [Installing Node.js using nvm (recommended)](https://github.com/creationix/nvm)
- [Installing Node.js directly](https://nodejs.org/)

Clone the project to your system.

```bash
$ git clone https://github.com/tiltfactor/SmorballBeanstalk-Backend.git
```

Copy the example configuration file to config.js.

```bash
$ cd SmorballBeanstalk-Backend
$ cp config/config_EXAMPLE.js config/config.js
```
Now add a string to be used as the secret key on the line indicated. (An example of a good key would be a randomly-generated 32-character string.) This will be used to generate the tokens included in any requests to the database.

Next, install the Node.js dependencies.
```bash
$ npm install
```

Once those dependencies are installed, start MongoDB. You may specify a custom database location inline, or include it in a configuration file. More information about configuring MongoDB can be found [here](http://docs.mongodb.org/manual/reference/configuration-options/).

```bash
# specify database inline
$ mongod --dbpath path/to/db

# if you have created a MongoDB config file, run this instead
$ mongod --config path/to/config
```

Finally, start node. You should see the following output.

```bash
$ npm start

> bhl-server@1.0.0 start /.../SmorballBeanstalk-Backend
> node server.js

.../SmorballBeanstalk-Backend/routes/AToken.js
.../SmorballBeanstalk-Backend/routes/bookRoute.js
.../SmorballBeanstalk-Backend/routes/differenceRoute.js
.../SmorballBeanstalk-Backend/routes/pageRoute.js
Started on: 8081
```

By default the server is started on port 8081 and the endpoints are defined under ```~/SmorballBeanstalk-Backend/routes/```. You can modify settings in the config.js file.

To verify that the server is running, you can point your web browser to port 8081 of the server (in the case of a local server, copy ```localhost:8081``` into your address bar). You should get the message, "Hello did you get lost?"


<a name="authorization"></a>
### Authorization

All endpoints require a jwt token to function. To generate a token, run tokenGen.js:

```bash
$ cd SmorballBeanstalk-Backend
$ node tokenGen.js
:Subject
```

Enter a token when prompted by ":Subject". Valid token subjects are 'Tiltfactor', 'BHL', and 'Game'. Any pre-existing token will be replaced.

```
{ __v: 0,
  iat: 1432236887475,
  subject: 'Tiltfactor',
  token: <tokenstring>
  _id: 555e335728ad5e17321ac376 }
```

The token is the ```token``` field in the generated object. When making requests, tokens can be included either as a query param under ```access_token``` or a header under ```x-access-token```.


<a name="persistence"></a>
## Persistence

[PM2](https://github.com/Unitech/pm2) is a production process manager for Node.js / io.js applications with a built-in load balancer. It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.
The following commands will install PM2 globally (-g) and use it to run the Node.js server.

```bash
$ cd SmorballBeanstalk-Backend
$ npm install pm2 -g
$ pm2 start server.js -i max
```

<a name="documentation"></a>
## More documentation

- [Server API](docs/server_api.md)
- [Database reference](docs/database_ref.md)
