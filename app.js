let express = require('express'),
path = require('path'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
expressValidator = require('express-validator'),
flash = require('connect-flash'),
session = require('express-session'),
passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
mongoose = require('mongoose'),
sessionStore = require('sessionstore').createSessionStore({type:'mongodb'}),
passportSocketIo = require('passport.socketio'),
getBotComment = require('./functions/get-bot-comment')

mongoose.connect('mongodb://localhost/praips')
// let db = mongoose.connection,
routes = require('./routes/index'),
users = require('./routes/users'),
bot = require('./routes/bot')
// Init App
let app = express()

var server = require('http').createServer(app)

let io = require('socket.io').listen(server)
io.use(passportSocketIo.authorize({
	key:'express.sid',
	secret:'secret',
	store:sessionStore,
	fail:onAuthorizeFail
}))

function onAuthorizeFail(data, message, error, accept){
  // if(error)
  //   throw new Error(message);
  // console.log('failed connection to socket.io:', message);
 
  // We use this callback to log all of our failed connections. 
  accept(null, true);
  // console.log(data,message,error)
 
  // OR 
 
  // If you use socket.io@1.X the callback looks different 
  // If you don't want to accept the connection 
  // if(error)
  //   accept(new Error(message));
  // this error will be sent to the user as a special error-package 
  // see: http://socket.io/docs/client-api/#socket > error-object 
}


//View Engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

//BodyParser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

//Set Static Folder
app.use(express.static(path.join(__dirname,'public')))

//Express Session
app.use(session({
	secret:'secret',
	store:sessionStore,
	key:'express.sid',
	saveUninitialized:true,
	resave:true,
	cookie: { path: '/', httpOnly: true, maxAge: 36000000}
}))

app.use(passport.initialize())
app.use(passport.session())

//Express Validator

app.use(expressValidator({
	errorFormatter:function(param,msg,value){
		let namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		while(namespace.length){
			formParam += '['+namespace.shift()+']'
		}
		return {
			param:formParam,
			msg:msg,
			value:value
		}
	}
}))
//Connect Flash
app.use(flash())
app.use(function(req,res,next){
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	res.locals.user = req.user || null
	next()
})

app.use('/',routes)
app.use('/users',users)
app.use('/bot',bot)

app.set('port',(process.env.PORT || 8000))
server.listen(app.get('port'),function(){
	console.log('Server running on port ',app.get('port'))
})

//=== socket io ====
let User = require('./models/user')
let Post = require('./models/post')
let Comment = require('./models/comment')

let connections = []
let activeUsers = []

let activeSocketsByUsername = {}

io.sockets.on('connection',function(socket){
	// console.log('connected!',socket.request.user.logged_in,socket.request.user)
	connections.push(socket)

	if(socket.request.user.username){
		activeSocketsByUsername[socket.request.user.username] = socket
	}

	

	socket.on('disconnect',function(data){
		if(socket.username){
			activeUsers.slice(activeUsers.indexOf(socket.username),1)
			updateActiveUsers()
		}
		connections.splice(connections.indexOf(socket),1)
		if(socket.request.user.username){
			activeSocketsByUsername[socket.request.user.username] = false
		}
		/**********/
		//try with notifying guest
		if(!socket.request.user.username&&socket.username)
			activeSocketsByUsername[socket.username] = false
		/**********/
		// console.log('Disconnected: %s sockets disconnected',connections.length)
	})

	socket.on('new user',function(data,callback){
		callback(true)
		socket.username = data
		activeUsers.push(socket.username)
		updateActiveUsers()
		/**********/
		//try with notifying guest
		if(!socket.request.user.username&&socket.username&&
			!activeSocketsByUsername[socket.username])
			activeSocketsByUsername[socket.username] = socket
		/**********/
	})

	socket.on('new post',function(data,callback){
		Post.findOne().sort({questionNo:-1}).exec(function(err,post){
		if(err) return callback(false)
		post = post||{questionNo:0}
		let newPost = new Post({
			post:data.post,
			date:Date.now(),
			username:socket.request.user.logged_in?socket.request.user.username:socket.username,
			userpic:socket.request.user.logged_in&&socket.request.user.profilepic?socket.request.user.profilepic:'',
			questionNo:post.questionNo+1,
			byGuest:!socket.request.user.logged_in
		})
		
		io.sockets.emit("get new post",newPost)

		newPost.save(function(err){
			if(!err) callback(true)
			// console.log(newPost)
			let botComment = getBotComment(data.post)
			if(botComment){
				addNewComment({
					comment:botComment,
					postId:newPost._id,
				},f=>f,null,'Bot','chatbot.png',false)
			}
		})
	})
	})

	socket.on('new comment',function(data,callback){
		addNewComment(data,callback,socket);
	})
})

function addNewComment(data,callback,socket,username,userpic,byGuest){
	let newComment = new Comment({
		comment:data.comment,
		date:Date.now(),
		username:username||(socket.request.user.logged_in?socket.request.user.username:socket.username),
		userpic:userpic||(socket.request.user.logged_in&&socket.request.user.profilepic?socket.request.user.profilepic:''),
		postId:data.postId,
		byGuest:byGuest===false?false:(!socket.request.user.logged_in)
	})
	Post.findById(data.postId,function(err,post){
		if(post){
			post.commentCount+=1;
			post.save()
			if((username||(socket.request.user.username||socket.username)!=post.username)&&
				activeSocketsByUsername[post.username]){
				activeSocketsByUsername[post.username].emit('comment notification',{
					actor:newComment.username,
					commentText:newComment.comment,
					postText:post.post,
					qNo:post.questionNo,
				})
			}
		}
	})
	io.sockets.emit('get new comment',newComment)
	newComment.save(function(err){
		if(!err) callback(newComment._id)
		// console.log(newComment)
	})
}

app.get('/api/posts/:no',function(req,res){
	let no = 0
	if(!isNaN(1*req.params.no)) no = 1*req.params.no

	Post.find({}).sort({questionNo:-1}).skip(no).limit(30).exec(function(err,data){
		if(err) return res.send('Error while fetching' + err)
		return res.send(data)
	})

})

app.get('/api/comments/:postid',function(req,res){
	Comment.find({postId:req.params.postid},function(err,data){
		if(err) return res.send("Error while getting comments"+err)
		return res.send(data)
	})
})

app.get('/api/thisIsMyAnswer/:postId/:commentId',function(req,res){
	Post.findById(req.params.postId,function(err,post){
		if(err) return res.send(false)
		Comment.findById(req.params.commentId,function(er,comment){
			// if(er||post._id!=comment.postId) return res.send(false)
			//one more SECURITY check NEEDED here to ensure it's coming from the
			//right user...
			comment.isAnswer = true
			comment.save(function(err){
				if(err) return res.send(false)
				post.isAnswered = true
				post.save(function(err){
					if(err) return res.send(false);
					io.sockets.emit('get answered',{
						postId:req.params.postId,
						commentId:req.params.commentId
					})
					return res.send(true)
				})
			})
		})
	})
})



function updateActiveUsers(){
	io.sockets.emit('get users',activeUsers)
}

app.get('/api/deletePost/:postId',function(req,res){
	//SECURITY CHECKS TO BE ADDED
	//NOT SECURED AT THE MOMENT, ANYBODY CAN DELETE WITH A GET REQUEST
	Post.findById(req.params.postId,function(error,post){
		if(error||!post) return res.send(false);
		post.remove(function(){
			res.send(true);
			io.sockets.emit('post deleted',req.params.postId);
		})
	})
})

app.get('/api/deleteComment/:commentId',function(req,res){
	//SECURITY CHECKS TO BE ADDED
	//NOT SECURED AT THE MOMENT, ANYBODY CAN DELETE WITH A GET REQUEST
	Comment.findById(req.params.commentId,function(err,comment){
		if(err||!comment) return res.send(false);
		let postId = comment.postId;
		comment.remove(function(_err){
			if(_err) return res.send(false);
			Post.findById(postId,function(e,post){
				if(e||!post) return res.send(false);
				post.commentCount--;
				post.save(function(){return res.send(true)});
				io.sockets.emit('comment deleted',{
					commentId:req.params.commentId,
					postId
				})
			})
		})
	})
})

app.get(['/','*'],function(req,res){
	User.find({}).count().exec(function(err,noOfUsers){
		Post.find({}).count().exec(function(error,noOfPosts){
			let appData = {state:{}}
			appData.loggedIn = req.isAuthenticated()
			appData.noOfUsers = noOfUsers
			appData.noOfPosts = noOfPosts
			appData.user = req.user
			res.render('index',{appData})
		})
	})
})
