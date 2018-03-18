import React from 'react'
import Comments from './comments'

function Post(props){
	let post = props.post
	let date = new Date(post.date).toDateString().split(" ")
	date.shift()
	date = date.join(" ")
	return (
		<div className="post" onClick={()=>{
			console.log('clicked!')
			window.$.get('/api/comments/'+post._id,comments=>{	
				let updatedComments = {...props.state.comments}
				updatedComments[post._id] = comments
				props.onChange({
					comments:updatedComments
				})
				console.log(comments,updatedComments)
			})
		}}>
		<div onClick={()=>{
			let visiblePostComments = {...props.state.visiblePostComments}
			visiblePostComments[post._id]=!props.state.visiblePostComments[post._id]
			props.onChange({visiblePostComments})
		}}>
			<div className="row">
				<div className="col-xs-2 col-lg-1">
					<div style={{
						background:post.userpic?`url(/profilepics/${post.userpic})`:'rgba(0,0,0,.4)',
						backgroundPosition:'center',
						backgroundSize:'cover',
					}} className='userpic'>
						{post.userpic?'':(
							post.byGuest?'GU':post.username.slice(0,2)
						)}
					</div>
				</div>
				<div className="col-xs-8 col-lg-9">
						<div className="row post_username">
							{post.byGuest?"Guest":post.username}
						</div>
						<div className="row post_date">
							{date}
						</div>	
				</div>
				<div className="col-xs-2">
					<strong className="questionNo">Q {post.questionNo}</strong>
				</div>
			</div>
			<div className="post_text">
				{post.post}
			</div>
			<div className="row">
				<div className="col-xs-12">
					{window.appData.loggedIn&&(<span><span className="post_reply_text">Reply</span> | </span>)}

					<span className='post_comment_text'>
					{
						props.state.commentCounts[post._id]!=undefined?props.state.commentCounts[post._id]:(props.state.comments[post._id]?
							props.state.comments[post._id].length:
							post.commentCount)} comments</span>

					{(props.state.answeredIds[post._id]||post.isAnswered)&&(
						<button
							style={{
									float:'right'
								}}
							className="answered">Answered</button>
					)}
					{props.post.username==
						((window.appData.user&&window.appData.user.username)||
						window.guestId(window.socket.id))&&
						<a className="deletePostButton" onClick={e=>{
							e.stopPropagation();
							console.log('stopped!');
							window.$.get('/api/deletePost/'+post._id,console.log);
						}}>Delete</a>
					}
				</div>
			</div>
			</div>
			{props.state.visiblePostComments[post._id]&&
			<Comments 
				handleComment={props.handleComment} 
				comments={props.state.comments[post._id]}
				post={post}
				markAnswered={props.markAnswered} 
				postId={post._id} 
				onChange={props.onChange}
				state={props.state} />
			}
		</div>
	)
}

export default Post
