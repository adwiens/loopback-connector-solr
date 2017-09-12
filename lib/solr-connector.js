"use strict";
exports.__esModule = true;
var solr = require("solr-client");
var client;
var Query = /** @class */ (function () {
    function Query() {
    }
    // Adds query string to the query object based on filter.where
    // See http://yonik.com/solr/query-syntax/
    Query.addQueryString = function (filter, query) {
        var queryString = '';
        if (filter && filter.where) {
            for (var prop in filter.where) {
                queryString += '+' + prop + ':' + filter.where[prop] + ' ';
            }
        }
        else {
            queryString = '*:*';
        }
        query["q"] = queryString;
        return query;
    };
    // Adds start field to the query object based on filter.skip
    Query.addStart = function (filter, query) {
        if (filter && filter.skip) {
            query["start"] = filter.skip + '';
        }
        return query;
    };
    // Adds rows field to the query object based on filter.limit
    Query.addRows = function (filter, query) {
        if (filter && filter.limit) {
            query["rows"] = filter.limit + '';
        }
        return query;
    };
    // Callback for a Solr find
    Query.findCb = function (error, success, callback) {
        if (error) {
            callback(error, undefined);
        }
        else {
            callback(undefined, success.response.docs);
        }
    };
    // Callback for a Solr replaceOrCreate
    Query.replaceOrCreateCb = function (error, success, callback) {
        if (error) {
            callback(error, undefined);
        }
        else {
            client.commit(function (err, res) {
                if (err)
                    callback(err, undefined);
                if (res)
                    callback(undefined, res);
            });
        }
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
        client.add([doc], function (err, suc) { return Query.replaceOrCreateCb(err, suc, cb); });
    };
    Solr.findById = function (p1, p2, p3, p4) {
        console.log('Solr findById');
        console.log(p1); // id (patch /hrms/{id} && get /hrms/{id})
        console.log(p2); // ? empty (patch /hrms/{id}) || filter (get /hrms/{id})
        console.log(p3); // auth (patch /hrms/{id} && get /hrms/{id})
        console.log(p4); // callback (patch /hrms/{id} && get /hrms/{id})
        p4();
    };
    Solr.create = function (p1, p2, p3) {
        console.log('Solr create');
        console.log(p1); // data (post /hrms)
        console.log(p2); // auth (post /hrms)
        console.log(p3); // callback (post /hrms)
        p3();
    };
    Solr.exists = function (p1, p2, p3) {
        console.log('Solr exists');
        console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
        console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
        console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
        p3();
    };
    Solr.replaceById = function (p1, p2, p3, p4) {
        console.log('Solr replaceById');
        console.log(p1); // id (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p2); // data (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p3); // auth (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p4); // callback (put /hrms/{id} && post /hrms/{id}/replace)
        p4();
    };
    Solr.deleteById = function (p1, p2, p3) {
        console.log('Solr deleteById');
        console.log(p1); // id (delete /hrms/{id})
        console.log(p2); // auth (delete /hrms/{id})
        console.log(p3); // callback (delete /hrms/{id})
        p3();
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
