const request = require('request');
const pool = require('../lib/db.connect');

function getInfoFromProvider(userToken, provider, callback){
    if (provider == 'KAKAO'){
        request.get('https://kapi.kakao.com/v2/user/me',{
            headers: {
                'Authorization' : 'Bearer ' + userToken
            },
            qs: { 'property_keys': '["id", "properties.nickname"]'}
        },function (er, rs, bd) {
            if (er){
                console.log(er);
                return callback(3);
            }

            var parsedBd = JSON.parse(bd);

            if(typeof parsedBd.id === 'undefined' && !parsedBd.id
                || typeof parsedBd.properties.nickname === 'undefined' && !parsedBd.properties.nickname){
                    if(parsedBd.code == -10)
                        return callback(4);
                    else if (parsedBd.code == -401)
                        return callback(101);
                    else
                        return callback(3);
                }
                    

            return callback(0, parsedBd.id, parsedBd.properties.nickname);
        });
    }else if (provider =='FACEBOOK'){
        request.get('https://graph.facebook.com/v5.0/me?fields=id%2Cname&access_token='+ userToken,
        function (er, rs, bd) {
            if (er){
                console.log(er);
                return callback(3);
            }

            var parsedBd = JSON.parse(bd);

            if(typeof parsedBd.id === 'undefined' && !parsedBd.id
                || typeof parsedBd.name === 'undefined' && !parsedBd.name){
                    if(parsedBd.error.code == 4)
                        return callback(4);
                    else if (parsedBd.error.code == 190)
                        return callback(101);
                    else
                        return callback(3);
                }

            return callback(0, parsedBd.id, parsedBd.name);
        });
    }else
        return callback(2);
}

function checkAlreadyJoined(providerId, provider, callback) {
    pool.query("SELECT COUNT(*) FROM T_USER_LIST WHERE USER_PROVIDER_ID='" + providerId + "' AND PROVIDER='" + provider + "';",
        function(err, data){
            if (err){
                console.log(err);
                return callback(3);
            }
            else
                return callback(0, data[0]['COUNT(*)'] ? true : false);
        });
}

function createSession(providerId, provider, clientIp, callback){
    pool.query("DELETE FROM T_USER_SESSIONS WHERE USER_ID IN(SELECT USER_ID FROM T_USER_LIST WHERE USER_PROVIDER_ID=? AND PROVIDER=?);" +
    "INSERT INTO T_USER_SESSIONS (SESSION_ID, TOKEN_TYPE, USER_ID, CREATED_IP) SELECT UNHEX(REPLACE(UUID(),'-','')), 0, USER_ID, ? FROM T_USER_LIST WHERE USER_PROVIDER_ID=? AND PROVIDER=?;" +
    "SELECT HEX(SESSION_ID) FROM T_USER_SESSIONS WHERE USER_ID IN(SELECT USER_ID FROM T_USER_LIST WHERE USER_PROVIDER_ID=? AND PROVIDER=?);",
    [providerId, provider, clientIp, providerId, provider, providerId, provider],
        function(err, data){
            if (err){
                console.log(err);
                return callback(3);
            }
            else
                return callback(0, data[2][0]['HEX(SESSION_ID)']);
        });
}

function create(providerId, provider, nickname, clientIp, callback) {
    checkAlreadyJoined(providerId, provider,
        function(resCode, alreadyJoined) {
            if(resCode != 0)
                return callback(resCode);
            if(!alreadyJoined){
                pool.query("INSERT INTO T_USER_LIST(USER_ID, USER_CREATE_IP, USER_NICKNAME, USER_PROVIDER_ID, PROVIDER) VALUES (UNHEX(REPLACE(UUID(),'-','')), '" + clientIp + "', '" + nickname + "', " + providerId + ", '" + provider + "');",
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

module.exports = {
    getInfoFromProvider : getInfoFromProvider,
    checkAlreadyJoined : checkAlreadyJoined,
    create : create,
    createSession : createSession
};