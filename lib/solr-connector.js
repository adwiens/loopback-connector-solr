"use strict";
exports.__esModule = true;
var solr = require("solr-client");
var uuid = require("uuid/v4");
var client;
var Query = /** @class */ (function () {
    function Query() {
    }
    // Adds query string to the query Object based on filter.where
    // See http://yonik.com/solr/query-syntax/
    Query.addQueryString = function (filter, query, id) {
        var queryString = '';
        if (filter && filter.where) {
            for (var prop in filter.where) {
                queryString += '+' + prop + ':' + filter.where[prop] + ' ';
            }
            if (id)
                queryString += '+id:' + id;
        }
        else {
            queryString = id ? ('+id:' + id) : '*:*';
        }
        query["q"] = queryString;
        return query;
    };
    // Adds start field to the query Object based on filter.skip
    Query.addStart = function (filter, query) {
        if (filter && filter.skip)
            query["start"] = filter.skip + '';
        return query;
    };
    // Adds rows field to the query Object based on filter.limit
    Query.addRows = function (filter, query) {
        if (filter && filter.limit)
            query["rows"] = filter.limit + '';
        return query;
    };
    // Callback for find
    Query.findCb = function (error, success, callback) {
        if (error)
            callback(error, undefined);
        else
            callback(undefined, success.response.docs);
    };
    // Callback for replaceOrCreate and replaceById
    Query.replaceCb = function (error, success, callback, doc) {
        if (error)
            callback(error, undefined);
        else {
            client.commit(function (err, res) {
                if (err)
                    callback(err, undefined);
                if (res)
                    callback(undefined, doc);
            });
        }
    };
    // Callback for exists
    Query.existsCb = function (error, success, callback) {
        if (error)
            callback(error, undefined);
        if (success)
            callback(undefined, success.response.numFound > 0);
    };
    return Query;
}());
var Solr = /** @class */ (function () {
    function Solr() {
    }
    // get /hrms
    // See https://loopback.io/doc/en/lb3/Querying-data.html
    Solr.find = function (filter, auth, cb) {
        var query = {};
        query = Query.addQueryString(filter, query);
        query = Query.addStart(filter, query);
        query = Query.addRows(filter, query);
        client.get('query', query, function (err, suc) { return Query.findCb(err, suc, cb); });
    };
    // put /hrms && post /hrms/replaceOrCreate
    Solr.replaceOrCreate = function (doc, auth, cb) {
        if (!doc["id"]) {
            doc["id"] = uuid();
            var query = {};
            query = Query.addQueryString({}, query, doc["id"]);
            client.get('query', query, function (err, suc) {
                if (err)
                    throw new Error("UUID collision check failed");
                if (suc && suc.response.numFound === 0)
                    client.add([doc], function (err, suc) { return Query.replaceCb(err, suc, cb, doc); });
                else
                    throw new Error("UUID collision check failed");
            });
        }
        else {
            client.add([doc], function (err, suc) { return Query.replaceCb(err, suc, cb, doc); });
        }
    };
    // get /hrms/{id}
    Solr.findById = function (id, filter, auth, cb) {
        var query = {};
        query = Query.addQueryString(filter, query, id);
        query = Query.addStart(filter, query);
        query = Query.addRows(filter, query);
        client.get('query', query, function (err, suc) { return Query.findCb(err, suc, cb); });
    };
    // head /hrms/{id}
    Solr.exists = function (id, auth, cb) {
        var query = {};
        query = Query.addQueryString({}, query, id);
        client.get('query', query, function (err, suc) { return Query.existsCb(err, suc, cb); });
    };
    // put /hrms/{id} && post /hrms/{id}/replace
    Solr.replaceById = function (id, newDoc, auth, cb) {
        var query = {};
        query = Query.addQueryString({}, query, id);
        client.get('query', query, function (err, suc) {
            if (err)
                cb(err, undefined);
            if (suc) {
                if (suc.response.numFound == 1) {
                    var origDoc = suc.response.docs[0];
                    for (var prop in origDoc) {
                        if (prop[0] == '_')
                            continue; /* skip Solr's built-in fields */
                        if (newDoc[prop] === undefined)
                            newDoc[prop] = origDoc[prop];
                    }
                    client.add([newDoc], function (err, suc) { return Query.replaceCb(err, suc, cb, newDoc); });
                }
                else if (suc.response.numFound > 1)
                    cb({
                        name: 'Found multiple documents with the same ID',
                        status: '',
                        message: 'More than one document shares this ID. This should not be possible.'
                    });
                else
                    cb({
                        name: 'ID does not exist',
                        status: '',
                        message: 'Cannot replace by ID because a document with the given ID does not exist in the database.'
                    });
            }
        });
    };
    // delete /hrms/{id}
    Solr.deleteById = function (id, auth, cb) {
        client.deleteByID(id, function (err, obj) {
            if (err)
                cb({
                    name: 'Could not delete by ID',
                    status: '',
                    message: JSON.stringify(err)
                });
            else
                cb(undefined);
        });
        // TODO: commit
    };
    Solr.count = function (p1, p2, p3) {
        console.log('Solr count');
        console.log(p1); // where (get /hrms/count)
        console.log(p2); // auth (get /hrms/count)
        console.log(p3); // callback (get /hrms/count)
        p3();
    };
    Solr.findOne = function (p1, p2, p3) {
        console.log('Solr findOne');
        console.log(p1); // filter (get /hrms/findOne)
        console.log(p2); // auth (get /hrms/findOne)
        console.log(p3); // callback (get /hrms/findOne)
        p3();
    };
    return Solr;
}());
var SolrConnector = /** @class */ (function () {
    function SolrConnector(options) {
        client = solr.createClient(options.solr.host, options.solr.port, options.solr.core);
    }
    return SolrConnector;
}());
exports.SolrConnector = SolrConnector;
function initialize(dataSource, callback) {
    var settings = dataSource.settings;
    var connector = new SolrConnector(settings);
    Solr.connector = connector;
    connector.DataAccessObject = Solr;
    dataSource.connector = connector;
    connector.dataSource = dataSource;
    callback();
}
exports.initialize = initialize;
