# loopback-connector-solr

[Solr](http://lucene.apache.org/solr/) connector in TypeScript for [loopback](http://github.com/strongloop/loopback) forked from [Timo](https://github.com/timosaikkonen/loopback-connector-solr)

## Notes

Put the following in your model.js: (Disables unimplemented endpoints)

```javascript
module.exports = function(Modelname) {
  Modelname.disableRemoteMethodByName('createChangeStream', true);
  Modelname.disableRemoteMethodByName('upsert', true);
  Modelname.disableRemoteMethodByName('updateAll', true);
  Modelname.disableRemoteMethodByName('upsertWithWhere', true);
};
```