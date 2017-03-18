'use strict';

const profileApiUrl = 'http://profile.zzp-matcher-api.entreact.com:8001/api/profile';

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();
const Q = require('kew');
const rest = require('node-rest-client');

module.exports.matchWorker = (event, context, callback) => {

    function putItem() {
        const defer = Q.defer();
        var update = {
            origin: 'unknown',
            profileId: 'profile-1'
        };
        if (event.queryStringParameters) {
            const query = event.queryStringParameters;
            update.profileId = query.profileId;
            update.origin = 'rest'
        } else if (event.Records) {
            const query = event.Records[0];
            console.log('dynamodb', query.dynamodb);
            update.profileId = query.dynamodb.NewImage.profileId.S;
            update.origin = 'dynamodb'
        }
        if (!update) {
            update = { fromSource: false }
        }
        if (!update.profileId) {
            update.profileId = 'profile-1';
        }
//        const profileId = update.profileId;
//        const client = rest.Client;
//        client.get(profileApiUrl + '/' + profileId, {}, function(profile) {
//            console.log(profile);
//            work(profile, defer);
//        });
        console.log('event', event);
        update.sourceProfileId = 'profile-1';
        update.targetProfileId = update.profileId;
        work(update, defer);

        return defer.promise;
    }

    function work(profile, defer) {
        const params = {
            TableName: 'match',
            Item: profile
        };
        console.log('params', params);
        dynamo.putItem(params, defer.makeNodeResolver());
    }

    function response(data, statusCode) {
        const response = {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify({
                data: data,
                input: event
            })
        };
        console.log('response', response);

        callback(null,response);
    }

    putItem()
        .then(data => response(data, 200))
        .fail(err => response(err, 500));
};
