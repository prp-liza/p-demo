let questions = [
	[/^(hey|hi)/i],
	[/how are you/i],
	[/are you( a)? human/i],
	[/keyword/i,/awesome word/i],
	[/hm+/i],
	[/What's the time now/i,/tell me( the)? (time|date)/i,/what's the date today/i]
]

let answers = [
	'hey!',
	'I am good, what about you?',
	'Nope, I am a chatbot, and I guess you are a Human ;)',
	'Answer for keyword or awesome word',
	'hmmmmm...',
	{toString:()=>'The time now is '+new Date()}
]

module.exports = {questions,answers}
