import * as solr from 'solr-client';
import * as uuid from 'uuid/v4';
import * as _ from 'lodash';

var client: any;

interface FindFilter {
  fields?: Object;     /* addFieldList and removeFields */
  include?: any;    /* Not supported */
  limit?: number;   /* addRows */
  order?: string | Array<string>;   /* addSort */
  skip?: number;    /* addStart */
  where?: Object;   /* addQueryString; currently only equivalence is supported (see http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods) */
}

interface SolrGetSuccess {
  response: {
    numFound: number;
    docs: Array<Object>;
  }
}

interface SolrConnectorOptions {
  name: string;
  connector: string;
  solr: {
    host: string;
    port: number;
    core: string;
  };
  debug: boolean;
}

interface SolrDataSource {
  settings: SolrConnectorOptions;
  connector: SolrConnector;
}

class Query {
  // Adds query string to the query Object based on filter.where
  static addQueryString(filter: FindFilter, query: Object, id?: string): Object {
    let queryString = '';
    if (filter && filter.where) {
      for (var prop in filter.where)
        queryString += '+' + prop + ':' + filter.where[prop] + ' ';
      if (id) queryString += '+id:' + id;
    }
    else queryString = id ? ('+id:' + id) : '*:*';
    query["q"] = queryString;
    return query;
  }

  // Adds sort field to the query Object based on filter.order
  static addSort(filter: FindFilter, query: Object): Object {
    if (filter && filter.order)
      query["sort"] = (filter.order instanceof Array) ? filter.order.join() : filter.order;
    return query;
  }

  // Returns whether all fields in the fields filter are set to false
  static allFalse(filter: FindFilter): boolean {
    for (var fieldName in filter.fields)
      if (filter.fields[fieldName]) return false;
    return true;
  }

  // Ensure filter.fields are always booleans
  static fieldsToBoolean(filter: FindFilter): FindFilter {
    for (var fieldName in filter.fields)
      if (_.isString(filter.fields[fieldName]))
        filter.fields[fieldName] = JSON.parse(filter.fields[fieldName].toLowerCase());
    return filter;
  }

  // Adds field list to the query Object based on filter.fields
  static addFieldList(filter: FindFilter, query: Object): Object {
    if (filter && filter.fields && !Query.allFalse(filter)) {
      let fl = [];
      for (var fieldName in filter.fields)
        if (filter.fields[fieldName]) fl.push(fieldName);
      query["fl"] = fl.join();
    }
    return query;
  }

  // Adds start field to the query Object based on filter.skip
  static addStart(filter: FindFilter, query: Object): Object {
    if (filter && filter.skip) query["start"] = filter.skip + '';
    return query;
  }

  // Adds rows field to the query Object based on filter.limit
  static addRows(filter: FindFilter, query: Object): Object {
    if (filter && filter.limit) query["rows"] = filter.limit + '';
    return query;
  }

  // Call if allFalse() to remove fields from one document based on filter.fields
  static removeFields(filter: FindFilter, doc: Object): Object {
    if (filter && filter.fields)
      for (var fieldName in filter.fields)
        delete doc[fieldName];
    return doc;
  }

  // Callback for find
  static findCb(filter: FindFilter, error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    else {
      if (Query.allFalse(filter)) { // post-processing to remove unwanted fields if allFalse() -- see http://loopback.io/doc/en/lb2/Fields-filter.html
        success.response.docs.forEach((ele, i, arr) => {
          arr[i] = Query.removeFields(filter, ele);
        });
      }
      callback(undefined, success.response.docs);
    }
  }

  // Callback for exists
  static existsCb(error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    if (success) callback(undefined, success.response.numFound > 0);
  }
  
  // Callback for findOne
  static findOneCb(filter: FindFilter, error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    else if (success.response.docs && success.response.docs.length > 0)
      callback(undefined, Query.allFalse(filter) ? Query.removeFields(filter, success.response.docs[0]) : success.response.docs[0]); // post-processing to remove unwanted fields if allFalse() -- see http://loopback.io/doc/en/lb2/Fields-filter.html
    else callback(undefined, []);
  }
}

class Solr {
  static connector: SolrConnector;

  // Called by "get /hrms"
  // See https://loopback.io/doc/en/lb3/Querying-data.html
  static find(filter: FindFilter, auth: Object, cb: Function) {
    filter = Query.fieldsToBoolean(filter);
    let query = {};
    query = Query.addQueryString(filter, query);
    query = Query.addStart(filter, query);
    query = Query.addRows(filter, query);
    query = Query.addSort(filter, query);
    query = Query.addFieldList(filter, query);
    client.get('query', query, (err, suc) => Query.findCb(filter, err, suc, cb));
  }

  // Called by "get /hrms/{id}"
  static findById(id: string, filter: FindFilter, auth: Object, cb: Function) {
    filter = Query.fieldsToBoolean(filter);
    let query = {};
    query = Query.addQueryString(filter, query, id);
    query = Query.addStart(filter, query);
    query = Query.addRows(filter, query);
    query = Query.addSort(filter, query);
    query = Query.addFieldList(filter, query);
    client.get('query', query, (err, suc) => Query.findCb(filter, err, suc, cb));
  }

  // Called by "head /hrms/{id}"
  static exists(id: string, auth: Object, cb: Function) {
    let query = {};
    query = Query.addQueryString({}, query, id);
    client.get('query', query, (err, suc) => Query.existsCb(err, suc, cb));
  }

  // Called by "get /hrms/findOne"
  static findOne(filter: FindFilter, auth: Object, cb: Function) {
    filter = Query.fieldsToBoolean(filter);
    let query = {};
    query = Query.addQueryString(filter, query);
    query = Query.addStart(filter, query);
    query = Query.addRows(filter, query);
    query = Query.addSort(filter, query);
    query = Query.addFieldList(filter, query);
    client.get('query', query, (err, suc) => Query.findOneCb(filter, err, suc, cb));
  }
}

export class SolrConnector {
  DataAccessObject: typeof Solr;
  dataSource: SolrDataSource;

  constructor(options: SolrConnectorOptions) {
    client = (solr as any).createClient( /* no TS type for solr-client */
      options.solr.host, 
      options.solr.port, 
      options.solr.core
    );
  }
}

export function initialize(dataSource: SolrDataSource, callback: Function) {
  var settings = dataSource.settings;
  var connector = new SolrConnector(settings);

  Solr.connector = connector;
  connector.DataAccessObject = Solr;

  dataSource.connector = connector;
  connector.dataSource = dataSource;

  callback();
}
