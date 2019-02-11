/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict'

const expect = require('chai').expect
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

const MONGODB_CONNECTION_STRING = process.env.DB
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
    app.route('/api/books')
        .get(function(req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books')
                    .find()
                    .toArray((err, docs) => {
                        const getDocs = docs.map(book => ({
                            _id: book._id,
                            title: book.title,
                            commentcount: book.comments.length,
                        }))

                        res.status(200).json(getDocs)
                        db.close()
                        return res
                    })
            })
        })

        .post(function(req, res) {
            const title = req.body.title

            if (title === '' || title === undefined) {
                return res
                    .status(400)
                    .type('text')
                    .send('no title provided')
            }

            const newBook = {
                title,
                comments: [],
            }

            //response will contain new book object including atleast _id and title
            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books').insertOne(newBook, (err, docs) => {
                    if (err) {
                        db.close()
                        return res
                            .status(400)
                            .type('text')
                            .send(`error adding book: ${err}`)
                    }

                    res.status(200).json(docs.ops[0])
                    db.close()
                    // return resc
                })
            })
        })

        .delete(function(req, res) {
            //if successful response will be 'complete delete successful'
            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books').remove({}, (err, docs) => {
                    if (err) {
                        db.close()
                        return res
                            .status(400)
                            .type('text')
                            .send(`error deleting books: ${err}`)
                    }

                    db.close()
                    res.status(200)
                        .type('text')
                        .send('complete delete successful')
                })
            })
        })

    app.route('/api/books/:id')
        .get(function(req, res) {
            const bookid = req.params.id

            try {
                ObjectId(bookid)
            } catch (err) {
                return res
                    .status(400)
                    .type('text')
                    .send("book doesn'\t exist in database")
            }

            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books').findOne(
                    { _id: ObjectId(bookid) },
                    (err, docs) => {
                        if (err) {
                            db.close()
                            return res
                                .status(400)
                                .type('text')
                                .send(`error searching for book: ${err}`)
                        }

                        if (docs !== null) {
                            res.status(200).json(docs)
                        } else {
                            res.status(400)
                                .type('text')
                                .send("book doesn'\t exist in database")
                        }

                        db.close()
                    }
                )
            })
        })

        .post(function(req, res) {
            const bookid = req.params.id
            const comment = req.body.comment
            //json res format same as .get

            try {
                ObjectId(bookid)
            } catch (err) {
                return res
                    .status(400)
                    .type('text')
                    .send("book doesn'\t exist in database")
            }

            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books').findOneAndUpdate(
                    { _id: ObjectId(bookid) },
                    {
                        $push: { comments: comment },
                    },
                    { returnOriginal: false },
                    (err, docs) => {
                        if (err) {
                            db.close()
                            return res
                                .status(400)
                                .type('text')
                                .send("book doesn'\t exist in database")
                        }

                        docs.lastErrorObject.updatedExisting === true
                            ? res.json(docs.value)
                            : res
                                  .status(400)
                                  .type('text')
                                  .send("book doesn'\t exist in database")

                        db.close()
                    }
                )
            })
        })

        .delete(function(req, res) {
            const bookid = req.params.id
            //if successful response will be 'delete successful'

            try {
                ObjectId(bookid)
            } catch (err) {
                return res
                    .status(400)
                    .type('text')
                    .send("book doesn'\t exist in database")
            }

            MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
                db.collection('books').remove(
                    { _id, ObjectId: bookid },
                    (err, docs) => {
                        if (err) {
                            db.close()
                            return res
                                .status(400)
                                .type('text')
                                .send(`error deleting book: ${err}`)
                        }

                        if (docs.result.ok) {
                            res.status(200).json('delete successful')
                        }
                        db.close()
                        return res
                    }
                )
            })
        })
}
