const Joi = require('joi');
var db = require('../dynogels');

var User = db.dynogels.define('User', {
    hashKey : 'userId',

    schema : {
        userId : Joi.string(),
        userName : Joi.string(),	
        isPrimeMember : Joi.boolean(),
        walletAmount : Joi.number(),
        issuedBook : Joi.array()  
    },
    tableName : 'User',
    indexes : [
      { hashKey: 'userName', type: 'global', name: 'userName-index' },
    ]
  });


  module.exports = {
    User
  }