import React from 'react'

function Comments(props){
	let comments = props.comments
	return (
		<div onClick={e=>e.stopPropagation()} className='comments'>
			{comments&&comments.map(
				comment => <Comment post={props.post} 
					state={props.state}
					key={comment._id} 
					markAnswered={props.markAnswered}
					comment={comment} />
			)}
			{(window.appData.user||
				props.post.username==window.guestId(window.socket.id))&&
			<div>
				<form autoComplete='off' onSubmit={(e)=>{
					e.preventDefault()
					props.handleComment(
					document.querySelector('#comment_'+props.postId).value,
					props.postId
					)}}>
				  <div className="input-group">
				    <input id={'comment_'+props.postId} type="text" className="form-control" placeholder="Comment" />
				    <div className="input-group-btn">
				      <button className="btn btn-default" type="submit">
				        <i className="fa fa-paper-plane-o"></i>
				      </button>
				    </div>
				  </div>
				</form>
			</div>
		}
		</div>
	)
}

function Comment(props){

	let comment = props.comment
	let date = new Date(comment.date).toDateString().split(" ")
	date.shift()
	date = date.join(" ")

	return (
		<div>
			<div className="row">
				<div className="col-xs-2 col-lg-1">
					<div style={{
						background:comment.userpic?`url(/profilepics/${comment.userpic})`:'rgba(0,0,0,.4)',
						backgroundPosition:'center',
						backgroundSize:'cover',
					}} className='userpic'>
						{comment.userpic?'':(
							comment.byGuest?'GU':comment.username.slice(0,2)
						)}
					</div>
				</div>
				<div className="col-xs-8 col-lg-9">
					<div className="row post_username">
						{comment.byGuest?"Guest":comment.username}
					</div>
					<div className="row post_date">
						{date}
					</div>	
				</div>
				<div className="col-xs-2">
				</div>
			</div>
			<div className="row">
				<div className="col-xs-2"></div>
				<div className="commentText col-xs-10">
					<span dangerouslySetInnerHTML={{__html:comment.comment}}></span>
					{(!props.state.answeredIds[props.post._id]&&
						!comment.isAnswer&&
						!props.post.isAnswered&&
						props.post.username==
						((window.appData.user&&window.appData.user.username)||
						window.guestId(window.socket.id)))&&
						<div>
							<button 
								onClick={()=>{
									props.markAnswered(props.post._id,comment._id)
								}}
								style={{float:'right',padding:'3px 10px',marginTop:'10px',borderRadius:'6px'}} 
								className="green btn btn-success">
								I got my answer
							</button>
						</div>
					}
					<div>
					{
						comment.isAnswer&&
							<button 
								style={{float:'right',padding:'3px 10px',marginTop:'10px',borderRadius:'6px'}} 
								className="green btn btn-success">
								Answer
							</button>
						
					}
					{comment.username==
						((window.appData.user&&window.appData.user.username)||
						window.guestId(window.socket.id))&&
						!comment.isAnswer&&
						<a className='deleteCommentButton' onClick={e=>{
							e.stopPropagation();
							console.log("Stopped!");
							window.$.get('/api/deleteComment/'+comment._id,console.log);
						}}>Delete</a>
					}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Comments
