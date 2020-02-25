module.exports = function(app){
	const express = require('express');
	const router = express.Router();
	const items = require('../lib/items');
	const tools = require('../lib/tools');

	router.get('/list', function(req, res){
		//const clientIP = tools.get_client_ip();

		if(!tools.isQueryVaild([req.query.shop], [req.query.category, req.query.keyword]))
			return res.json({ code: 2 });

		items.getList(req.query.shop, req.query.category, req.query.keyword,
			function(resCode, list){
				if(resCode != 0)
					res.json({ code: resCode });
				else
					res.json({ code: resCode, itemList: list });
			});
	});

	return router;
};