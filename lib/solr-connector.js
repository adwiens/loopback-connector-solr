var assert = require('assert'),
     debug = require('debug')('loopback-connector-solr:solr-connector'),
      solr = require('solr-client'),
         _ = require('underscore');

var client;

function Solr() {}

Solr.search = function (query, callback) {
  assert.ok(callback, 'callback required');

  debug('performing search for query:', query);

  var solrQuery = client.createQuery();
  
  _.keys(query).forEach(function (k) {
    if (k === 'fq') return;
    if (typeof solrQuery[k] === 'function') {
      if (_.isArray(query[k])) {
        query[k].forEach(function (p) {
          debug('applying %s() with %s', k, query[k][p]);
          solrQuery[k](query[k][p]);
        });
      } else {
        debug('applying %s() with %s', k, query[k]);
        solrQuery[k](query[k]);
      }
    }
  });

  if (query.fq) {
    _.keys(query.fq).forEach(function (k) {
      if (_.isArray(query.fq[k])) {
        query.fq[k].forEach(function (p) {
          debug('applying matchFilter() with %s, %s', k, p);
          solrQuery.matchFilter(k, p);
        });
      } else {
        debug('applying matchFilter() with %s, %s', k, query.fq[k]);
        solrQuery.matchFilter(k, query.fq[k]);
      }
    });
  }
  
  client.search(solrQuery, callback);
};

Solr.add = function (documents, callback) {
  assert.ok(documents, 'nothing to add');

  client.add(documents, callback);
};

/* reverse engineered */
Solr.find = function (p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr find');
  console.log(p1); // filter (get /hrms)
  console.log(p2); // auth (get /hrms)
  console.log(p3); // callback (get /hrms)
};

/* reverse engineered */
Solr.replaceOrCreate = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr replaceOrCreate');
  console.log(p1); // data (put /hrms && post /hrms/replaceOrCreate)
  console.log(p2); // auth (put /hrms && post /hrms/replaceOrCreate)
  console.log(p3); // callback (put /hrms && post /hrms/replaceOrCreate)
};

/* reverse engineered */
Solr.upsert = Solr.updateOrCreate = Solr.patchOrCreate = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr upsert');
  console.log(p1); // data (patch /hrms)
  console.log(p2); // auth (patch /hrms)
  console.log(p3); // callback (patch /hrms)
};

/* reverse engineered */
Solr.findById = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr findById');
  console.log(p1); // id (patch /hrms/{id} && get /hrms/{id})
  console.log(p2); // ? empty (patch /hrms/{id}) || filter (get /hrms/{id})
  console.log(p3); // auth (patch /hrms/{id} && get /hrms/{id})
  console.log(p4); // callback (patch /hrms/{id} && get /hrms/{id})
};

/* reverse engineered */
Solr.create = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr create');
  console.log(p1); // data (post /hrms)
  console.log(p2); // auth (post /hrms)
  console.log(p3); // callback (post /hrms)
};

/* reverse engineered */
Solr.exists = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr exists');
  console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
  console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
  console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
};

/* reverse engineered */
Solr.replaceById = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr replaceById');
  console.log(p1); // id (put /hrms/{id} && post /hrms/{id}/replace)
  console.log(p2); // data (put /hrms/{id} && post /hrms/{id}/replace)
  console.log(p3); // auth (put /hrms/{id} && post /hrms/{id}/replace)
  console.log(p4); // callback (put /hrms/{id} && post /hrms/{id}/replace)
};

/* reverse engineered */
Solr.deleteById = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr deleteById');
  console.log(p1); // id (delete /hrms/{id})
  console.log(p2); // auth (delete /hrms/{id})
  console.log(p3); // callback (delete /hrms/{id})
};

/* reverse engineered */
Solr.count = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr count');
  console.log(p1); // where (get /hrms/count)
  console.log(p2); // auth (get /hrms/count)
  console.log(p3); // callback (get /hrms/count)
};

/* reverse engineered */
Solr.findOne = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr findOne');
  console.log(p1); // filter (get /hrms/findOne)
  console.log(p2); // auth (get /hrms/findOne)
  console.log(p3); // callback (get /hrms/findOne)
};

/* reverse engineered */
Solr.updateAll = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr updateAll');
  console.log(p1); // where (post /hrms/update)
  console.log(p2); // data (post /hrms/update)
  console.log(p3); // auth (post /hrms/update)
  console.log(p4); // callback (post /hrms/update)
};

/* reverse engineered */
Solr.upsertWithWhere = function(p1,p2,p3,p4,p5,p6,p7,p8) {
  console.log('Solr upsertWithWhere');
  console.log(p1); // where (post /hrms/upsertWithWhere)
  console.log(p2); // data (post /hrms/upsertWithWhere)
  console.log(p3); // auth (post /hrms/upsertWithWhere)
  console.log(p4); // callback (post /hrms/upsertWithWhere)
};

Solr.commit = function (callback) {
  client.commit(callback);
};

Solr.remove = function (id, callback) {
  assert.ok(id, 'id required');

  client.deleteByID(id, callback);
};

function SolrConnector(options) {
  if (!this instanceof SolrConnector)
    return new SolrConnector(options);

  options = options || {};

  console.log('made a new solrconnector', options.solr); //debug

  client = solr.createClient(options.solr);
  client.autoCommit = true;
}

exports.SolrConnector = SolrConnector;

exports.initialize = function (dataSource, callback) {
  var settings = dataSource.settings || {};

  var connector = new SolrConnector(settings);

  Solr.connector = connector;

  connector.DataAccessObject = Solr;

  dataSource.connector = connector;
  connector.dataSource = dataSource;

  for (var m in Solr.prototype) {
      var method = Solr.prototype[m];
      if ('function' === typeof method) {
          connector[m] = method.bind(connector);
          for(var k in method) {
              connector[m][k] = method[k];
          }
      }
  }

  callback();
};