//-----------------------------------------------------
// Import
//-----------------------------------------------------

// React
import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, NavLink} from 'react-router-dom'
import NotificationSystem from 'react-notification-system'


// Components   
import LeftBar from './components/left-bar'
import SignUp from './components/sign-up'
import Login from './components/login'
import AboutCommunity from './components/about-community'
import CommunityQA from './components/community-qa'
import ChatBot from './components/chatbot'



if(window.error.length){
	let html = '<div>'
	window.error.forEach(e=>{
		if(typeof e == 'string') html+='<div class="alert alert-danger">'+e+'</div>'
		else if(typeof e == 'object' && e.errors.length)
			e.errors.forEach(_e=>html+='<div class="alert alert-danger">'+_e.msg+'</div>')
	})
	html+='</div>'
	// window.$.alert(html)

	window.errorHtml = html;

	window.loginErrors = location.pathname == '/login';
	window.signupErrors = location.pathname == '/signup';
}


window.aboutCommunityHTML = `
	<center><h4 class="littleBoldH4">Try Our Community Q&A</h4></center>
	<p style="padding-left:15px">Here's how it works:</p>
	<ol class="about">
		<li>Ask a question related to XX.</li>
		<li>If there's a relevant FAQ, the XX bot will automatically reply.</li>
		<li>Your question will be delivered to our community. 
			If we're online, we're usually pretty quick to reply.</li>
		<li>While you're waiting, search your question to see previous Q&As.</li>
	</ol>
`
window.aboutChatBotHTML = `
	<center><h4 class="littleBoldH4">Try Our ChatBot</h4></center>
	<p style="padding-left:15px">Here's how it works:</p>
	<ol class="about">
		<li>Ask a question related to XX.</li>
		<li>Type '/start' to restart the bot.</li>
		<li>Type '/human' if you want to connect to a human.</li>
	</ol>
`

window.guestId = function(socketId){
	if(localStorage.getItem("guestId")&&
		localStorage.getItem('guestId')!='undefined')
		return localStorage.getItem("guestId")
	else{
		localStorage.setItem("guestId",socketId)
		return socketId
	}
}

let appData = window.appData
let io = window.io
window.socket = io.connect()
socket.emit("new user",appData.user?appData.user.username:guestId(socket.id),console.log)
 
let initialMessages = [{
	username:'bot',
	text:'Welcome to Praips! this is XXXBot, nice to meet you...',
	userpic:'chatbot.png',
}]

let activePanes = {
	'/':'bot',
	'/signup':'signup',
	'/login':'login',
	'/community-qa':'qa'
}


//-----------------------------------------------------
// Main App Class Component
//-----------------------------------------------------


class App extends React.Component{


	//-----------------------------------------------------
	// State
	//---------------------------------------------------

	constructor(props){
		super(props)
		this.state = {
			activePane:activePanes[location.pathname],
			...appData.state,			
			currentComments:[],
			comments:{},
			visiblePostComments:{},
			

			//-----------------------------------------------------
			// Chatbot
			//-----------------------------------------------------
			
			messages:[],
			initialMessages,			// The 1st message sending by chatbot
			tempMessage:'',				// The message entered by a human (user, visitor) in Form input


			//-----------------------------------------------------
			// Community Q-A
			//---------------------------------------------------
			
			tempQuestion:'',       		// Question entered in Form input
			visibleAllMeTab:'all',		// Which tab is selected : "ALL" OR "ME"
			
			// ALL
			posts:[],              		// "All" posts
			commentCounts:{},			// Number of comments for each post
			
			// ME (user loggedIn)
			myPosts:[],           		// "Me" posts			
			answeredIds:{},				// Questions submitted by ME and marked "Answered" 

			
			
			//-----------------------------------------------------
			// Left Bar
			//-----------------------------------------------------

			acVisiblePane:'about', 		// Which tab is selected : "ABOUT" OR "COMMUNITY"

			// About tab
			aboutCommunityHTML,

			// Community Tab
			users:[],					// List of users
			
			
		}
	}



	//-----------------------------------------------------
	// Functions
	//-----------------------------------------------------


	handlePost = (e)=>{
		e.preventDefault()
		// console.log("Lavi is awesome!")
		if(!this.state.tempQuestion.trim().length) return;
		socket.emit('new post',{post:this.state.tempQuestion},(data)=>{
			if(data)
				this.setState({tempQuestion:''});
		})
	}

	handleComment = (comment,postId)=>{
		// console.log(comment,postId)
		if(!comment.trim().length) return;
		socket.emit('new comment',{comment,postId},(data)=>{  
			document.querySelector('#comment_'+postId).value=''
		})
	}

	updatePosts = (skip)=>{
		window.$.get('/api/posts/'+skip,(posts,status)=>{
			if(status!='success') return false
			// console.log(posts)
			this.setState({posts})
		})
	}

	markAnswered = (postId,commentId)=>{
		let state = this.state
		// console.log(state)
		window.$.get(`/api/thisIsMyAnswer/${postId}/${commentId}`,(data)=>{
			if(data===true){
				let posts = state.posts.slice()
				posts.forEach(post=>{
					if(post._id == postId)
						post.isAnswered=true
				})
				let answeredIds = state.answeredIds
				answeredIds[postId]=true
				this.setState({posts,
					answeredIds:{...answeredIds}})
				window.$.get('/api/comments/'+postId,comments=>{	
					let updatedComments = JSON.parse(
						JSON.stringify(state.comments))
					updatedComments[postId] = comments
					this.setState({
						comments:updatedComments
					})
					// console.log(comments,updatedComments)
				})
			}
		})
	}

	handleMessage = () => {
		let messages = this.state.messages.slice()
		let message = this.state.tempMessage.trim()
		
		if(!message) return;
		if(message.toLowerCase()=='/start') return this.setState({messages:initialMessages,tempMessage:''});
		if(message.toLowerCase()=='/human') return window.$('.qa-icon').click()&&this.setState({tempMessage:''});


		messages.push({
			text:message,
			username:window.appData.user&&window.appData.user.username||'guest',
			userpic:window.appData.user&&window.appData.user.profilepic
		})
		this.setState({messages,tempMessage:''})
		requestAnimationFrame(function(){
			var objDiv = document.querySelector('.messagesDiv');
			objDiv.scrollTop = objDiv.scrollHeight;
		})

		window.$.post('/bot',{message},(response)=>{
			// console.log(response)
			this.setState({chatbot_typing:true})
			setTimeout(()=>{
				messages = this.state.messages.slice()
				message = response
				messages.push({
					text:message,
					username:'bot',
					userpic:'chatbot.png'
				})
				this.setState({chatbot_typing:false,messages})
				requestAnimationFrame(function(){
					var objDiv = document.querySelector('.messagesDiv');
					objDiv.scrollTop = objDiv.scrollHeight;
				})
			},600)
		})
	}


	//-----------------------------------------------------
	// Component LifeCycle
	//-----------------------------------------------------
	
	componentDidMount(){

		window._notificationSystem = this._notificationSystem = this.refs.notificationSystem

		if(this.state.activePane=='bot'){
			window.$(".bot-icon").click()
		}

		window.addEventListener('load',()=>{
			this.updatePosts(0)
		})

		socket.on('get new post',(newPost)=>{
			let posts = this.state.posts.slice()
			posts.unshift(newPost)
			posts.sort((a,b)=>b.questionNo-a.questionNo)

			let myPosts = this.state.myPosts.slice()
			if(appData.user&&appData.user.username==newPost.username){
				myPosts.unshift(newPost)
			}

			this.setState({posts,myPosts})
		})

		socket.on('get new comment',(newComment)=>{
			// console.log(newComment)
			let comments = {...this.state.comments}
			let postId = newComment.postId
			comments[postId] = [...(this.state.comments[postId]||{}),newComment]
			let seen = {}

			comments[postId] = comments[postId].filter(a=>{
				if(!seen[a._id]){
					seen[a._id]=true
					return a
				}
			})
			let commentCounts = {...this.state.commentCounts}
			let commentCount = 0;

			let post = this.state.posts.filter(p=>p._id==newComment.postId)[0]
			||(this.state.myPosts.length&&this.state.myPosts.filter(p=>p._id==newComment.postId)[0])
			// console.log('POST: ',post)
			if(post){
				// console.log(commentCounts[post._id]);

				commentCount = typeof commentCounts[post._id]!="undefined"
								?commentCounts[post._id]
								:post.commentCount
				commentCount++
			}
			commentCounts[newComment.postId] = commentCount
			this.setState({
				comments,
				commentCounts
			})

		})  

		socket.on('get answered',(data)=>{
			let postId = data.postId, 
			commentId = data.commentId;
			let answeredIds = {...this.state.answeredIds}
			answeredIds[postId] = true
			let comments = {...this.state.comments}
			if(comments[postId]&&comments[postId].length){
				comments[postId].map(comment=>{
					if(comment._id==commentId)
						comment.isAnswer = true
						return comment
				})
			}
			this.setState({
				answeredIds,
				comments
			})
		})

		socket.on('comment notification',data=>{
			this._notificationSystem.addNotification({
				title:`${data.actor} commented on your Q${data.qNo}`,
				message:data.commentText.slice(0,300),
				level:'info',
				position:'bl',
			})
		})

		window.$.get('/api/allUsers',(users,status)=>{
			if(status!='success') return false;
			this.setState({users:users||[]})
		})

		socket.on('post deleted', postId => {
			let posts = this.state.posts.slice(),
				myPosts = this.state.myPosts.slice()

			posts = posts.filter(post=>post._id!=postId);
			myPosts = myPosts.filter(post=>post._id!=postId);

			this.setState({myPosts,posts});
		})

		socket.on('comment deleted',({commentId,postId})=>{
			let comments = {...this.state.comments}
			let commentCounts = {...this.state.commentCounts}

			let post = this.state.posts.filter(p=>p._id==postId)[0]
			||(this.state.myPosts.length&&this.state.myPosts.filter(p=>p._id==postId)[0])
			// console.log('POST: ',post)

			let commentCount = 0;
			if(post){
			commentCount = typeof commentCounts[postId]!="undefined"
								?commentCounts[postId]
								:post.commentCount
			--commentCount
			}
			commentCounts[postId] = commentCount;


			// commentCounts[postId]&&(commentCounts[postId]=--commentCounts[postId])

			comments[postId]&&(comments[postId] = comments[postId].
												filter(comment=>comment._id!=commentId))

			// console.log(commentId,postId)
			this.setState({commentCounts,comments});
		})
	}


	//-----------------------------------------------------
	// Render the app
	//-----------------------------------------------------

	render(){
		return (
			<BrowserRouter>
				<div className="app container">
					<div className="row">

						{/*  
						//==========================
						// Left
						//==========================
						*/}
						
						<div className="col-xs-2 col-lg-1">
							<LeftBar state={this.state} onChange={obj=>this.setState(obj)} />
						</div>

						
						{/* 
						//==========================
						// Center
						//==========================
						*/}
						
						<div className="col-xs-6 col-lg-7">

							{/* 
							//==========================
							// Header : Search
							//==========================
							*/}
							
							<form>
								<div className="input-group">
									<input type="text" className="form-control" placeholder="What are you looking for?" />
									<div className="input-group-btn">
										<button className="btn btn-default" type="submit">
											<i className="glyphicon glyphicon-search"></i>
										</button>
									</div>
								</div>
							</form>


	   						{/* 
							//==========================
							// Main Div
							//==========================
							*/}
							<div className="maindiv calc white">

								{/* 
								//==========================
								// Chatbot Page
								//==========================
								*/}
								<Route 
									exact path="/" 
									render={()=>
										<ChatBot 
											state={this.state} 
											onChange={obj=>this.setState(obj)}
											handleMessage={this.handleMessage}
										/> 
									}
								/>   
	    

								{/* 
								//==========================
								// Community Q&A Page
								//==========================
								*/}
								<Route  
									exact path="/community-qa" 
									render={()=>
										<CommunityQA 
											state={this.state} 
											onChange={obj=>this.setState(obj)} 
											handlePost={this.handlePost} 
											handleComment={this.handleComment}
											markAnswered={this.markAnswered}
											lengthQuestion={50}  
										/>
									}  
								/>


								{/* 
								//==========================
								// Login Page
								//==========================
								*/}

								<Route 
									exact path="/login" 
									render={()=>
										<Login 
											state={this.state} 
											onChange={obj=>this.setState(obj)} 
										/>
									} 
								/>


								{/* 
								//==========================
								// Signup Page
								//==========================
								*/}

								<Route 
									exact path="/signup" 
									render={()=>
										<SignUp 
											state={this.state} 
											onChange={obj=>this.setState(obj)} 
										/>
									} 
								/>

							</div> {/* End Main Div */}


						</div> {/* End Center Div */}

						
						{/* 
						//==========================
						// Right
						//==========================
						*/}

						<div className="col-xs-4">

							{/* 
							//============================================
							// Header : Login/Signup OR Profile User
							//============================================
							*/}

							{!appData.loggedIn?

							/* If User not loggedIn, then display the both buttons : Login and signup */

								<div className="row">

									{/* 
									//==========================
									// Login Button
									//==========================
									*/}

									<div style={styles.loginDiv} className="loginbutton-parent col-xs-6">
										<NavLink exact to="/login">
											<button 
												onClick={()=>this.setState({activePane:'login'})} 
												className="green loginbutton btn btn-success">
												Login
											</button>
										</NavLink>
									</div>
	 
									{/* 
									//==========================
									// SignUp Button
									//==========================
									*/}

									<div style={styles.loginDiv} className="loginbutton-parent col-xs-6">
										<NavLink exact to="/signup">
											<button 
												onClick={()=>this.setState({activePane:'signup'})} 
												className="green loginbutton btn btn-success">
												Sign up
											</button>
										</NavLink>
									</div>
								</div>: // End div for user not loggedIn

							
							/* Else display the Profile User Bar */


								<div className="row" style={{display:'flex'}}>

									{/* 
									//==============================
									// User Picture + User Name  
									//==============================
									*/}

									<div className="col-xs-8" style={{minHeight:'100%',paddingRight:0}}>
										<div className="userpill" style={{minHeight:'100%'}}>

											{/* 
											//==========================
											// User Picture
											//==========================
											*/}

											<div 
												style={{
													background:													
														appData.user.profilepic? // If user has uploaded a picture 														
															`url(/profilepics/${appData.user.profilepic})` // display the profile picture													
															:'rgba(0,0,0,.3)', // else choose a grey bg
													backgroundSize:'cover',
													backgroundPosition:'center'
												}} 
												className="profilepic"
											>
												{appData.user.profilepic?'':appData.user.username.slice(0,2)} {/* Div content */}
											</div>


											{/* 
											//==========================
											// User Name
											//==========================
											*/}

											<div className="username">{appData.user.username}</div>


											{/* 
											//==========================
											// Upload a picture
											//==========================
											*/}

											<div 
												onClick={()=>document.querySelector('#updatePicForm').avatar.click()} 
												className="updatepic fa fa-camera">
											</div>
											<form 
												id="updatePicForm" 
												style={{display:'none'}} 
												encType='multipart/form-data'
											>
												<input 
													id="updatePicInput" 
													onChange={updatePic} 
													type="file" 
													accept="image/*" 
													name="avatar" 
												/>
											</form>
 

										</div> {/* End div userpill*/}

									</div> {/* End div user picture and username */}


									{/* 
									//==============================
									// Logout Button
									//==============================
									*/}

									<div className="col-xs-4">
										<a 
											style={{float:'right',minWidth:'100%'}} 
											className="btn btn-success green" 
											href="/users/logout"> LOGOUT 
										</a>
									</div>


								</div> /* End div the Profile User Bar*/
							

							} {/* End div condition Header*/}  


							{/* 
							//==============================
							// TAB Right
							//==============================
							*/}

							<div className="calc white rightdiv">
								<AboutCommunity 
									state={this.state} 
									onChange={obj=>this.setState(obj)} />
							</div>
						
						</div> {/* End Right Div */}

					</div> {/* End Div App */}


					{/* 
					//==============================
					// Notifications
					//==============================
					*/}

					<NotificationSystem ref="notificationSystem" allowHTML={true} />				
				</div>
			</BrowserRouter>
		) // End return App
	} // End render App
} // End Class Component App





function updatePic(){
	let formData = new FormData(document.querySelector('#updatePicForm'))
	window.$.confirm({
	  useBootstrap:false,
	  boxWidth:"40%",
	    content: function () {
	        var self = this;
	        return window.$.ajax({
	    url:'/api/uploadProfileImage',
	    type:"POST",
	    data:formData,
	    cache:false,
	    contentType:false,
	    processData:false
	  }).done(function (response) {
	            
	            self.setContent(response);
	            // window.location.href = `/${window.appData.actor.username}`

	            // console.log(response)
	        }).fail(function(){
	            self.setContent('Something went wrong.');
	        });
	    }
	})
}


const styles = {
	loginDiv:{}
}


ReactDOM.render(<App />,document.getElementById('root'))
