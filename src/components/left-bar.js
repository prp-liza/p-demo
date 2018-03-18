import React from 'react'
import { NavLink } from 'react-router-dom'

function LeftBar(props){
	return (
		<div className="left-bar white">
			<div 

			// onClick={()=>props.onChange({activePane:'main',aboutCommunityHTML:window.aboutCommunityHTML})} 

			className="logo icon">
				P
			</div>

			<NavLink exact to="/">
				<div onClick={()=>{
					props.onChange({activePane:'bot',
						aboutCommunityHTML:window.aboutChatBotHTML,
						chatbot_typing:!props.state.bot_started})
					if(!props.state.bot_started){
						setTimeout(()=>{
							props.onChange({
								messages:props.state.initialMessages,
								bot_started:true,
								chatbot_typing:false
							})
						},600)
					}
					requestAnimationFrame(function(){
						var objDiv = document.querySelector('.messagesDiv');
						objDiv.scrollTop = objDiv.scrollHeight;
					})
				}} className={`${props.state.activePane=='bot'?"green":"inactive-icon"} bot-icon`}>
					<span className={`material-icons`}>adb</span>
				</div>
			</NavLink>

			<NavLink exact to="/community-qa">
				<div onClick={()=>props.onChange({activePane:'qa',aboutCommunityHTML:window.aboutCommunityHTML})} className={`${props.state.activePane=='qa'?"green":"inactive-icon"} qa-icon`}>
					<span className="qa-icon fa fa-comments" aria-hidden="true"></span>
				</div>
			</NavLink>
		</div>
	)
}

export default LeftBar
