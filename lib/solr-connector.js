"use strict";
exports.__esModule = true;
var Solr = /** @class */ (function () {
    function Solr() {
    }
    Solr.find = function (p1, p2, p3) {
        console.log('Solr find');
        console.log(p1); // filter (get /hrms)
        console.log(p2); // auth (get /hrms)
        console.log(p3); // callback (get /hrms)
        p3();
    };
    ;
    Solr.replaceOrCreate = function (p1, p2, p3) {
        console.log('Solr replaceOrCreate');
        console.log(p1); // data (put /hrms && post /hrms/replaceOrCreate)
        console.log(p2); // auth (put /hrms && post /hrms/replaceOrCreate)
        console.log(p3); // callback (put /hrms && post /hrms/replaceOrCreate)
        p3();
    };
    ;
    Solr.patchOrCreate = function (p1, p2, p3) {
        console.log('Solr upsert');
        console.log(p1); // data (patch /hrms)
        console.log(p2); // auth (patch /hrms)
        console.log(p3); // callback (patch /hrms)
        p3();
    };
    ;
    Solr.findById = function (p1, p2, p3, p4) {
        console.log('Solr findById');
        console.log(p1); // id (patch /hrms/{id} && get /hrms/{id})
        console.log(p2); // ? empty (patch /hrms/{id}) || filter (get /hrms/{id})
        console.log(p3); // auth (patch /hrms/{id} && get /hrms/{id})
        console.log(p4); // callback (patch /hrms/{id} && get /hrms/{id})
        p4();
    };
    ;
    Solr.create = function (p1, p2, p3) {
        console.log('Solr create');
        console.log(p1); // data (post /hrms)
        console.log(p2); // auth (post /hrms)
        console.log(p3); // callback (post /hrms)
        p3();
    };
    ;
    Solr.exists = function (p1, p2, p3) {
        console.log('Solr exists');
        console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
        console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
        console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
        p3();
    };
    ;
    Solr.replaceById = function (p1, p2, p3, p4) {
        console.log('Solr replaceById');
        console.log(p1); // id (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p2); // data (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p3); // auth (put /hrms/{id} && post /hrms/{id}/replace)
        console.log(p4); // callback (put /hrms/{id} && post /hrms/{id}/replace)
        p4();
    };
    ;
    Solr.deleteById = function (p1, p2, p3) {
        console.log('Solr deleteById');
        console.log(p1); // id (delete /hrms/{id})
        console.log(p2); // auth (delete /hrms/{id})
        console.log(p3); // callback (delete /hrms/{id})
        p3();
    };
    ;
    Solr.count = function (p1, p2, p3) {
        console.log('Solr count');
        console.log(p1); // where (get /hrms/count)
        console.log(p2); // auth (get /hrms/count)
        console.log(p3); // callback (get /hrms/count)
        p3();
    };
    ;
    Solr.findOne = function (p1, p2, p3) {
        console.log('Solr findOne');
        console.log(p1); // filter (get /hrms/findOne)
        console.log(p2); // auth (get /hrms/findOne)
        console.log(p3); // callback (get /hrms/findOne)
        p3();
    };
    ;
    Solr.updateAll = function (p1, p2, p3, p4) {
        console.log('Solr updateAll');
        console.log(p1); // where (post /hrms/update)
        console.log(p2); // data (post /hrms/update)
        console.log(p3); // auth (post /hrms/update)
        console.log(p4); // callback (post /hrms/update)
        p4();
    };
    ;
    Solr.upsertWithWhere = function (p1, p2, p3, p4) {
        console.log('Solr upsertWithWhere');
        console.log(p1); // where (post /hrms/upsertWithWhere)
        console.log(p2); // data (post /hrms/upsertWithWhere)
        console.log(p3); // auth (post /hrms/upsertWithWhere)
        console.log(p4); // callback (post /hrms/upsertWithWhere)
        p4();
    };
    ;
    Solr.upsert = Solr.patchOrCreate;
    Solr.updateOrCreate = Solr.patchOrCreate;
    return Solr;
}());
var SolrConnector = /** @class */ (function () {
    function SolrConnector(options) {
        console.log('Created solr connector with options ', options);
        // initialize solr-client here
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
