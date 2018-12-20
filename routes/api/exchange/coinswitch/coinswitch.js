const request = require('request');
const Promise = require('bluebird');
const fs = require('fs-extra');
const _fs = require('graceful-fs');
const fsnode = require('fs');

const API_KEY_PROD = '3sie59MENW47hvcAsaUXgw0R7BCQmKZ4CapfB90c';
const API_KEY_DEV = 'cRbHFJTlL6aSfZ0K2q7nj6MgV5Ih4hbA2fUG0ueO';
const _statusLookup = [
  'complete',
  'failed',
  'refunded',
  'timeout',
];

// TODO: fixed api(?)

module.exports = (api) => {
  api.loadLocalExchangesCache = () => {
    if (fs.existsSync(`${api.agamaDir}/exchanges-cache.json`)) {
      const localCache = fs.readFileSync(`${api.agamaDir}/exchanges-cache.json`, 'utf8');

      try {
        api.exchangesCache = JSON.parse(localCache);
        api.log('local exchanges cache loaded from local file', 'exchanges.cache');
      } catch (e) {
        api.log('local exchanges cache file is damaged, create new', 'exchanges.cache');
        api.saveLocalExchangesCache();
        api.exchangesCache = {};
      }
    } else {
      api.log('local exchanges cache file is not found, create new', 'exchanges.cache');
      api.saveLocalExchangesCache();
      api.exchangesCache = {};
    }
  };

  api.saveLocalExchangesCache = () => {
    _fs.access(api.agamaDir, fs.constants.R_OK, (err) => {
      if (!err) {
        const FixFilePermissions = () => {
          return new Promise((resolve, reject) => {
            const result = 'exchanges-cache.json file permissions updated to Read/Write';

            fsnode.chmodSync(`${api.agamaDir}/exchanges-cache.json`, '0666');

            setTimeout(() => {
              api.log(result, 'exchanges.cache');
              api.writeLog(result);
              resolve(result);
            }, 1000);
          });
        }

        const FsWrite = () => {
          return new Promise((resolve, reject) => {
            const result = 'exchanges-cache.json write file is done';
            const err = fs.writeFileSync(`${api.agamaDir}/exchanges-cache.json`, JSON.stringify(api.exchangesCache), 'utf8');

            if (err)
              return api.log(err, 'exchanges.cache');

            fsnode.chmodSync(`${api.agamaDir}/exchanges-cache.json`, '0666');
            setTimeout(() => {
              api.log(result, 'exchanges.cache');
              api.log(`exchanges-cache.json file is created successfully at: ${api.agamaDir}`, 'exchanges.cache');
              resolve(result);
            }, 2000);
          });
        }

        FsWrite()
        .then(FixFilePermissions());
      }
    });
  }

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

  api.coinswitchGetStatus = (res, req, orderId) => {
    const options = {
      method: 'GET',
      url: `https://api.coinswitch.co/v2/order/${orderId}`,
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
        api.log(`coinswitch request order ${orderId} state update failed`, 'exchanges.coinswitch');
      } else {
        if (result.result.data &&
            result.result.data.orderId) {
          api.exchangesCache.coinswitch[result.result.data.orderId] = result.result.data;
          api.saveLocalExchangesCache();
          api.log(`coinswitch request order ${orderId} state update success, new state is ${result.result.data.status}`, 'exchanges.coinswitch');
        } else {
          api.log(`coinswitch request order ${orderId} state update failed`, 'exchanges.coinswitch');
        }
        res.end(JSON.stringify(result));
      }
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
          if (result.result.data &&
              result.result.data.orderId) {
            api.coinswitchGetStatus(res, req, result.result.data.orderId);
          } else {
            res.end(JSON.stringify(result));
          }
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
      const _orderId = req.query.orderid;

      console.log(api.exchangesCache.coinswitch);

      if (api.exchangesCache.coinswitch[_orderId]) {
        api.log(`coinswitch order ${_orderId} state is ${api.exchangesCache.coinswitch[_orderId].status}`, 'exchanges.coinswitch');

        if (_statusLookup.indexOf(api.exchangesCache.coinswitch[_orderId].status) === -1) {
          api.log(`coinswitch request order ${_orderId} state update`, 'exchanges.coinswitch');
          api.coinswitchGetStatus(res, req, _orderId);
        } else {
          const retObj = {
            msg: 'success',
            result: api.exchangesCache.coinswitch[_orderId],
          };
          res.end(JSON.stringify(retObj));
        }
      } else {
        api.coinswitchGetStatus(res, req, _orderId);
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   *
   */
  api.post('/exchanges/cache/delete', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      api.exchangesCache = {
        coinswitch: {},
      };
      api.saveLocalExchangesCache();

      const retObj = {
        msg: 'success',
        result: 'exchanges cache is removed',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   *
   */
  api.post('/exchanges/cache/coinswitch/order/delete', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      delete api.exchangesCache.coinswitch[req.query.orderid];
      api.saveLocalExchangesCache();

      const retObj = {
        msg: 'success',
        result: api.exchangesCache.coinswitch,
      };

      res.end(JSON.stringify(retObj));
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
  api.get('/exchanges/cache', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const provider = req.query.provider;
      const retObj = {
        msg: 'success',
        result: api.exchangesCache[provider],
      };

      res.end(JSON.stringify(retObj));

      if (provider === 'coinswitch') {
        for (key in api.exchangesCache.coinswitch) {
          api.log(`coinswitch order ${key} state is ${api.exchangesCache.coinswitch[key].status}`, 'exchanges.coinswitch');

          if (api.exchangesCache.coinswitch[key].status &&
              _statusLookup.indexOf(api.exchangesCache.coinswitch[key].status) === -1) {
            api.log(`coinswitch request order ${key} state update`, 'exchanges.coinswitch');
            api.coinswitchGetStatus(res, req, key);
          }
        }
      }
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
  api.get('/exchanges/deposit/update', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const provider = req.query.provider;

      if (!api.exchangesCache[provider].deposits) {
        api.exchangesCache[provider].deposits = {};
      }

      if (provider === 'coinswitch') {
        api.exchangesCache[provider].deposits[`${req.query.coin.toLowerCase()}-${req.query.txid}`] = req.query.orderid;
      }

      const retObj = {
        msg: 'success',
        result: api.exchangesCache[provider].deposits[`${req.query.coin.toLowerCase()}-${req.query.txid}`],
      };

      res.end(JSON.stringify(retObj));
      api.saveLocalExchangesCache();
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
  api.get('/exchanges/deposit', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const provider = req.query.provider;

      if (api.exchangesCache[provider] &&
          api.exchangesCache[provider].deposits &&
          api.exchangesCache[provider].deposits[`${req.query.coin.toLowerCase()}-${req.query.txid}`]) {
        const retObj = {
          msg: 'success',
          result: api.exchangesCache[provider].deposits[`${req.query.coin.toLowerCase()}-${req.query.txid}`],
        };

        res.end(JSON.stringify(retObj));
      }
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