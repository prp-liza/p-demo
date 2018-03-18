let mongoose = require('mongoose')

let PostSchema = mongoose.Schema({
	username:{
		type:String,
		index:true
	},
	userpic:{
		type:String,
	},
	date:Number,
	post:String,
	commentCount:{
		type:Number,
		default:0
	},
	isAnswered:{
		type:Boolean,
		default:false
	},
	questionNo:Number,
	byGuest:Boolean
})

let Post = module.exports = mongoose.model('Post',PostSchema)

module.exports.getPostsByUsername = function(username,callback){
	Post.find({username},callback)
}
