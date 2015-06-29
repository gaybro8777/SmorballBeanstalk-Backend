# Database reference

This document provides a quick overview for working with the MongoDB database, including querying and backing up MongoDB databases. More detailed instructions may be found on the MongoDB website [here](http://docs.mongodb.org/manual/).

- [Terminology](#terms)
- [Queries](#queries)
- [Backups](#backups)
- [Deleting data](#deleting)


<a name="terms"></a>
## Terminology

If you have not worked with MongoDB or similar database systems before, you may find some of the terms unfamiliar.

- **document**: basic database object. Represented as a structure of field-value pairs.
- **collection**: set of similarly structured documents. Similar to a table in other database systems.
- **database**: set of collections. An instance of ```mongod``` may contain several databases. Most operations take place within the context of a single database.


<a name="queries"></a>
## Queries

MongoDB has a powerful query and aggregation system, of which a few basic functions will be covered here. It is highly recommended that you look through the full MongoDB documentation if you intend to work with MongoDB on a regular basis.

To get started, you should look at the collections you have to work with.
```mongo
> show dbs
BHLMaster   0.078GB
BHLTesting  0.078GB
admin       (empty)
local       0.078GB
test        (empty)

> use BHLTesting
switched to db BHLTesting

> show collections
books
differences
pages
system.indexes
tokens
```
To refer to any of these collections, use ```db.<collectionName>```.

<a name="find"></a>
### db.collection.find({query})

Returns all documents in the collection that match the query. If no query is specified, it will return all documents in the collection.

Some possible query formats:
```
Equality:
{ <key>: <value> }
Comparison (may use $gt, $gte, $lt, $lte)
{ <key>: {$gt: <value>} }
Contains:
{ <key>: {$in: [<value1>, <value2>, ...]} }
```
[Complete list of MongoDB query selectors](http://docs.mongodb.org/manual/reference/operator/query/#query-selectors)


### db.collection.count()

Returns the number of documents in the collection.


### db.collection.aggregate([stages])

For more complex operations, this is often the best function to use. It takes in a series of stages, each of which operates on the collection in turn to produce a new document. This document may be displayed to the screen or added to a collection. ```aggregate``` does not modify the source collection unless the output documents are explicitly added to that collection. To learn more, see MongoDB's [aggregation quick reference](http://docs.mongodb.org/manual/meta/aggregation-quick-reference/).


<a name="backups"></a>
## Backups

Creating and restoring from backups in MongoDB is fairly straightforward. For many use cases, the simple commands described below will be sufficient. If not, the full MongoDB documentation on backups is available [here](http://docs.mongodb.org/manual/tutorial/backup-with-mongodump/).


### Creating a backup

To create a backup, ```mongod``` must already be running.
By default, the ```mongodump``` command will dump the data as a directory of BSONs at ```./dump```. (This will have no effect on the live server, as it is effectively a _read_ operation.)

```bash
$ mongodump [(-o | --out) path/to/output/dir]
```

Unfortunately, the BSON output isn't easily readable. The best way to view the data is to restore it to a local database and query it from there.


### Restoring from a backup

When restoring a backup, ```mongod``` must be running as well. The restore command ```mongorestore``` takes a directory and imports into the currently running MongoDB database. If no directory is specified, ```mongorestore``` will look for a backup at ```./dump``` by default.

```bash
$ mongorestore [path/to/backup]
```

Restoring is an _insert_ operation; documents will not be overwritten by the process. For a truly clean restore, you may find it necessary to dump the collections first.

<a name="deleting"></a>
## Deleting data

As in any case when modifying or removing data, **be cautious**. MongoDB does not store earlier versions of your data internally, so consider backing up your database as described [above](#backups) before doing anything that could result in data loss.

### Deleting documents

Documents can be removed by querying a collection. Query syntax is described in the section on ```find()``` [above](#find).
```
db.collection.remove({query})
```

### Dropping a collection

Drops the specified collection and all of its documents.
```
db.collection.drop()
```

### Dropping a database

Drops the database currently being used, and all collections and documents within.
```
db.dropDatabase()
```
