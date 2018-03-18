let mongoose = require('mongoose')

let CommentSchema = mongoose.Schema({
	username:{
		type:String,
		index:true,
	},
	userpic:String,
	postId:{
		type:mongoose.Schema.Types.ObjectId,
		index:true,
	},
	date:Number,
	comment:String,
	isAnswer:{
		type:Boolean,
		default:false
	},
	byGuest:Boolean
})

let Comment = module.exports = mongoose.model('Comment',CommentSchema)
