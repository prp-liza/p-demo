let express = require('express'),
router = express.Router()

//image uploading for profile
let maxSize = 1000*1024
let multer = require('multer')
let path = require('path')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profilepics')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
  }
})
let upload = multer({
	fileFilter: function (req, file, cb) {

    var filetypes = /jpeg|jpg|png|gif/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes);
  },
  storage:storage,
  limits:{
  	fileSize:maxSize
  }
})
.single('avatar')

router.post('/api/uploadProfileImage',ensureAuthenticated,
	function(req,res){
		upload(req,res,function(err){
			if(err){
				//some error occurred.
				console.log(err)
				return res.end('Some error happened!'+err)
			}
			if(!req.file) return res.send('File must not be empty')
			console.log(req.file)
			req.user.profilepic = req.file.filename
			req.user.save(function(err){
				if(err) return res.send('Some error happened'+err)
				return res.send('Image Uploaded!')
			})
			
			//everything went fine.
		})
})
//end image uploading for profile

let User = require('../models/user')
let Post = require('../models/post')

// router.get('/',function(req,res){
// 	User.find({}).count().exec(function(err,noOfUsers){
// 		Post.find({}).count().exec(function(error,noOfPosts){
// 			let appData = {state:{}}
// 			appData.loggedIn = req.isAuthenticated()
// 			appData.noOfUsers = noOfUsers
// 			appData.noOfPosts = noOfPosts
// 			appData.user = req.user
// 			res.render('index',{appData})
// 		})
// 	})
// })

router.get('/api/postsByUser/',function(req,res){
	if(!req.isAuthenticated()) return res.send(false)

	Post.find({username:req.user.username}).sort({questionNo:-1}).exec(function(err,posts){
		if(err) return res.send(false)
		res.send(posts)
	})
})

router.get('/api/allUsers',function(req,res){
	User.find({}).exec(function(err,users){
		if(err||!users) return res.send(false);
		return res.send(users.map(user=>({username:user.username,userpic:user.profilepic||''})))
	})
})


function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next()
	}else{
		req.flash('error_msg','You are not logged in')
		res.redirect('/')
	}
}




module.exports = router
