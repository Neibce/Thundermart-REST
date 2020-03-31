module.exports = function(app){
	const express = require('express');
	const router = express.Router();
	const users = require('../lib/users');
	const tools = require('../lib/tools');

	router.post('/join', function(req, res){
		const clientIp = tools.getClientIP(req);

		if(!tools.isQueryVaild([req.query.user_token, req.query.provider]))
			return res.json({ code: 2 });

		users.getInfoFromProvider(req.query.user_token, req.query.provider,
			function (resCode, id, nickname){
				if (resCode != 0)
					return res.json({ code: resCode });
				users.create(id, req.query.provider, nickname, clientIp,
					function (resCode){
						if(resCode != 0)
							return res.json({ res_code: resCode });
						users.createSession(id, req.query.provider, clientIp,
							function(resCode, sessionId){
								if(resCode != 0)
									return res.json({ res_code: resCode });
								res.json({ res_code : resCode, session_id : sessionId });
							});
						});
			});
	});

	router.get('/check-exist', function(req, res){
		if(!tools.isQueryVaild([req.query.user_token, req.query.provider]))
			return res.json({ code: 2 });

		users.getInfoFromProvider(req.query.user_token, req.query.provider,
			function (resCode, id, nickname){
				if (resCode != 0)
					return res.json({ code: resCode });
				users.checkExist(id, req.query.provider,
					function(resCode, alreadyJoined) {
						if(resCode != 0)
							return res.json({ res_code: resCode });
						res.json({ res_code: resCode, user_exist : alreadyJoined });
					});
				});
	});

	return router;
};