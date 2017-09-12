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

  // Callback for a Solr find
  static findCb(error: any, success: SolrGetSuccess, callback: Function) {
    if (error) callback(error, undefined);
    else callback(undefined, success.response.docs);
  }
  
  // Callback for replaceOrCreate
  static replaceOrCreateCb(error: any, success: object, callback: Function, doc: object) {
    if (error) callback(error, undefined);
    else {
      client.commit(function(err,res) {
        if(err) callback(err, undefined);
        if(res) callback(undefined, doc);
      });
    }
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
          client.add([doc], (err, suc) => Query.replaceOrCreateCb(err, suc, cb, doc));
        else
          throw new Error("UUID collision check failed")
      });
    }
    else {
      client.add([doc], (err, suc) => Query.replaceOrCreateCb(err, suc, cb, doc));
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

  static exists(p1: any, p2: any, p3: Function) {
    console.log('Solr exists');
    console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(uuid());
    p3();
  }

  static replaceById(p1: any, p2: any, p3: any, p4: Function) {
    console.log('Solr replaceById');
    console.log(p1); // id (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p2); // data (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p3); // auth (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p4); // callback (put /hrms/{id} && post /hrms/{id}/replace)
    p4();
  }

  static deleteById(p1: any, p2: any, p3: Function) {
    console.log('Solr deleteById');
    console.log(p1); // id (delete /hrms/{id})
    console.log(p2); // auth (delete /hrms/{id})
    console.log(p3); // callback (delete /hrms/{id})
    p3();
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
