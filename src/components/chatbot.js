import React from 'react'

function ChatBot(props){
	return (
		<div className="chatbotContainer">
			<div className="chatbotHeading">
				XXXBot {props.state.chatbot_typing&&<span className="chatbot_typing">Typing...</span>}
			</div>
			<div className="messagesDiv">
				{
					props.state.messages.map((message,i)=>(
						<Message message={message} key={i} />
					))
				}
			</div>
			<div className="sendMessageDiv">
				<form autoComplete='off' onSubmit={(e)=>{
					e.preventDefault()
					props.handleMessage()
					}}>
				  <div className="input-group">
				    <input
				    	autoFocus
				    	value={props.state.tempMessage}
				    	onChange={()=>props.onChange({
				    		tempMessage:document.querySelector('#sendMessage').value
				    	})} 
				    	id='sendMessage' 
				    	type="text" 
				    	className="form-control" 
				    	placeholder="Enter Your Message" />
				    <div className="input-group-btn">
				      <button className="btn btn-default" type="submit">
				        <i className="fa fa-paper-plane-o"></i>
				      </button>
				    </div>
				  </div>
				</form>
			</div>
		</div>
	)
}

function Message(props){
	return (
		<div className="messageWrapper" style={{maxWidth:'93%',margin:'auto'}}>
		{props.message.username=='bot'?
			<div className="row messageRow leftMessageRow">
				<div className="col-xs-2 col-lg-1">
					<div style={{
						background:props.message.userpic?`url(/profilepics/${props.message.userpic})`:'rgba(0,0,0,.4)',
						backgroundPosition:'center',
						backgroundSize:'cover',
					}} className='userpic whiteBack'>
						{props.message.userpic?'':(
							props.message.username.slice(0,2)
						)}
					</div>
				</div>
				<div className="col-xs-7 col-lg-8 message left" dangerouslySetInnerHTML={{
					__html:props.message.text
				}}>	
				</div>
				<div className="col-xs-3">
				</div>
			</div>:
			<div className="row messageRow rightMessageRow">
				<div className="col-xs-3">
				</div>
				<div className="col-xs-7 col-lg-8 message right" dangerouslySetInnerHTML={{
					__html:props.message.text
				}}>	
				</div>
				<div className="col-xs-2 col-lg-1">
					<div style={{
						background:props.message.userpic?`url(/profilepics/${props.message.userpic})`:'rgba(0,0,0,.4)',
						backgroundPosition:'center',
						backgroundSize:'cover',
					}} className='userpic'>
						{props.message.userpic?'':(
							props.message.username.slice(0,2)
						)}
					</div>
				</div>
			</div>
		}
		</div>
	)
}

export default ChatBot
