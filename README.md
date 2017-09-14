# loopback-connector-solr

A non-mutable CRUD connector for [Solr](http://lucene.apache.org/solr/) in TypeScript for [Loopback.io](http://github.com/strongloop/loopback) forked from [Timo](https://github.com/timosaikkonen/loopback-connector-solr)

## To build

A build script transpiles the TypeScript into JS using tsc. To run it, use the command:

    npm run-script build

## Tips

0. Install in your Loopback node project with

    npm i adwiens/loopback-connector-solr --save

1. Make a model with the Loopback CLI based on PersistedModel

2. Put the following in your model.js: (Disables unimplemented and mutable endpoints)

```javascript
module.exports = function(Modelname) {
  Modelname.disableRemoteMethodByName('createChangeStream');
  Modelname.disableRemoteMethodByName('upsert');
  Modelname.disableRemoteMethodByName('updateAll');
  Modelname.disableRemoteMethodByName('upsertWithWhere');
  Modelname.disableRemoteMethodByName('create');
  Modelname.disableRemoteMethodByName('replaceOrCreate');
  Modelname.disableRemoteMethodByName('replaceById');
  Modelname.disableRemoteMethodByName('deleteById');
  Modelname.disableRemoteMethodByName('count');
  Modelname.disableRemoteMethod('updateAttributes', false); // updateAttributes is not static - have to use this deprecated function
};
```

3. Create a datasource in datasources.json:

```javascript
{
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "solr": {
    "name": "solr",
    "connector": "solr",
    "solr": {
      "host": "localhost",
      "port": 8983,
      "core": "your-core-name-goes-here"
    }
  }
}
```

4. Hook up the datasource to your model in model-config.json:

```javascript
{
  "ACL": {
    "dataSource": "db",
    "public": false
  },
  "modelname": {
    "dataSource": "solr",
    "public": true
  }
}
```
