let {questions,answers} = require('./reply-data')

function reply(message){
	let answer = ''

	for(let i = 0; i < questions.length; ++i){
		if(questions[i].some(exp=>exp.test(message))) answer+=answers[i]+'<br />'
	}
	
	return answer||'I didn\'t understand... try asking a question in community qa...';
}

module.exports = reply
