let reply = require('../functions/reply')

let express = require('express'),
router = express.Router()

router.post('/',function(req,res){
	let message = req.body.message

 	let answer = reply(message)

 	res.send(answer)
})

module.exports = router
