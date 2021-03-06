// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License in the project root for license information.

'use strict';
var assert = require("assert"),
  fs = require('fs'),
  path = require('path'),
  RefParser = require('json-schema-ref-parser'),
  util = require('util'),
  utils = require('./util/utils');

var context;


// Useful when debugging a test for a particular swagger. 
// Just update the regex. That will return an array of filtered items.
// utils.swaggers = utils.swaggers.filter(function(item) {
//   return (item.match(/.*Microsoft.Logic.*2016-06-01.*/ig) !== null);
// });
// utils.examples = utils.examples.filter(function(item) {
//   return (item.match(/.*Microsoft.Logic.*2016-06-01.*/ig) !== null);
// });


describe('Azure swagger schema validation:', function () {
  before(async function () {
    const result = await utils.initializeValidator();
    context = result;
  });

  for (const swagger of utils.swaggers) {
    it(swagger + ' should be a valid Swagger document.', async function () {
      const parsedData = await utils.parseJsonFromFile(swagger);
      var valid = context.validator.validate(parsedData, context.extensionSwaggerSchema);
      if (!valid) {
        var error = context.validator.getLastErrors();
        throw new Error("Schema validation failed: " + util.inspect(error, { depth: null }));
      }
      assert(valid === true);
    });
  }

  describe('Azure x-ms-example schema validation:', function () {
    for (const example of utils.examples) {
      it('x-ms-examples: ' + example + ' should be a valid x-ms-example.', async function () {
        const parsedData = await utils.parseJsonFromFile(example);
        var valid = context.validator.validate(parsedData, context.exampleSchema);
        if (!valid) {
          var error = context.validator.getLastErrors();
          throw new Error("Schema validation failed: " + util.inspect(error, { depth: null }));
        }
        assert(valid === true);
      });
    }
  });
});

describe('External file or url references ("$ref") in a swagger spec:', function () {
  for (const swagger of utils.swaggers) {
    it(swagger + ' should be completely resolvable.', async function () {
      RefParser.bundle(swagger, function (bundleErr, bundleResult) {
        if (bundleErr) {
          var msg = swagger + ' has references that cannot be resolved. They are as follows: \n' + util.inspect(bundleErr.message, { depth: null });
          console.log(msg);
          throw new Error(msg);
        }
      });
    });
  }
});