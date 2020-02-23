function is_req_query_vaild(req_list){
    let result = 1;
    req_list.forEach(query => {
        if(typeof query === 'undefined')
            return result = 0;
    });
    return result;
}

function is_sel_query_vaild(sel_list){
    let result = 0;
    sel_list.forEach(query => {
        if(typeof query !== 'undefined')
            return result = 1;
    });
    return result;
}

function is_query_vaild(req_list, sel_list){
    if(typeof sel_list !== 'undefined')
        return is_req_query_vaild(req_list) && is_sel_query_vaild(sel_list);
    else
        return is_req_query_vaild(req_list);
}

function get_client_ip(req){
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

module.exports = {
    is_query_vaild : is_query_vaild,
    get_client_ip : get_client_ip
};