var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../util/authenticate");
var cors = require('../util/cors');

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
})
router.get("/", cors.corsWithOptions, (req, res, next) => {
  User.find({})
    .then(
      users => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

router.post("/signup", cors.corsWithOptions,  (req, res, next) => {
  User.findOne({email: req.body.email})
  .then(user => {
    if(!user){
      User.register(new User({email: req.body.email, username : req.body.username}), req.body.password, (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ err: err });
        } else {
          // =============add filed =============

          if(req.body.orgName) user.orgName = req.body.orgName;
          if(req.body.orgDescription) user.orgDescription = req.body.orgDescription;
          // if(req.body.workExperience) user.workExperience = req.body.workExperience;
          // if(req.body.licenses) user.licenses = req.body.licenses;
          if(req.body.role) user.role = req.body.role;

          // ===================================
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json({ err: err });
              return;
            }
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "Registration Successful!" });
            });
          });
        }
      });
    }
    else {
      throw new Error('Email Already Exist');
    }
  })
  .catch(err => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.json({ err: {message:'Email Already Exist'} });
    return;
  })
});

router.post("/login", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) 
      return next(err);
    if(!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "Login unsuccessful!" , err: info});
    }
    req.logIn(user, (err) => {
      if(err) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "Login unsuccessful!" , err: 'Could not log in user!'});
        }
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Login successful!" , token: token});
    })
  }) (req,res, next);
});

router.get("/logout", cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, status: "logout successful!"});
  } else {
    return res.status(403).json({error: 'You are not logged in!'});
  }
});

router.get('/myProfile', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  console.log(req.user);
  User.findById(req.user._id)
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
})

router.put('/editProfile', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    $set: req.body
  }, {new: true})
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
})

router.get('/:userId', cors.corsWithOptions, (req, res, next) => {
  User.findById(req.params.userId)
    .then(user => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    })
    .catch(err => next(err))
})

router.post('/licenses', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
        if (user != null) {
            user.licenses = user.licenses.concat(req.body);
            user.save()
            .then((user) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user); 
            }, (err) => next(err));       
        }
        else throw new Error('Error!! Try Again');
    }, (err) => next(err))
    .catch((err) => next(err));
})

router.post('/experience', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
        if (user != null) {
          user.workExperience = user.workExperience.concat(req.body);
            user.save()
            .then((user) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(user); 
            }, (err) => next(err));
        }
        else throw new Error('Error!! Try Again');
    }, (err) => next(err))
    .catch((err) => next(err));
})

router.put('/licenses/:licenseId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then(user => {
      const licenses = user.licenses.id(req.params.licenseId);
      if(licenses) {
        if(req.body.title) {
          licenses.title = req.body.title;
        }
        if(req.body.issuedBy) {
          licenses.issuedBy = req.body.issuedBy;
        }
        if(req.body.issuedDate) {
          licenses.issuedDate = req.body.issuedDate;
        }
        if(req.body.expiryDate) {
          licenses.expiryDate = req.body.expiryDate;
        }
        if(req.body.url) {
          licenses.url = req.body.url;
        }
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user); 
          })
      } else {
        throw new Error('License Not Found');
      }
    })
    .catch(err => next(err))
})


router.put('experience/:expId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then(user => {
      const exp = user.workExperience.id(req.params.expId);
      if(exp) {
        if(req.body.title) {
          exp.title = req.body.title;
        }
        if(req.body.description) {
          exp.description = req.body.description;
        }
        if(req.body.period) {
          exp.period = req.body.period;
        }
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user); 
          })
      } else {
        throw new Error('Work Experience Not Found');
      }
    })
    .catch(err => next(err))
})

router.delete('/licenses/:licenseId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then(user => {
      const licenses = user.licenses.id(req.params.licenseId);
      if(licenses) {
        licenses.remove();
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user); 
          })
      }
      else {
        throw new Error('License Not Found');
      }
    })
    .catch(err => next(err))
})

router.delete('experience/:expId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
    .then(user => {
      const exp = user.workExperience.id(req.params.expId);
      if(exp) {
        exp.remove();
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user); 
          })
      }
      else {
        throw new Error('License Not Found');
      }
    })
    .catch(err => next(err))
})

module.exports = router;
