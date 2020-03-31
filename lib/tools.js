const kakaoLocal = require('./kakao.local')

function isReqQueryVaild(req_list){
    let result = 1;
    req_list.forEach(query => {
        if(typeof query === 'undefined')
            return result = 0;
    });
    return result;
}

function isSelQueryVaild(sel_list){
    let result = 0;
    sel_list.forEach(query => {
        if(typeof query !== 'undefined')
            return result = 1;
    });
    return result;
}

function isQueryVaild(req_list, sel_list){
    if(typeof sel_list !== 'undefined')
        return isReqQueryVaild(req_list) && isSelQueryVaild(sel_list);
    else
        return isReqQueryVaild(req_list);
}

function getClientIP(req){
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const baseLat = 35.137867, baseLon = 129.101446, allowedDistanceRange = 1050.0;
function checkAddressAvailable(address, callback){
    kakaoLocal.searchAddress(address,
        function (resCode, info){
            if(resCode != 0)
                return callback(resCode);
            if(typeof info === 'undefined' || typeof info.x === 'undefined' || typeof info.y === 'undefined')
                return callback(40);
            
            let distance = calcDistanceVincenty(info.y, info.x, baseLat, baseLon);
            return callback(0, distance < allowedDistanceRange, distance);
        });
}

function degreesToRadian(degrees){
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function calcDistanceVincenty(lat1, lon1, lat2, lon2) {
    var a = 6378137,
        b = 6356752.314245,
        f = 1 / 298.257223563; // WGS-84 ellipsoid params
    var L = degreesToRadian(lon2 - lon1);
    var U1 = Math.atan((1 - f) * Math.tan(degreesToRadian(lat1)));
    var U2 = Math.atan((1 - f) * Math.tan(degreesToRadian(lat2)));
    var sinU1 = Math.sin(U1),
        cosU1 = Math.cos(U1);
    var sinU2 = Math.sin(U2),
        cosU2 = Math.cos(U2);
  
    var lambda = L,
        lambdaP, iterLimit = 100;
    do {
      var sinLambda = Math.sin(lambda),
          cosLambda = Math.cos(lambda);
      var sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
      if (sinSigma == 0) return 0; // co-incident points
      var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      var sigma = Math.atan2(sinSigma, cosSigma);
      var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      var cosSqAlpha = 1 - sinAlpha * sinAlpha;
      var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
      if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
      var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      lambdaP = lambda;
      lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
  
    if (iterLimit == 0) return NaN // formula failed to converge
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    var s = b * A * (sigma - deltaSigma);
  
    s = Math.floor(s * 100) / 100; // round to 1mm precision
    return s;
  }

module.exports = {
    isQueryVaild : isQueryVaild,
    getClientIP : getClientIP,
    checkAddressAvailable : checkAddressAvailable
};