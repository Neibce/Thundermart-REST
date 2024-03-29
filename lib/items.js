const pool = require('../lib/db.connect');

function getList(shop, category, keyword, callback){
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
                };
                data_processed.push(item_properties);
            });

            return callback(0, data_processed);
        });
}

function getInfo(itemId, callback){
    const shop = itemId.slice(0, 2);
    const id = parseInt(itemId.slice(2));
    
    pool.query('SELECT * FROM T_PRODUCT_LIST WHERE PRODUCT_PROVIDER=? AND PRODUCT_ID=?;', [shop, id],
        function(err, data){
            if (err){
                console.log(err);
                return callback(3);
            }
            else{
                if(typeof data[0] === 'undefined')
                    return callback(20);
                return callback(0, data[0]);
            }
        });
}

function getPrice(itemId, callback){
    getInfo(itemId,
        function(resCode, info){
            if(resCode != 0)
                return callback(resCode);
            return callback(0, info['PRODUCT_PRICE']);
        });
}

module.exports = {
    getList : getList,
    getInfo : getInfo,
    getPrice : getPrice
};