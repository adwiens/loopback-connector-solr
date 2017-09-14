"use strict";
exports.__esModule = true;
var solr = require("solr-client");
var _ = require("lodash");
var client;
var Query = /** @class */ (function () {
    function Query() {
    }
    // Adds query string to the query Object based on filter.where
    Query.addQueryString = function (filter, query, id) {
        var queryString = '';
        if (filter && filter.where) {
            for (var prop in filter.where)
                queryString += '+' + prop + ':' + filter.where[prop] + ' ';
            if (id)
                queryString += '+id:' + id;
        }
        else
            queryString = id ? ('+id:' + id) : '*:*';
        query["q"] = queryString;
        return query;
    };
    // Adds sort field to the query Object based on filter.order
    Query.addSort = function (filter, query) {
        if (filter && filter.order)
            query["sort"] = (filter.order instanceof Array) ? filter.order.join() : filter.order;
        return query;
    };
    // Returns whether all fields in the fields filter are set to false
    Query.allFalse = function (filter) {
        for (var fieldName in filter.fields)
            if (filter.fields[fieldName])
                return false;
        return true;
    };
    // Ensure filter.fields are always booleans
    Query.fieldsToBoolean = function (filter) {
        for (var fieldName in filter.fields)
            if (_.isString(filter.fields[fieldName]))
                filter.fields[fieldName] = JSON.parse(filter.fields[fieldName].toLowerCase());
        return filter;
    };
    // Adds field list to the query Object based on filter.fields
    Query.addFieldList = function (filter, query) {
        if (filter && filter.fields && !Query.allFalse(filter)) {
            var fl = [];
            for (var fieldName in filter.fields)
                if (filter.fields[fieldName])
                    fl.push(fieldName);
            query["fl"] = fl.join();
        }
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
    // Call if allFalse() to remove fields from one document based on filter.fields
    Query.removeFields = function (filter, doc) {
        if (filter && filter.fields)
            for (var fieldName in filter.fields)
                delete doc[fieldName];
        return doc;
    };
    // Callback for find
    Query.findCb = function (filter, error, success, callback) {
        if (error)
            callback(error, undefined);
        else {
            if (Query.allFalse(filter)) {
                success.response.docs.forEach(function (ele, i, arr) {
                    arr[i] = Query.removeFields(filter, ele);
                });
            }
            callback(undefined, success.response.docs);
        }
    };
    // Callback for exists
    Query.existsCb = function (error, success, callback) {
        if (error)
            callback(error, undefined);
        if (success)
            callback(undefined, success.response.numFound > 0);
    };
    // Callback for findOne
    Query.findOneCb = function (filter, error, success, callback) {
        if (error)
            callback(error, undefined);
        else if (success.response.docs && success.response.docs.length > 0)
            callback(undefined, Query.allFalse(filter) ? Query.removeFields(filter, success.response.docs[0]) : success.response.docs[0]); // post-processing to remove unwanted fields if allFalse() -- see http://loopback.io/doc/en/lb2/Fields-filter.html
        else
            callback(undefined, []);
    };
    return Query;
}());
var Solr = /** @class */ (function () {
    function Solr() {
    }
    // Called by "get /hrms"
    // See https://loopback.io/doc/en/lb3/Querying-data.html
    Solr.find = function (filter, auth, cb) {
        filter = Query.fieldsToBoolean(filter);
        var query = {};
        query = Query.addQueryString(filter, query);
        query = Query.addStart(filter, query);
        query = Query.addRows(filter, query);
        query = Query.addSort(filter, query);
        query = Query.addFieldList(filter, query);
        client.get('query', query, function (err, suc) { return Query.findCb(filter, err, suc, cb); });
    };
    // Called by "get /hrms/{id}"
    Solr.findById = function (id, filter, auth, cb) {
        filter = Query.fieldsToBoolean(filter);
        var query = {};
        query = Query.addQueryString(filter, query, id);
        query = Query.addStart(filter, query);
        query = Query.addRows(filter, query);
        query = Query.addSort(filter, query);
        query = Query.addFieldList(filter, query);
        client.get('query', query, function (err, suc) { return Query.findCb(filter, err, suc, cb); });
    };
    // Called by "head /hrms/{id}"
    Solr.exists = function (id, auth, cb) {
        var query = {};
        query = Query.addQueryString({}, query, id);
        client.get('query', query, function (err, suc) { return Query.existsCb(err, suc, cb); });
    };
    // Called by "get /hrms/findOne"
    Solr.findOne = function (filter, auth, cb) {
        filter = Query.fieldsToBoolean(filter);
        var query = {};
        query = Query.addQueryString(filter, query);
        query = Query.addStart(filter, query);
        query = Query.addRows(filter, query);
        query = Query.addSort(filter, query);
        query = Query.addFieldList(filter, query);
        client.get('query', query, function (err, suc) { return Query.findOneCb(filter, err, suc, cb); });
    };
    return Solr;
}());
var SolrConnector = /** @class */ (function () {
    function SolrConnector(options) {
        client = solr.createClient(/* no TS type for solr-client */ options.solr.host, options.solr.port, options.solr.core);
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
