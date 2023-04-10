var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
//   res.send('Trang chu Express');
  res.redirect("api/products");
});

module.exports = router;