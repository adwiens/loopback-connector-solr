class Solr {
  static find(p1: any, p2: any, p3: any) {
    console.log('Solr find');
    console.log(p1); // filter (get /hrms)
    console.log(p2); // auth (get /hrms)
    console.log(p3); // callback (get /hrms)
  };

  static replaceOrCreate(p1: any, p2: any, p3: any) {
    console.log('Solr replaceOrCreate');
    console.log(p1); // data (put /hrms && post /hrms/replaceOrCreate)
    console.log(p2); // auth (put /hrms && post /hrms/replaceOrCreate)
    console.log(p3); // callback (put /hrms && post /hrms/replaceOrCreate)
  };

  static patchOrCreate(p1: any, p2: any, p3: any) {
    console.log('Solr upsert');
    console.log(p1); // data (patch /hrms)
    console.log(p2); // auth (patch /hrms)
    console.log(p3); // callback (patch /hrms)
  };
  static upsert = Solr.patchOrCreate;
  static updateOrCreate = Solr.patchOrCreate

  static findById(p1: any, p2: any, p3: any, p4: any) {
    console.log('Solr findById');
    console.log(p1); // id (patch /hrms/{id} && get /hrms/{id})
    console.log(p2); // ? empty (patch /hrms/{id}) || filter (get /hrms/{id})
    console.log(p3); // auth (patch /hrms/{id} && get /hrms/{id})
    console.log(p4); // callback (patch /hrms/{id} && get /hrms/{id})
  };

  static create(p1: any, p2: any, p3: any) {
    console.log('Solr create');
    console.log(p1); // data (post /hrms)
    console.log(p2); // auth (post /hrms)
    console.log(p3); // callback (post /hrms)
  };

  static exists(p1: any, p2: any, p3: any) {
    console.log('Solr exists');
    console.log(p1); // id (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p2); // auth (head /hrms/{id} && get /hrms/{id}/exists)
    console.log(p3); // callback (head /hrms/{id} && get /hrms/{id}/exists)
  };

  static replaceById(p1: any, p2: any, p3: any, p4: any) {
    console.log('Solr replaceById');
    console.log(p1); // id (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p2); // data (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p3); // auth (put /hrms/{id} && post /hrms/{id}/replace)
    console.log(p4); // callback (put /hrms/{id} && post /hrms/{id}/replace)
  };

  static deleteById(p1: any, p2: any, p3: any) {
    console.log('Solr deleteById');
    console.log(p1); // id (delete /hrms/{id})
    console.log(p2); // auth (delete /hrms/{id})
    console.log(p3); // callback (delete /hrms/{id})
  };

  static count(p1: any, p2: any, p3: any) {
    console.log('Solr count');
    console.log(p1); // where (get /hrms/count)
    console.log(p2); // auth (get /hrms/count)
    console.log(p3); // callback (get /hrms/count)
  };

  static findOne(p1: any, p2: any, p3: any) {
    console.log('Solr findOne');
    console.log(p1); // filter (get /hrms/findOne)
    console.log(p2); // auth (get /hrms/findOne)
    console.log(p3); // callback (get /hrms/findOne)
  };

  static updateAll(p1: any, p2: any, p3: any, p4: any) {
    console.log('Solr updateAll');
    console.log(p1); // where (post /hrms/update)
    console.log(p2); // data (post /hrms/update)
    console.log(p3); // auth (post /hrms/update)
    console.log(p4); // callback (post /hrms/update)
  };

  static upsertWithWhere(p1: any, p2: any, p3: any, p4: any) {
    console.log('Solr upsertWithWhere');
    console.log(p1); // where (post /hrms/upsertWithWhere)
    console.log(p2); // data (post /hrms/upsertWithWhere)
    console.log(p3); // auth (post /hrms/upsertWithWhere)
    console.log(p4); // callback (post /hrms/upsertWithWhere)
  };

  static connector: SolrConnector;
}

export class SolrConnector {
  constructor(options: any = {}) {
    console.log('Created solr connector with options ', options);
    // initialize solr-client here
  }
  DataAccessObject: typeof Solr;
  dataSource: any;
}

export function initialize(dataSource: any, callback: any) {
  console.log('running initialize');

  var settings = dataSource.settings || {};
  var connector = new SolrConnector(settings);

  Solr.connector = connector;
  connector.DataAccessObject = Solr;

  dataSource.connector = connector;
  connector.dataSource = dataSource;

  callback();
}
