const request = require('request');
const Promise = require('bluebird');
const API_KEY_PROD = '3sie59MENW47hvcAsaUXgw0R7BCQmKZ4CapfB90c';
const API_KEY_DEV = 'cRbHFJTlL6aSfZ0K2q7nj6MgV5Ih4hbA2fUG0ueO';

module.exports = (api) => {
  /*
   *  type: GET
   *
   */
  api.exchangeHttpReq = (options) => {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          const retObj = {
            msg: 'error',
            result: error,
          };
        
          resolve(retObj);
          api.log(error, 'exchanges.coinswitch');
        } else {
          try {
            const json = JSON.parse(body);
            const retObj = {
              msg: 'success',
              result: json,
            };
          
            resolve(retObj);
          } catch (e) {
            console.log(body);
            api.log(`can\'t parse json from [${options.method}] ${options.url}`, 'exchanges.coinswitch');
            const retObj = {
              msg: 'error',
              result: `can\'t parse json from [${options.method}] ${options.url}`,
            };
          
            resolve(retObj);
          }
        }
      });
    });
  };

  api.get('/exchange/coinswitch/coins', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const options = {
        method: 'GET',
        url: 'https://api.coinswitch.co/v2/coins',
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': req.query.dev ? API_KEY_DEV : API_KEY_PROD,
        },
      };
    
      api.exchangeHttpReq(options)
      .then((result) => {
        res.end(JSON.stringify(result));
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/rate', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const options = {
        method: 'POST',
        url: 'https://api.coinswitch.co/v2/rate',
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': req.query.dev ? API_KEY_DEV : API_KEY_PROD,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          depositCoin: req.query.src,
          destinationCoin: req.query.dest,
        }),
      };
    
      api.exchangeHttpReq(options)
      .then((result) => {
        console.log(result);

        if (result.msg === 'success' &&
            result.result.success &&
            !result.result.data) {
          const retObj = {
            msg: 'error',
            result: 'unavailable',
          };
          res.end(JSON.stringify(retObj));
        } else {
          res.end(JSON.stringify(result));
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/order/place', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const options = {
        method: 'POST',
        url: 'https://api.coinswitch.co/v2/order',
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': req.query.dev ? API_KEY_DEV : API_KEY_PROD,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          depositCoin: req.query.src,
          destinationCoin: req.query.dest,
          depositCoinAmount: req.query.srcAmount,
          destinationCoinAmount: req.query.destAmount,
          destinationAddress: {
            address: req.query.destPub,
          },
          refundAddress: {
            address: req.query.refundPub,
          },
        }),
      };
    
      api.exchangeHttpReq(options)
      .then((result) => {
        console.log(result);

        if (result.msg === 'success' &&
            result.result.success &&
            !result.result.data) {
          const retObj = {
            msg: 'error',
            result: 'no data',
          };
          res.end(JSON.stringify(retObj));
        } else {
          res.end(JSON.stringify(result));
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/order', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const options = {
        method: 'GET',
        url: `https://api.coinswitch.co/v2/order/${req.query.orderid}`,
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': req.query.dev ? API_KEY_DEV : API_KEY_PROD,
        },
      };
    
      api.exchangeHttpReq(options)
      .then((result) => {
        console.log(result);

        if (result.msg === 'success' &&
            result.result.success &&
            !result.result.data) {
          const retObj = {
            msg: 'error',
            result: 'no data',
          };
          res.end(JSON.stringify(retObj));
        } else {
          res.end(JSON.stringify(result));
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};