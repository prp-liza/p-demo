import React from 'react'
import Post from './post'
 

function CommunityQA(props){
	return (
		<div className="community-qa">

			{/* 
			//==========================
			// Header
			//==========================
			*/}

			<h2 style={{marginTop:0}}>Community Q&A Demo</h2>
			<p>Ask XXX related questions, happy testing!</p>


			{/* 
			//==========================
			// Post a question
			//==========================
			*/}

			<form
				autoComplete='off'
				onSubmit={props.handlePost} 
				className="postbox"
			>
				<div className="row">

					{/* 
					//==========================
					// Question icon
					//==========================
					*/}

					<div 
						style={{fontSize:'2.5em',padding:'0 .5em',}} 
						className="green-text col-xs-1 fa fa-question-circle"
					>
					</div>

					{/* 
					//==========================
					// Input Question
					//==========================
					*/}

					<div className="col-xs-11">
						<input
							autoFocus
							id="questionInput"
							value={props.state.tempQuestion}
							onChange={()=>props.onChange({tempQuestion:document.querySelector('#questionInput').value})} 
							placeholder="Ask your question" 
							className="form-control"
							maxLength={props.lengthQuestion}

						/>
						<div className="length-question">
							{props.lengthQuestion} 
						</div>
					</div>
					
				</div>

				{/* 
				//==========================
				// Submit Button
				//==========================
				*/}

				<div style={{textAlign:'right'}}>
					<button 
						type="submit"
						style={{
							padding:'3px 10px',
							marginTop:'10px',
							borderRadius:'6px'
						}} 
						className="green btn btn-success">POST
					</button>
				</div>

			</form> {/* End form ask a question*/} 


			{/* 
			//============================================
			// Number of posts + Number of users
			//============================================
			*/}

			<div 
				style={{
					paddingTop:'.3em',
					marginTop:'1em',
					minHeight:'40px'
				}}
			>
				
				{/* 
				//==========================
				// Number of posts
				//==========================
				*/}

				<div style={{display:'inline-block',float:'right'}}>
					<span className='count'>
						{window.appData.noOfPosts}
					</span>
					<span className="fa fa-comments">
					</span>
				</div>


				{/* 
				//==========================
				// Number of users
				//==========================
				*/}

				<div style={{display:'inline-block',float:'right'}}>
					<span className='count'>
						{window.appData.noOfUsers}
					</span>
					<span className="fa fa-group">
					</span>
				</div>

			</div> {/* End div nb posts + users*/} 


			{/* 
			//============================================
			// All and Me posts
			//============================================
			*/}
			
			<div className='all_me' style={{borderBottom:'1px solid rgba(0,0,0,.2)'}}>

				{/* 
				//=====================
				// All posts
				//=====================
				*/}

				<span 
					className={`${props.state.visibleAllMeTab=='all'?'active':''}`} 
					onClick={()=>{
						props.onChange({
							visibleAllMeTab:'all'
						})
					}}
				>
					ALL
				</span>


				{/* 
				//=====================
				// Me posts
				//=====================
				*/}

				<span 
					className={`${props.state.visibleAllMeTab=='me'?'active':''}`} 
					onClick={()=>{
						
						if(!window.appData.loggedIn) 
							return window.$.alert('Login or signup to access.')
						
						window.$.get('/api/postsByUser',function(data,status){
							if(status!='success') 
								return window.$.alert('Some error occurred while fetching posts')
							props.onChange({
								myPosts:data,
								visibleAllMeTab:'me'
							})
						})

					}}
				>
					ME
				</span>


			</div> {/* End div All and Me posts */} 


			{/* 
			//=====================
			// Display Posts + Comments
			//=====================
			*/}

			<div>
				
				{/* 
				//========================
				// if "ALL" is selected
				//========================
				*/}
				
				{(props.state.visibleAllMeTab=='all'? 
					props.state.posts:props.state.myPosts).map(post=>(
						<Post 
							state={props.state} 
							onChange={props.onChange} 
							handleComment={props.handleComment} 
							markAnswered={props.markAnswered}
							post={post} key={post._id} 
						/>
					))
				}

				{/* 
				//========================
				// Load more posts
				//========================
				*/}
				
				{props.state.visibleAllMeTab=='all'&&
					props.state.posts.length!=0&&
					props.state.posts[props.state.posts.length-1].questionNo>1&&
				
					<div style={styles.loadMore}>
						<center>
							{!props.state.loadingMore?
								<a onClick={()=>{
									props.onChange({
										loadingMore:true
									})
									window.$.get('/api/posts/'+props.state.posts.length,(posts,status)=>{
										if(status!='success') return false
										// console.log(posts)
										props.onChange({posts:props.state.posts.concat(posts),loadingMore:false})
									})
								}}>
									Load More Posts
								</a>:
								<a>
									Loading...
								</a>
							}
						</center>

					</div> /* End div load more posts */ 
				}
			</div> {/* End div display posts + comments */} 
		
		</div> /* End div community q-a */ 

	) /* End return */ 


} /* End function */ 


const styles={
	loadMore:{
		padding:'15px'
	}
}

export default CommunityQA
