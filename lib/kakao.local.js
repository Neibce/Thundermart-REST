const request = require('request');
const restApiKey = 'API_KEY';

function searchAddress(query, callback){
    request.get('https://dapi.kakao.com/v2/local/search/address.json',{
        headers: {
            'Authorization' : 'KakaoAK ' + restApiKey
        },
        qs: { 'query' : query }
    }, function (er, rs, bd) {
        if (er){
            console.log(er);
            return callback(3);
        }

        const parsedBd = JSON.parse(bd);
        if(typeof parsedBd === 'undefined')
            return callback(3);
        return callback(0, parsedBd.documents[0]);
    });
}

module.exports = {
    searchAddress: searchAddress
};