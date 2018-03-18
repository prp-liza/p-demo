import React from 'react'

import Errors from './display-errors'

function SignUp(props){
	return (		

		<div className="center-content">
			<div className="error-parent">{window.signupErrors&&<Errors />}</div>
			<h3 className='center-text bold'>Create An Account</h3>
			<form id="signup-form" method="post" action="/users/register" autoComplete="off">
				<div className="input-group">
				    <span className="input-group-addon"><i className="green-text glyphicon glyphicon-user"></i></span>
				    <input id="username" type="text" className="form-control" name="username" placeholder="Username" />
				</div>
				<div className="input-group">
				    <span className="input-group-addon"><i className="green-text glyphicon glyphicon-envelope"></i></span>
				    <input id="email" type="text" className="form-control" name="email" placeholder="Email" />
				</div>
				<div className="input-group">
				    <span className="input-group-addon"><i className="green-text glyphicon glyphicon-lock"></i></span>
				    <input id="password" type="password" className="form-control" name="password" placeholder="Password" />
				</div>
				<button type="submit" className="green btn btn-success registerbutton bold">REGISTER NOW</button>
			</form>
		</div>
	)
}

export default SignUp
