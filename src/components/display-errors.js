import React from 'react'

function Errors(props){
	return (
		<div className="display-errors" 
			dangerouslySetInnerHTML={{__html:window.errorHtml}}>
		</div>
	)
}

export default Errors
