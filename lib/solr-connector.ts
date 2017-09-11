/* Put the following in your model.js: (Disables unimplemented endpoints)

module.exports = function(Modelname) {
  Modelname.disableRemoteMethodByName('createChangeStream', true);
  Modelname.disableRemoteMethodByName('upsert', true);
  Modelname.disableRemoteMethodByName('updateAll', true);
  Modelname.disableRemoteMethodByName('upsertWithWhere', true);
};

*/

class Solr {
  static connector: SolrConnector;

  static find(p1: any, p2: any, p3: Function) {
    console.log('Solr find');
    console.log(p1); // filter (get /hrms)
    console.log(p2); // auth (get /hrms)
    console.log(p3); // callback (get /hrms)
    p3();
  }

  static replaceOrCreate(p1: any, p2: any, p3: Function) {
    console.log('Solr replaceOrCreate');
    console.log(p1); // data (put /hrms && post /hrms/replaceOrCreate)
    console.log(p2); // auth (put /hrms && post /hrms/replaceOrCreate)
    console.log(p3); // callback (put /hrms && post /hrms/replaceOrCreate)
    p3();
  }

  static findById(p1: any, p2: any, p3: any, p4: Function) {
    console.log('Solr findById');
    console.log(p1); // id (patch /hrms/{id} && get /hrms/{id})
    console.log(p2); // ? empty (patch /hrms/{id}) || filter (get /hrms/{id})
    console.log(p3); // auth (patch /hrms/{id} && get /hrms/{id})
    console.log(p4); // callback (patch /hrms/{id} && get /hrms/{id})
    p4();
  }

  static create(p1: any, p2: any, p3: Function) {
    console.log('Solr create');
    console.log(p1); // data (post /hrms)
    console.log(p2); // auth (post /hrms)
    console.log(p3); // callback (post /hrms)
    p3();
  }

  static exists(p1: any, p2: any, p3: Function) {
    console.log('Solr exists');
    console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
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
    // initialize solr-client here
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
