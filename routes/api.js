var passport = require("passport");
var config = require("../config/database");
require("../config/passport")(passport);
var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
var User = require("../models/user");
var Product = require("../models/product");

const bodyParser = require("body-parser");

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

// #SIGN UP
const signUpObj = {
  pageTitle: "Sign up",
  task: "Sign up",
  actionTask: "/api/signup",
};
router.get("/signup", async (req, res) => {
  res.render("sign_up", signUpObj);
});
router.post("/signup", async function (req, res) {
  if (!req.body.email || !req.body.password) {
    // res.json({ success: false, msg: 'Please pass email and password.' });
    signUpObj.notify = "Please pass username and password.";
    return res.render("sign_up", signUpObj);
  } else {
    // check email available
    let check = await User.findOne({ email: req.body.email })
      .lean()
      .exec();
    console.log("check email available ", check);
    if (check) {
      signUpObj.notify = "email available. Try another email";
      return res.render("sign_up", signUpObj);
    }

    var newUser = new User({
      email: req.body.email,
      fullName : req.body.fullname,
      passWord: req.body.password,
    });
    // save the user
    await newUser.save();

    // res.json({ success: true, msg: 'Successful created new user.' });
    return res.redirect("/api/signin");
  }
});

// #SIGN IN
const signInObj = {
  pageTitle: "Sign in",
  task: "Sign in",
  actionTask: "/api/signin",
};
const homeObj = {
  pageTitle: "Trang chu",
};
router.get("/signin", async (req, res) => {
  res.render("sign_in", signInObj);
});
router.post("/signin", async function (req, res) {
  let user = await User.findOne({ email: req.body.email});
  console.log(req.body);
  if (!user) {
    // res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    signInObj.notify = "Authentication failed. User not found.";
    return res.render("sign_in", signInObj);
  } else {
    // check if password matches
    user.comparePassword(req.body.password, async function (err, isMatch) {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        var token = jwt.sign(user.toJSON(), config.secret);
        // return the information including token as JSON
        // res.json({ success: true, token: 'JWT ' + token });
        homeObj.user = user.toObject();
        req.session.user = user.toObject();
        req.session.token = "JWT " + token;
        return res.redirect("/api/products");
      } else {
        // res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        signInObj.notify = "Authentication failed. Wrong password.";
        return res.render("sign_in", signInObj);
      }
    });
  }
});

// #PRODUCT
router.post("/product_add",  function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    console.log(req.body);
    var newProduct = new Product({
      name: req.body.name,
      type: req.body.type,
      price: req.body.price,
      color: req.body.color,
      ma:req.body.ma,
      namekh:req.body.namekh,

  });

   
      newProduct.save()
      .then(() => {
        res.redirect("/");
      })
      .catch((e) => {
        res.json({ success: false, msg: "Save product failed." });
      });
  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});

router.get("/products", async function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    let products = await Product.find({}).lean().exec();

    return res.render("home", {
      pageTitle: "List Product",
      products,
    });
  } else {
    return res.redirect("/api/signin");
  }
});

router.get("/product_add", (req, res, next) => {
  var token = req.session.token;
  if (token) {
    res.render("add_product", {
      pageTitle: "Add product",
    });
  } else {
    return res.redirect("/api/signin");
  }
});

router.get("/product_update/:id", async (req, res, next) => {
  var token = req.session.token;
  if (token) {
    const spId = req.params.id;
    await Product.findById(spId)
      .then( sp => {
        if (sp) {
          res.render('update_product', {
            sp: sp.toJSON(),
            viewTile:"update"
          });
        } else {
          res.status(404).send('Sản phẩm không tồn tại');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Lỗi server');
      });
  } else {
    return res.redirect("/api/signin");
  }
});


router.post("/product_update", async function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    try {
      console.log("req.body", req.body);
       await Product.findOneAndUpdate({_id:req.body.id}, req.body, {new:true});
      // await products.save();  let products =
      return res.redirect("/");
    } catch (error) {
      res.status(500).send(error);
    }
}
});
router.get("/product_delete/:_id", async (req, res, next) => {
  var token = req.session.token;
  if (token) {
    try {
      await Product.findByIdAndDelete(req.params._id).lean().exec();
      return res.redirect("/");
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.redirect("/api/signin");
  }
});
// #ACCOUNT
router.get("/users", async function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    let users = await User.find({}).lean().exec();

    return res.render("account", {
      pageTitle: "List Account",
      users,
    });
  } else {
    return res.redirect("/api/signin");
  }
});
router.get("/user_add", (req, res, next) => {
  var token = req.session.token;
  if (token) {
    res.render("add_user", {
      pageTitle: "Add Account",
    });
  } else {
    return res.redirect("/api/signin");
  }
});
router.post("/user_add",  function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    console.log(req.body);
    var newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      passWord: req.body.passWord,
      role: req.body.role,
  });

   
      newUser.save()
      .then(() => {
        res.redirect("/api/users");
      })
      .catch((e) => {
        res.json({ success: false, msg: "Save User failed." });
      });
  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});
router.get("/user_delete/:_id", async (req, res, next) => {
  var token = req.session.token;
  if (token) {
    try {
      await User.findByIdAndDelete(req.params._id).lean().exec();
      return res.redirect("/api/users");
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.redirect("/api/signin");
  }
});
router.get("/user_update/:id", async (req, res, next) => {
  var token = req.session.token;
  if (token) {
    const userId = req.params.id;
    await User.findById(userId)
      .then( user => {
        if (user) {
          res.render('update_user', {
            user: user.toJSON(),
            viewTile:"update"
          });
        } else {
          res.status(404).send(' không tồn tại');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Lỗi server');
      });
  } else {
    return res.redirect("/api/signin");
  }
});


router.post("/user_update", async function (req, res) {
  passport.authenticate("jwt", { session: false });
  var token = req.session.token;
  if (token) {
    try {
      console.log("req.body", req.body);
       await User.findOneAndUpdate({_id:req.body.id}, req.body, {new:true});
      // await products.save();  let products =
      return res.redirect("/api/users");
    } catch (error) {
      res.status(500).send(error);
    }
}
});
// #PROFILE
router.get("/profile/:_id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params._id).lean().exec();

    return res.render("profile", {
      pageTitle: "Profile",
      user,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

getToken = (headers) => {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
