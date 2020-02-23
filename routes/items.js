module.exports = function(app){
	const express = require('express');
	const router = express.Router();
	const request = require('request');
	const pool = require('../db_connect');

	router.get('/list', function(req, res){
		var client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		if(typeof req.query.shop === 'undefined' && !req.query.shop
            ||(typeof req.query.category === 'undefined' && !req.query.category
            && typeof req.query.keyword === 'undefined' && !req.query.keyword)){
			res.json({ res_code: 2 });
			return router;
		}
		debugger;
		get_item_list(req.query.shop, req.query.category, req.query.keyword,
			function(res_code, result){
				if(res_code != 0)
					res.json({ res_code: res_code});
				else
					res.json({ res_code: res_code, item_list: result });
			});
	});


	function get_item_list(shop, category, keyword, callback){
		if(shop != 'GS' && shop != 'CU' && shop != 'SEVEN')
			return callback(2);
		if(shop == 'SEVEN')
			shop = 'SE';

		var qlist = [shop];
		var query = 'SELECT * FROM T_PRODUCT_LIST WHERE PRODUCT_PROVIDER=?';

		if(!(typeof category === 'undefined' && !category)){
			category = parseInt(category);
			if(isNaN(category) || category < 0 || category > 10)
				return callback(2);
			query += ' AND PRODUCT_CATEGORY=?';
			qlist.push(category);
		}

		if(!(typeof keyword === 'undefined' && !keyword)){
			keyword = '%'+keyword.replace(' ', '%')+'%';

			query += ' AND PRODUCT_NAME LIKE ?';
			qlist.push(keyword);
		}
		query += ';';

		pool.query(query, qlist,
			function(err, data){
				if (err){
					console.log(err);
					return callback(3);
				}

				var data_processed = [];
				data.forEach(item => {
					var item_id = '00' + item.PRODUCT_ID;
					item_id = item.PRODUCT_PROVIDER + item_id.slice(-3);

					if(item.PRODUCT_PROVIDER == 'SE')
						item.PRODUCT_PROVIDER = 'SEVEN';

					var item_properties= {
						id : item_id,
						name: item.PRODUCT_NAME,
						image_url: item.PRODUCT_IMAGE_URL,
						shop: item.PRODUCT_PROVIDER,
						category: item.PRODUCT_CATEGORY,
						price: item.PRODUCT_PRICE
					}
					data_processed.push(item_properties);
				});

				return callback(0, data_processed);
			});
	}
	return router;
};