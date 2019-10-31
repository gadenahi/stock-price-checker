/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
const mongooseConfig = require("../config/mongoose_config");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var Sprice = require("./sprice");
const https = require("https");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING, mongooseConfig);

module.exports = function(app) {
  app.route("/api/stock-prices").get(function(req, res) {
    // Sprice.deleteMany({}, function(err){
    //   if (err) {
    //     res.send(err)
    //   }
    //   console.log('deleted success')
    // })

    var sprice = new Sprice();
    var stock = req.query.stock;
    var like = req.query.like;

    // console.log('query like', like)

    var total = []; //moved from before app.route to here

    var ip = req.connection.remoteAddress;
    // console.log('IP=' + req.connection.remoteAddress)
    // console.log("typeof" + typeof(stock))
    if (typeof stock == "object") {
      stock.map(x => {
        // console.log("input stock:" + x);
        https.get(
          "https://repeated-alpaca.glitch.me/v1/stock/" + x + "/quote",
          function(response) {
            var data = [];

            response
              .on("data", function(chunk) {
                data += chunk;
              })
              .on("end", () => {
                total.push(JSON.parse(data));
                // console.log("total length" + total.length);

                if (total.length == 2) {
                  storeData(total, "object", res);
                  // console.log("Output for 2 inputs:" + JSON.stringify(total));
                  total = [];
                }
              })
              .on("error", console.error);
          }
        );
      });
    } else {
      https.get(
        "https://repeated-alpaca.glitch.me/v1/stock/" + stock + "/quote",
        function(response) {
          var data = [];
          response
            .on("data", function(chunk) {
              data += chunk;
            })
            .on("end", () => {
              total = JSON.parse(data);
              storeData(total, "string", res);
            })
            .on("error", console.error);
        }
      );
    }

    function storeData(o_data, type, res) {
      // console.log('begin of storedata' + JSON.stringify(o_data))
      var toDisplay = [];
      // console.log("type=" + type);
      if (type == "object") {
        o_data.forEach(function(ele, x) {
          // console.log("begin store data" + ele.symbol);
          Sprice.findOne({ "stockData.stock": ele.symbol }, function(
            err,
            fData
          ) {
            // console.log("Have fData?", JSON.stringify(fData));
            // if (fData.stockData.stock != null) {
            if (fData != null) {
              if (like == "true") {
                Sprice.find(
                  { "stockData.stock": ele.symbol, "stockData.src.ip": ip },
                  function(err, ipdata) {
                    // console.log("like true, ipdata" + JSON.stringify(ipdata[0]));

                    if (ipdata[0] == undefined) {
                      // console.log("two data likes, undefined")
                      // console.log('ip', ip)

                      Sprice.findOneAndUpdate(
                        { "stockData.stock": ele.symbol },
                        {
                          $set: {
                            "stockData.price": ele.latestPrice
                          },
                          $inc: { "stockData.likes": 1 },
                          $push: { "stockData.src": { ip: ip } }
                          // $addToSet: {"stockData" : {"src": {"ip": ip}}}
                        },
                        { new: true },
                        function(err, two_data) {
                          // console.log("before success" + two_data);
                          if (err) {
                            console.log(err);
                            res.send(err);
                          } else {
                            toDisplay.push({
                              stock: two_data.stockData.stock,
                              price: two_data.stockData.price,
                              likes: two_data.stockData.likes
                            });

                            // console.log("length:" + toDisplay.length)
                            // console.log("two data added likes and ip[exist]" + JSON.stringify(two_data));

                            if (toDisplay.length == 2) {
                              var likeOne = toDisplay[0].likes;
                              var likeTwo = toDisplay[1].likes;

                              if ((likeOne == null) | (likeTwo == null)) {
                                likeOne = 0;
                              }

                              toDisplay[0]["rel_likes"] = likeOne - likeTwo;
                              delete toDisplay[0]["likes"];
                              toDisplay[1]["rel_likes"] = likeTwo - likeOne;
                              delete toDisplay[1]["likes"];

                              res.send({ stockData: toDisplay });
                            }
                          }
                        }
                      );
                    } else {
                      Sprice.findOneAndUpdate(
                        { "stockData.stock": ele.symbol },
                        {
                          $set: {
                            "stockData.price": ele.latestPrice
                          }
                        },
                        function(err, two_data) {
                          // console.log("before success with like and ex.ip" + two_data);
                          if (err) {
                            console.log(err);
                            res.send(err);
                          } else {
                            toDisplay.push({
                              stock: two_data.stockData.stock,
                              price: two_data.stockData.price,
                              likes: two_data.stockData.likes
                            });

                            // console.log("length:" + toDisplay.length)
                            // console.log("two data with like and ip [exist]" + JSON.stringify(two_data));

                            if (toDisplay.length == 2) {
                              var likeOne = toDisplay[0].likes;
                              var likeTwo = toDisplay[1].likes;

                              if ((likeOne == null) | (likeTwo == null)) {
                                likeOne = 0;
                              }

                              toDisplay[0]["rel_likes"] = likeOne - likeTwo;
                              delete toDisplay[0]["likes"];
                              toDisplay[1]["rel_likes"] = likeTwo - likeOne;
                              delete toDisplay[1]["likes"];

                              res.send({ stockData: toDisplay });
                            }
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                Sprice.findOneAndUpdate(
                  { "stockData.stock": ele.symbol },
                  {
                    $set: {
                      "stockData.price": ele.latestPrice
                    }
                  },
                  { new: true },
                  function(err, two_data) {
                    // console.log("before success" + two_data);
                    if (err) {
                      console.log(err);
                      res.send(err);
                    } else {
                      toDisplay.push({
                        stock: two_data.stockData.stock,
                        price: two_data.stockData.price,
                        likes: two_data.stockData.likes
                      });

                      // console.log("length:" + toDisplay.length)
                      // console.log("two data without like [exist]" + JSON.stringify(two_data));

                      if (toDisplay.length == 2) {
                        var likeOne = toDisplay[0].likes;
                        var likeTwo = toDisplay[1].likes;

                        if ((likeOne == null) | (likeTwo == null)) {
                          likeOne = 0;
                        }

                        toDisplay[0]["rel_likes"] = likeOne - likeTwo;
                        delete toDisplay[0]["likes"];
                        toDisplay[1]["rel_likes"] = likeTwo - likeOne;
                        delete toDisplay[1]["likes"];

                        res.send({ stockData: toDisplay });
                      }
                    }
                  }
                );
              }
            } else {
              sprice.stockData.stock = ele.symbol;
              sprice.stockData.price = ele.latestPrice;
              var relike = 0;
              var reip;

              if (like == "true") {
                relike = 1;
                reip = ip;
              }

              toDisplay.push({
                stock: sprice.stockData.stock,
                price: sprice.stockData.price,
                rel_likes: 0
              });
              if (toDisplay.length == 2) {
                // console.log("two data [new]" + JSON.stringify(toDisplay));
                res.send({ stockData: toDisplay });
              }

              // sprice.save(function(err, saveData) {
              //   if (err) {
              //     console.log(err);
              //   }
              //     console.log("saved successful[new]", saveData);
              // });

              // To save the multiple documents, used insertMany instead of save

              Sprice.findOne({ "stockData.stock": ele.symbol }, function(
                err,
                stockData
              ) {
                if (err) {
                  console.log(err);
                }
                if (stockData == null) {
                  Sprice.insertMany(
                    {
                      "stockData.stock": ele.symbol,
                      "stockData.price": ele.latestPrice,
                      "stockData.likes": relike,
                      "stockData.src": { ip: reip }
                    },
                    { multi: true },
                    function(err, stockData) {
                      if (err) {
                        console.log(err);
                      }
                      // console.log("two data saved[new]", JSON.stringify(stockData));
                    }
                  );
                }
              });
            }
          });
        });
      } else {
        Sprice.findOne({ "stockData.stock": o_data.symbol }, function(
          err,
          fData
        ) {
          if (fData) {
            // console.log('stockData', JSON.stringify(fData))

            if (like == "true") {
              // console.log('if like?')
              // console.log(typeof(ip))

              Sprice.find(
                { "stockData.stock": o_data.symbol, "stockData.src.ip": ip },
                // { "stockData.stock": o_data.symbol, stockData: {src: {$elemMatch: {ip: ip }}}},    // not working
                // { "stockData.stock": o_data.symbol, "stockData.src.$.ip": ip },                      //not working
                function(err, ipdata) {
                  // console.log('singile data ipdata',ipdata)

                  if (ipdata[0] == undefined) {
                    // console.log("add likes")
                    Sprice.findOneAndUpdate(
                      { "stockData.stock": o_data.symbol },
                      {
                        $set: {
                          "stockData.price": o_data.latestPrice
                        },
                        $inc: { "stockData.likes": 1 },
                        $push: { "stockData.src": { ip: ip } }
                      },
                      { new: true },
                      function(err, saveData) {
                        if (err) {
                          console.log(err);
                        }
                        // console.log("saved with like and ip [exist]" + JSON.stringify(saveData));
                        res.send({
                          stockData: {
                            stock: saveData.stockData.stock,
                            price: saveData.stockData.price,
                            likes: saveData.stockData.likes
                          }
                        });
                      }
                    );
                  } else {
                    Sprice.findOneAndUpdate(
                      { "stockData.stock": o_data.symbol },
                      {
                        $set: {
                          "stockData.stock": o_data.symbol,
                          "stockData.price": o_data.latestPrice
                        }
                      },
                      { new: true },
                      function(err, saveData) {
                        if (err) {
                          console.log(err);
                          res.send(err);
                        }
                        // console.log("saved with like [exist]" + JSON.stringify(saveData));
                        res.send({
                          stockData: {
                            stock: saveData.stockData.stock,
                            price: saveData.stockData.price,
                            likes: saveData.stockData.likes
                          }
                        });
                      }
                    );
                  }
                }
              );
            } else {
              Sprice.findOneAndUpdate(
                { "stockData.stock": o_data.symbol },
                {
                  $set: {
                    "stockData.stock": o_data.symbol,
                    "stockData.price": o_data.latestPrice
                  }
                },
                { new: true },
                function(err, saveData) {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  }
                  // console.log("saved without like [exist]" + JSON.stringify(saveData));
                  res.send({
                    stockData: {
                      stock: saveData.stockData.stock,
                      price: saveData.stockData.price,
                      likes: saveData.stockData.likes
                    }
                  });
                }
              );
            }
          } else {
            sprice.stockData.stock = o_data.symbol;
            sprice.stockData.price = o_data.latestPrice;
            sprice.stockData.likes = 0;
            if (like == "true") {
              sprice.stockData.likes = 1;
              // sprice.stockData.src[ip] = ip;
              sprice.stockData.src.push({
                ip: ip
              });
              // console.log("saved ip" + sprice.stockData.src.ip)
            }
            // console.log("before save of single data" + sprice)
            sprice.save(function(err, saveData) {
              if (err) {
                console.log(err);
              }
              // console.log("saved successful[new]" + JSON.stringify(saveData));
              res.send({
                stockData: {
                  stock: saveData.stockData.stock,
                  price: saveData.stockData.price,
                  likes: saveData.stockData.likes
                }
              });
            });
          }
        });
      }
    }
  });
};
