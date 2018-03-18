let {questions, answers} = require('./bot-comment-data')

function getBotComment(message){
	let answer = ''

	for(let i = 0; i < questions.length; ++i){
		if(questions[i].some(exp=>exp.test(message))) answer+=answers[i]+'<br />'
	}
	
	return answer;
}

module.exports = getBotComment
