import React from 'react'

function CommunityTab(props){
	let users = props.users
	return (
		<div>
			{users.map((user,i)=><Card key={i} user={user} />)}			
		</div>
	)
}

function Card(props){
	let user = props.user
	return (
		<div className="row">
			<div className="col-xs-2 col-lg-2">
				<div style={{
					background:user.userpic?`url(/profilepics/${user.userpic})`:'rgba(0,0,0,.4)',
					backgroundPosition:'center',
					backgroundSize:'cover',
				}} className='userpic'>
					{user.userpic?'':(
						user.username.slice(0,2)
					)}
				</div>
			</div>
			<div className="col-xs-10 col-lg-10">
				<div style={styles.username} className="row post_username">
					{user.username}
				</div>
			</div>
		</div>
	)
}

const styles = {
	username:{
		padding:'10px 10px'
	}
}

export default CommunityTab
