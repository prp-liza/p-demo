import React from 'react'
import CommunityTab from './community-tab'


function AboutCommunity(props){
	return (
		<div>
			<div className="row">
				<div className='col-xs-1'></div>
				<div onClick={()=>props.onChange({acVisiblePane:'about'})} className={`col-xs-5 center-text ac-tab ${props.state.acVisiblePane=='about'?"active":''}`}>
					About
				</div>
				<div onClick={()=>props.onChange({acVisiblePane:'community'})} className={`col-xs-5 center-text ac-tab ${props.state.acVisiblePane=='community'?'active':''}`}>
					Community
				</div>
				<div className='col-xs-1'></div>
			</div>
			{(props.state.acVisiblePane=='about')&&<div dangerouslySetInnerHTML={{__html:props.state.aboutCommunityHTML}}></div>}
			{(props.state.acVisiblePane=='community')&&<CommunityTab users={props.state.users} />}
		</div>
	)
}

export default AboutCommunity
