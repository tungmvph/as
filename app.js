//var createError = require('http-errors');
var express = require("express");
const expressHbs = require("express-handlebars");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var config = require("./config/database");
const session = require("express-session");
// var adminRouter = require("./routes/admin");
// var usersRouter = require("./routes/user");
var indexRouter  = require("./routes/index");
var apiRouter = require("./routes/api");

var app = express();

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "somesecret",
    cookie: { maxAge: 600000 },
  })
);
// #config view engine
app.engine(
  "hbs",
  expressHbs.engine({
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use("/admin", adminRouter);
// app.use("/user", usersRouter);
app.use("/", indexRouter);
app.use("/api", apiRouter);

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// var cors = require('cors')

// app.use(cors());

app.use(passport.initialize());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("Not found");
  next();
});

module.exports = app;

const port = 3003;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
