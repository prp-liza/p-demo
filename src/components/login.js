import React from 'react'

import {NavLink} from 'react-router-dom'

import Errors from './display-errors'

function Login(props){
	return (
		<div className="center-content">
			<div className="error-parent">{window.loginErrors&&<Errors />}</div>
			<h3 className='center-text bold'>Login</h3>
			<form id="login-form" method="post" action="/users/login" autoComplete="off">
				<div className="input-group">
					<span className="input-group-addon"><i className="green-text glyphicon glyphicon-user"></i></span>
					<input id="username" type="text" className="form-control" name="username" placeholder="Username" />
				</div>
				<div className="input-group">
					<span className="input-group-addon"><i className="green-text glyphicon glyphicon-lock"></i></span>
					<input id="password" type="password" className="form-control" name="password" placeholder="Password" />
				</div>
				<p style={{textAlign:'right',marginRight:'15px'}}><i><a>Lost Password?</a></i></p>
				<button type="submit" className="green btn btn-success registerbutton bold">LOGIN</button>
				<br />
				<p style={{textAlign:'center'}}>Don't have an account? <NavLink exact to="/signup"><i onClick={()=>props.onChange({activePane:'signup'})}>Sign up</i></NavLink> now.</p>

			</form>
		</div>
	)
}

export default Login
