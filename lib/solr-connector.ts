import * as solr from 'solr-client';
import * as uuid from 'uuid/v4';

var client: any;

interface FindFilter {
  fields?: any;     /* TODO */
  include?: any;    /* TODO */
  limit?: number;   /* addRows */
  order?: string;   /* TODO */
  skip?: number;    /* addStart */
  where?: any;      /* addQueryString */
}

class Query {
  // Adds query string to the query object based on filter.where
  // See http://yonik.com/solr/query-syntax/
  static addQueryString(filter: FindFilter, query: object, id?: string): object {
    let queryString = '';
    if (filter && filter.where) {
      for (var prop in filter.where) {
        queryString += '+' + prop + ':' + filter.where[prop] + ' ';
      }
      if (id) queryString += '+id:' + id;
    }
    else {
      queryString = id ? ('+id:' + id) : '*:*';
    }
    query["q"] = queryString;
    return query;
  }

  // Adds start field to the query object based on filter.skip
  static addStart(filter: FindFilter, query: object): object {
    if (filter && filter.skip)
      query["start"] = filter.skip + '';
    return query;
  }

  // Adds rows field to the query object based on filter.limit
  static addRows(filter: FindFilter, query: object): object {
    if (filter && filter.limit)
      query["rows"] = filter.limit + '';
    return query;
  }

  // Callback for find
  static findCb(error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    else callback(undefined, success.response.docs);
  }
  
  // Callback for replaceOrCreate and replaceById
  static replaceCb(error: any, success: object, callback: Function, doc: object) {
    if (error) callback(error, undefined);
    else {
      client.commit(function(err,res) {
        if(err) callback(err, undefined);
        if(res) callback(undefined, doc);
      });
    }
  }

  // Callback for exists
  static existsCb(error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    if (success) callback(undefined, success.response.numFound > 0);
  }
}

class Solr {
  static connector: SolrConnector;

  // get /hrms
  // See https://loopback.io/doc/en/lb3/Querying-data.html
  static find(filter: FindFilter, auth: object, cb: Function) {
    let query = {};
    query = Query.addQueryString(filter, query);
    query = Query.addStart(filter, query);
    query = Query.addRows(filter, query);
    client.get('query', query, (err, suc) => Query.findCb(err, suc, cb));
  }

  // put /hrms && post /hrms/replaceOrCreate
  static replaceOrCreate(doc: object, auth: object, cb: Function) {
    if (!doc["id"]) {
      doc["id"] = uuid();
      let query = {};
      query = Query.addQueryString({}, query, doc["id"]);
      client.get('query', query, (err, suc: SolrGetSuccess) => {
        if (err) 
          throw new Error("UUID collision check failed")
        if (suc && suc.response.numFound === 0)
          client.add([doc], (err, suc) => Query.replaceCb(err, suc, cb, doc));
        else
          throw new Error("UUID collision check failed")
      });
    }
    else {
      client.add([doc], (err, suc) => Query.replaceCb(err, suc, cb, doc));
    }
  }

  // get /hrms/{id}
  static findById(id: string, filter: FindFilter, auth: object, cb: Function) {
    let query = {};
    query = Query.addQueryString(filter, query, id);
    query = Query.addStart(filter, query);
    query = Query.addRows(filter, query);
    client.get('query', query, (err, suc) => Query.findCb(err, suc, cb));
  }

  // head /hrms/{id}
  static exists(id: string, auth: object, cb: Function) {
    let query = {};
    query = Query.addQueryString({}, query, id);
    client.get('query', query, (err, suc) => Query.existsCb(err, suc, cb));
  }

  // put /hrms/{id} && post /hrms/{id}/replace
  static replaceById(id: string, newDoc: object, auth: object, cb: Function) {
    let query = {};
    query = Query.addQueryString({}, query, id);
    client.get('query', query, (err, suc: SolrGetSuccess) => {
      if (err) cb(err, undefined);
      if (suc) {
        if (suc.response.numFound == 1) { /* id exists */
          let origDoc = suc.response.docs[0];
          for (var prop in origDoc) { /* merge fields */
            if (prop[0] == '_') continue; /* skip Solr's built-in fields */
            if (newDoc[prop] === undefined) newDoc[prop] = origDoc[prop];
          }
          client.add([newDoc], (err, suc) => Query.replaceCb(err, suc, cb, newDoc));
        }
        else if (suc.response.numFound > 1) cb({ /* id collision */
          name: 'Found multiple documents with the same ID', 
          status: '', 
          message: 'More than one document shares this ID. This should not be possible.'
        });
        else cb({ /* id does not exist */
          name: 'ID does not exist', 
          status: '', 
          message: 'Cannot replace by ID because a document with the given ID does not exist in the database.'
        });
      }
    });
  }

  // delete /hrms/{id}
  static deleteById(id: string, auth: object, cb: Function) {
    client.deleteByID(id, function(err, obj) {
      if (err) cb({
        name: 'Could not delete by ID',
        status: '',
        message: JSON.stringify(err)
      });
      else cb(undefined);
    });
    // TODO: commit
  }

  static count(p1: any, p2: any, p3: Function) {
    console.log('Solr count');
    console.log(p1); // where (get /hrms/count)
    console.log(p2); // auth (get /hrms/count)
    console.log(p3); // callback (get /hrms/count)
    p3();
  }

  static findOne(p1: any, p2: any, p3: Function) {
    console.log('Solr findOne');
    console.log(p1); // filter (get /hrms/findOne)
    console.log(p2); // auth (get /hrms/findOne)
    console.log(p3); // callback (get /hrms/findOne)
    p3();
  }
}

interface SolrGetSuccess {
  response: {
    numFound: number;
    docs: Array<object>;
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

export class SolrConnector {
  DataAccessObject: typeof Solr;
  dataSource: SolrDataSource;

  constructor(options: SolrConnectorOptions) {
    client = (solr as any).createClient(
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
