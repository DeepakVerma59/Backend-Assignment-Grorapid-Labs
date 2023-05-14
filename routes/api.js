
var passport = require('passport');
var config = require('../config/db');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Post = require("../models/post");
const multer = require('multer')


const Storage = multer.diskStorage({
    destination: "uploads",
    filename:(req,file,cb)=>{
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: Storage
}).single("postImage")

router.post('/signup', function(req, res) {
  if (!req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please pass email and password.'});
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });
 
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'User already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/signin', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
    
      User.comparePassword(req.body.password,user.password, function (err, isMatch) {
        if (isMatch && !err) {
        
          var token = jwt.sign(user.toJSON(), config.secret, {
            expiresIn: 604800 // 1 week
          });
          
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

router.get('/signout', passport.authenticate('jwt', { session: false}), function(req, res) {
  req.logout();
  res.json({success: true, msg: 'Sign out successfully.'});
});

router.post('/post', passport.authenticate('jwt', { session: false}), function(req, res) {
  let token = getToken(req.headers);
  if (token) {
      upload(req,res,(err)=>{
          if(err){console.log(err)
      }else{
          let newPost = new Post({
              title: req.body.title,
              description: req.body.description,
              image:{
                  data: req.file.filename,
                  contentType:'image/png'
              }
          });
  
      newPost.save(function(err) {
          if (err) {
              return res.json({success: false, msg: 'Save Post failed.'});
          }
          res.json({success: true, msg: 'Successful created new post.'});
      })}});
  } else {
      return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/post', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Post.find(function (err, posts) {
      if (err) return next(err);
      res.json(posts);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});
router.get('/post/:id', passport.authenticate('jwt', { session: false}), async function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      let singlepost = await Post.findById(req.params.id);
  
    if(!singlepost){
        return res.status(500).json({
            success: false,
            message:"not found"
        })
      }else{
          res.status(200).send(singlepost)
      }
    
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.put('/post/:id', passport.authenticate('jwt', { session: false}), upload, async function(req, res) {
  var token = getToken(req.headers);
  if (token) {
     await Post.findByIdAndUpdate({_id: req.params.id},
      {
        title: req.body.title,
        description: req.body.description,
        image:{
            data: req.file.filename,
            contentType:'image/png'
        }
    },{returnOriginal:false},(err,updatedPost)=>{
        if(err) console.log(err);
    else{
        res.send({
            status:"Sucess",
            result: updatedPost
        })
      }
    })
      }
      else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
})

router.delete('/post/:id', passport.authenticate('jwt', { session: false}), async function(req, res) {
  var token = getToken(req.headers);
  if (token) {
  let delpost = await Post.findById(req.params.id);
  if(!delpost){
      return res.status(500).json({
          success: false,
          message:"not found"
      })
  }
  delpost.deleteOne();
  
  res.status(200).json({
      success:true,
      message:"Deleted"
  })}
    else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
})


getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
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
