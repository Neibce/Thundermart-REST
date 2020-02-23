module.exports = function(app){
	const express = require('express');
	const router = express.Router();
	const items = require('../lib/items');
	const tools = require('../lib/tools');

	router.get('/list', function(req, res){
		//const client_ip = tools.get_client_ip();

		if(tools.is_query_vaild([req.query.shop], [req.query.category, req.query.keyword]))
			return res.json({ res_code: 2 });

		items.get_list(req.query.shop, req.query.category, req.query.keyword,
			function(res_code, result){
				if(res_code != 0)
					res.json({ res_code: res_code});
				else
					res.json({ res_code: res_code, item_list: result });
			});
	});

	return router;
};