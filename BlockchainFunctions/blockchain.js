var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
require('./config.js');
var hfc = require('fabric-client');
var helper = require('./app/helper.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}

function validatePayload(payload) {
    if (!payload.username) return getErrorMessage('\'username\'');
    if (!payload.orgName) return getErrorMessage('\'orgName\'');
	if (!payload.chaincodeName) return getErrorMessage('\'chaincodeName\'');
	if (!payload.channelName) return getErrorMessage('\'channelName\'');
	if (!payload.fcn) return getErrorMessage('\'fcn\'');
    if (!payload.args) return getErrorMessage('\'args\'');
    return {success: true};
}

exports.mainBlockchainUser = async (username, orgName) => {
    if (!username) return getErrorMessage('\'username\'');
    if (!orgName) return getErrorMessage('\'orgName\'');

    logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);

    let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s', username, orgName);
		return { success: true, message: `Successfully registered the username ${username} for organization ${orgName}`}
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
		return { success: false, message: response };
	}
}

exports.mainInvokeChaincode = async (payload) => {
    try {
        logger.debug('==================== INVOKE ON CHAINCODE ==================');
        
        var result = validatePayload(payload);
        if(!result.success) return result;

		logger.debug('User name : ' + payload.username);
		logger.debug('Org name  : ' + payload.orgName);
        logger.debug('channelName  : ' + payload.channelName);
		logger.debug('chaincodeName : ' + payload.chaincodeName);
		logger.debug('fcn  : ' + payload.fcn);
        logger.debug('args  : ' + payload.args);

		let message = await invoke.invokeChaincode(
            payload.peers,
            payload.channelName, 
            payload.chaincodeName, 
            payload.fcn, 
            payload.args, 
            payload.username, 
            payload.orgName
        );

        return {
            success: true,
			result: message,
			error: null,
			errorData: null
		}
	} catch (error) {
        return {
            success: false,
			result: null,
			error: error.name,
			errorData: error.message
		}
	}
}

exports.mainQueryChaincode = async (payload) => {
    logger.debug('==================== QUERY BY CHAINCODE ==================');

	var result = validatePayload(payload);
	if(!result.success) return result;
	
	logger.debug('User name : ' + payload.username);
	logger.debug('Org name  : ' + payload.orgName);
    logger.debug('channelName  : ' + payload.channelName);
    logger.debug('chaincodeName : ' + payload.chaincodeName);
    logger.debug('fcn  : ' + payload.fcn);
    logger.debug('args  : ' + payload.args);
    
    args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgName);
	return message;
}



