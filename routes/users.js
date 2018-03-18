let router = require('express').Router()
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let User = require('../models/user')

router.get('/',function(req,res){
	res.send('Awesome!')
})



passport.use(new LocalStrategy(
  function(username, password, done) {
  	User.getUserByUsername(username,function(err,user){
  		if(err) throw err;
  		if(!user){
  			return done(null,false,{message:'Unknown User'})
  		}
  		User.comparePassword(password,user.password,function(err,isMatch){
  			if(err) throw err
  			if(isMatch){
  				return done(null,user)
  			}else{
  				return done(null, false, {message:'Invalid password'})
  			}
  		})
  	})
}))

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/register',function(req,res){
	// let name = req.body.name,
	email = req.body.email,
	username = req.body.username,
	password = req.body.password
	// password2 = req.body.password2

	if(typeof username != "string" ||
		/[^a-z_]/.test(username)) return res.send('Invalid username')

	// req.checkBody('name','Name is required').notEmpty()
	req.checkBody('email','Email is required').notEmpty()
	req.checkBody('email','Email is not valid').isEmail()
	req.checkBody('username','Username is required').notEmpty()
	req.checkBody('password','Password is required').notEmpty()
	// req.checkBody('password2','Passwords do not match').equals(req.body.password)

	let errors = req.validationErrors()
	if(errors){
		req.flash('error',{errors})
		// res.render('index',{
		// 	errors:errors
		// });
		res.redirect('/signup')
	}else{
		User.find({username:username}).count().exec(function(err,data){
			if(data){
				req.flash('error','username taken')
				return res.redirect('/signup')
			}
			User.find({email:email}).count().exec(function(err,data){
				if(data){
					req.flash('error','Email Taken')
					return res.redirect('/signup')
				}
				let newUser = new User({
					// name:name,
					email:email,
					username:username,
					password:password,
					// joinedOn:Date.now()
				})
				User.createUser(newUser,function(err,user){
					if(err) throw err
					console.log(user)
					passport.authenticate('local',{
		  				successRedirect:'/',failureRedirect:'/',failureFlash:true
		  			})(req,res,function(){
		  				res.redirect('/' + req.body.username);
		  			})	
				})
				// req.flash('success_msg','You are registered and can now login')
				// res.redirect('/users/login')
			})
		})
	}
})

router.post('/login',
  passport.authenticate('local',{
  	successRedirect:'/',failureRedirect:'/login',failureFlash:true
  }),
  function(req, res) {
    res.redirect('/');
})


router.get('/logout',function(req,res){
	req.logout()
	req.flash('success_msg','You are logged out')
	res.redirect('/')
})

module.exports = router
