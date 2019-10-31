const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SpriceSchema = new Schema ({
  stockData: {
    stock: {
      type: String
    },
    price: {
      type: Number
    }, 
    likes: {
      type: Number
    },
    src: {
      type: Array,
      ip: {
        type: String  //change from String to Array
      }
    }
  }
});

// var StockSchema = new Schema ({
//   stock: {
//     type: String
//   },
//   price: {
//     type: Number
//   }, 
//   likes: {
//     type: Boolean
//   },
//   rel_likes: {
//     type: Boolean
//   }
// })


// var SpriceSchema = new Schema ({
//   stockData: {
//     stock: {
//       type: String
//     },
//     price: {
//       type: Number
//     }, 
//     likes: {
//       type: Boolean,
//       default: false
//     },
//     rel_likes: {
//       type: Boolean
//     }
//   }
// });

module.exports = mongoose.model('Sprice', SpriceSchema);