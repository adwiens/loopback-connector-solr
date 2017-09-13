# loopback-connector-solr

A [Solr](http://lucene.apache.org/solr/) CRUD connector in TypeScript for [loopback](http://github.com/strongloop/loopback) forked from [Timo](https://github.com/timosaikkonen/loopback-connector-solr)

## To build

A build script transpiles the TypeScript into JS using tsc. To run it, use the command:

    npm run-script build

## Tips

0. Install in your Loopback node project with "npm i adwiens/loopback-connector-solr --save"

1. Make a model with the Loopback CLI based on PersistedModel

2. Put the following in your model.js: (Disables unimplemented endpoints)

```javascript
module.exports = function(Modelname) {
  Modelname.disableRemoteMethodByName('createChangeStream', true);
  Modelname.disableRemoteMethodByName('upsert', true);
  Modelname.disableRemoteMethodByName('updateAll', true);
  Modelname.disableRemoteMethodByName('upsertWithWhere', true);
  Modelname.disableRemoteMethodByName('updateAttributes', false);
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
