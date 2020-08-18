const Joi = require('joi');
var db = require('../dynogels');

var User = db.dynogels.define('User', {
    hashKey : 'userId',

    schema : {
      userId : Joi.string().required(),
      userName : Joi.string().required(),	
      isPrimeMember : Joi.boolean().required(),
      walletAmount : Joi.number().required().min(0).positive().integer(),
      issuedBook : Joi.array()  
    },
    tableName : 'User',
    indexes : [
      { hashKey: 'userName', type: 'global', name: 'userName-index' },
    ]
  });


  module.exports =  User;
