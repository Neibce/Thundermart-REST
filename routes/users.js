module.exports = function(app){
	const express = require('express');
	const router = express.Router();
	const request = require('request');
	const sql = require('../db_sql')();

	router.post('/login', function(req, res){
		const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		if(!check_query_vaild([req.query.user_token, req.query.provider]))
			return res.json({ res_code: 2 });

		reqeust_user_login(req.query.user_token, req.query.provider, client_ip,
			function(res_code, session_id){
				if(res_code != 0)
					res.json({ res_code: res_code});
				else
					res.json({ res_code: res_code, session_id : session_id });
			});
	});

	router.get('/already-joined', function(req, res){
		if(!check_query_vaild([req.query.user_token, req.query.provider]))
			return res.json({ res_code: 2 });

		check_already_joined(req.query.user_token, req.query.provider,
			function(res_code, session_id){
				if(res_code != 0)
					res.json({ res_code: res_code});
				else
					res.json({ res_code: res_code, session_id : session_id });
			});
	});

	function check_query_vaild(query_list){
		query_list.forEach(query => {
			if(typeof query === 'undefined' && !query)
				return 0;
		});
		return 1;
	}

	function reqeust_user_login(user_token, provider, client_ip, callback){
		get_user_info(user_token, provider,
			function (res_code, id, nickname){
				if (res_code != 0)
					return callback(res_code);
				else
					create_user(id, provider, nickname, client_ip,
						function (res_code){
							if(res_code != 0)
								return callback(res_code);
							else 
								create_user_session(id, provider, client_ip,
									function(res_code, session_id){
										if(res_code != 0)
											return callback(res_code);
										else
											return callback(res_code, session_id);
									});
						});
			});
	}

	function check_already_joined(user_token, provider, callback){
		get_user_info(user_token, provider,
			function (res_code, id, nickname){
				if (res_code != 0)
					return callback(res_code);
				else 
					get_user_already_joined(id, provider,
						function(res_code, already_joined) {
							if(res_code != 0)
								return callback(res_code);
							else{
								return callback(res_code, already_joined ? true : false);
							}
						});
			});
	}

	function get_user_info(user_token, provider, callback){
		if (provider == 'KAKAO'){
			request.get('https://kapi.kakao.com/v2/user/me',{
				headers: {
					'Authorization' : 'Bearer ' + user_token
				},
				qs: { 'property_keys': '["id", "properties.nickname"]'}
			},function (er, rs, bd) {
				if (er){
					console.log(er);
					return callback(3);
				}

				var parsed_bd = JSON.parse(bd);

				if(typeof parsed_bd.id === 'undefined' && !parsed_bd.id
					|| typeof parsed_bd.properties.nickname === 'undefined' && !parsed_bd.properties.nickname)
						return callback(101);

				return callback(0, parsed_bd.id, parsed_bd.properties.nickname);
			});
		}else if (provider =='FACEBOOK'){
			request.get('https://graph.facebook.com/v5.0/me?fields=id%2Cname&access_token='+ user_token,
			function (er, rs, bd) {
				if (er){
					console.log(er);
					return callback(3);
				}

				var parsed_bd = JSON.parse(bd);

				if(typeof parsed_bd.id === 'undefined' && !parsed_bd.id
					|| typeof parsed_bd.name === 'undefined' && !parsed_bd.name)
						return callback(101);

				return callback(0, parsed_bd.id, parsed_bd.name);
			});
		}else
			return callback(2);
	}

	function get_user_already_joined(provider_id, provider, callback) {
		sql.select("SELECT COUNT(*) FROM T_USER_LIST WHERE USER_PROVIDER_ID='" + provider_id + "' AND PROVIDER='" + provider + "';",
			function(err, data){
				if (err){
					console.log(err);
					return callback(3);
				}
				else
					return callback(0, data[0]['COUNT(*)']);
			});
	}

	function create_user(provider_id, provider, nickname, client_ip, callback) {
		get_user_already_joined(provider_id, provider,
			function(res_code, already_joined) {
				if(res_code != 0)
					return callback(res_code);
				if(!already_joined){
					sql.select("INSERT INTO T_USER_LIST(USER_ID, USER_CREATE_IP, USER_NICKNAME, USER_PROVIDER_ID, PROVIDER) VALUES (UNHEX(REPLACE(UUID(),'-','')), '" + client_ip + "', '" + nickname + "', " + provider_id + ", '" + provider + "');",
					function(err, data){
						if (err){
							console.log(err);
							return callback(3);
						}
						else
							return callback(0);
					});
				} else {
					return callback(0);
				}
			})
	}

	function create_user_session(provider_id, provider, client_ip, callback){
		sql.select("DELETE FROM T_USER_SESSIONS WHERE USER_ID IN(SELECT USER_ID FROM T_USER_LIST WHERE USER_PROVIDER_ID=" + provider_id + " AND PROVIDER='" + provider + "');",
			function(err, data){
				if (err){
					console.log(err);
					return callback(3);
				}
				else
					sql.select("INSERT INTO T_USER_SESSIONS (SESSION_ID, TOKEN_TYPE, USER_ID, CREATED_IP) SELECT UNHEX(REPLACE(UUID(),'-','')), 0, USER_ID, '" + client_ip + "' FROM T_USER_LIST WHERE USER_PROVIDER_ID = " + provider_id + " AND PROVIDER='" + provider + "';",
						function(err, data){
							if (err){
								console.log(err);
								return callback(3);
							}
							else
								sql.select("SELECT HEX(SESSION_ID) FROM T_USER_SESSIONS WHERE USER_ID IN(SELECT USER_ID FROM T_USER_LIST WHERE USER_PROVIDER_ID=" + provider_id + " AND PROVIDER='" + provider + "');",
									function(err, data){
										if (err){
											console.log(err);
											return callback(3);
										}
										else
											return callback(0, data[0]['HEX(SESSION_ID)']);
									});
								});
						});
	}

	return router;
};