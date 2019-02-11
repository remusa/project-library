/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

chai.use(chaiHttp)

let id

suite('Functional Tests', function() {
    /*
     * ----[EXAMPLE TEST]----
     * Each test should completely test the response of the API end-point including response status code!
     */
    test('#example Test GET /api/books', function(done) {
        chai.request(server)
            .get('/api/books')
            .end(function(err, res) {
                assert.equal(res.status, 200)

                assert.isArray(res.body, 'response should be an array')

                assert.property(
                    res.body[0],
                    'commentcount',
                    'Books in array should contain commentcount'
                )
                assert.property(
                    res.body[0],
                    'title',
                    'Books in array should contain title'
                )
                assert.property(
                    res.body[0],
                    '_id',
                    'Books in array should contain _id'
                )

                done()
            })
    })
    /*
     * ----[END of EXAMPLE TEST]----
     */

    suite('Routing tests', function() {
        suite(
            'POST /api/books with title => create book object/expect book object',
            function() {
                test('Test POST /api/books with title', function(done) {
                    chai.request(server)
                        .post('/api/books')
                        .send({
                            title: 'My test title',
                        })
                        .end((err, res) => {
                            assert.equal(res.status, 200)
                            assert.isObject(
                                res.body,
                                'response should be an object'
                            )
                            assert.property(
                                res.body,
                                '_id',
                                'book should contain _id'
                            )
                            assert.property(
                                res.body,
                                'title',
                                'book should contain title'
                            )
                            assert.isArray(
                                res.body.comments,
                                'comments property is an array'
                            )
                            assert.equal(res.body.title, 'My test title')
                            id = res.body._id
                            done()
                        })
                })

                test('Test POST /api/books with no title given', function(done) {
                    chai.request(server)
                        .post('/api/books')
                        .send({
                            title: '',
                        })
                        .end((err, res) => {
                            assert.equal(res.status, 400)
                            assert.equal(res.text, 'no title provided')
                            done()
                        })
                })
            }
        )

        suite('GET /api/books => array of books', function() {
            test('Test GET /api/books', function(done) {
                chai.request(server)
                    .get('/api/books')
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.isArray(res.body, 'response should be an array')
                        assert.property(
                            res.body[0],
                            '_id',
                            'books in array should contain _id'
                        )
                        assert.property(
                            res.body[0],
                            'title',
                            'books in array should contain title'
                        )
                        assert.property(
                            res.body[0],
                            'commentcount',
                            'books in array should commentcount'
                        )
                        done()
                    })
            })
        })

        suite('GET /api/books/[id] => book object with [id]', function() {
            test('Test GET /api/books/[id] with id not in db', function(done) {
                chai.request(server)
                    .get('/api/books/:id')
                    .query({ _id: 666 })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert.equal(
                            res.text,
                            "book doesn'\t exist in database"
                        )
                        done()
                    })
            })

            test('Test GET /api/books/[id] with valid id in db', function(done) {
                chai.request(server)
                    .get(`api/books/${id}`)
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.isObject(
                            res.body,
                            'response should be an object'
                        )
                        assert.property(
                            res.body,
                            '_id',
                            'book should contain _id'
                        )
                        assert.property(
                            res.body,
                            'title',
                            'book should contain title'
                        )
                        assert.property(
                            res.body,
                            'comments',
                            'book should contain comments'
                        )
                        assert.equal(res.body_id, id)
                        done()
                    })
            })
        })

        suite(
            'POST /api/books/[id] => add comment/expect book object with id',
            function() {
                test('Test POST /api/books/[id] with comment', function(done) {
                    chai.request(server)
                        // .post(`api/books/${id}`)
                        .post(`api/books/5c5f26fa87ecdb1ae0f39788`)
                        .send({
                            comment: 'a test comment',
                        })
                        .end((err, res) => {
                            assert.equal(res.status, 200)
                            assert.property(
                                res.body,
                                '_id',
                                'book should contain _id'
                            )
                            assert.property(
                                res.body,
                                'title',
                                'book should contain title'
                            )
                            assert.property(
                                res.body,
                                'comments',
                                'book should contain comments array'
                            )
                            // assert.equal(res.body._id, id)
                            assert.equal(
                                res.body._id,
                                '5c5f26fa87ecdb1ae0f39788'
                            )
                            assert.equal(res.body.title, 'My test title')
                            assert.equal(res.body.comment, 'a test comment')
                            done()
                        })
                })
            }
        )
    })
})
