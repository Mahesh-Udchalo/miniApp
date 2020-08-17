var dynogels = require('dynogels');

const cred = require('../credential');

dynogels.AWS.config.update({

  accessKeyId : cred.AWS_ID, 
  secretAccessKey : cred.AWS_SECRET, 
  region : cred.AWS_REGION 

});

module.exports = {
    dynogels
}