# Server API

All API requests are made to ```[url]:8081/api/[route]```. An access token must be included in any request; see [Authorization](#authorization) above for information.

- [Importing](#importing)
- [Querying](#querying)
- [Updating](#updating)
- [Exporting](#exporting)


<a name="importing"></a>
## Importing

```
POST: [url]:8081/api/book-import
```

This route is used to import new books into the database.
The POST request must use either the "Tiltfactor" or "BHL" token, and the header ```Content-Type: application/json```. The data being sent must take the following JSON format:

```js
{
    "inputs": [
        {
            "items": [
                {
                    "barcode": ________,
                    "id": _____,
                    "pages": [
                        {
                            "differences": [
                                {
                                    "coords": [
                                        { "x": __, "y": __ },
                                        { "x": __, "y": __ },
                                        { "x": __, "y": __ },
                                        { "x": __, "y": __ }
                                    ],
                                    "id": _____,
                                    "texts": [___, ___]
                                },
                                ... /* more differences */
                            ],
                            "id": _____,
                            "url": _______________
                        },
                        ... /* more pages */
                    ]
                },
                ... /* more books */
            ]
        },
        ... /* more books */
    ]
}
```


<a name="querying"></a>
## Requesting

```
GET: [url]:8081/api/page
```

This route is used by the game to retrieve a random page from the database. Any access token may be used. The query parameter ```wordAmount``` may be specified to select a page with at least that many differences.


<a name="updating"></a>
## Updating

```
PUT: [url]:8081/api/difference
```

This route is used by the game to update the database with the new tags produced by the game. It must use the header ```Content-Type: application/json```. The data sent must be in the following JSON format:

```js
{
    "differences": [
        {
           "_id": _____,
           "text": ________
        },
        ...
    ]
}
```


<a name="exporting"></a>
## Exporting

```
GET: [url]:8081/api/export.zip
```

This route is used to export a copy of all collected data. The export returned is a .zip archive of files corresponding to individual pages, where each file has the following JSON format.

```js
{
    "items": [
        {
            "url": _______________,
            "id": _____,
            "barcode": ________,
            "bookid": _____,
            "pages": [
                {
                    "tag": {
                        "weight": ___,
                        "text": _____
                    },
                    "id": _____
                },
                ... /* more tags */
            ]
        }
    ]
}
```
