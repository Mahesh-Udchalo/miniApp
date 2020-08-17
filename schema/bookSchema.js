const Joi = require('joi');
var db = require('../dynogels');

var Book = db.dynogels.define('Book', {
    hashKey : 'bookId',

    schema : {
      bookId : Joi.string().required(),
      bookName   : Joi.string().required(),
      authorName : Joi.string().required(),
      category : Joi.string().required(),
      bookPrice : Joi.number(),
      bookDescription : Joi.string(),
      bookCount : Joi.number(),
      bookUrl : Joi.string()
    },
    tableName : 'Book',
    indexes : [
      { hashKey: 'bookName', type: 'global', name: 'bookName-index' },
      { hashKey: 'category', type: 'global', name: 'category-index' },
      { hashKey: 'authorName', type: 'global', name: 'authorName-index' }
    ]
  });


  module.exports = {
    Book
  }