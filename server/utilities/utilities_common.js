

exports.generateValidResponse = generateValidResponse;
exports.generateInvalidResponse = generateInvalidResponse;

function generateValidResponse(data){
    return {
         "Status":{ "Is_valid" : "true" , "Error" : { "Code" : "", "Message" : "" }},
         "Data": data
    };
}

function generateInvalidResponse(err_obj){
    return {
        "Status":{ "Is_valid" : "false" , "Error" : err_obj},
        "Data": null
    };
}