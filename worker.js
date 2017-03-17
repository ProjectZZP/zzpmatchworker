'use strict';

const profileApiUrl = 'http://profile.zzp-matcher-api.entreact.com:8001/api/profile';

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();
const Q = require('kew');
const rest = require('node-rest-client');

module.exports.handler = (event, context, callback) => {

    function putItem() {
        const defer = Q.defer();
        const query = event.queryStringParameters;
        const profileId = query.profileId;
        const client = rest.Client;
        client.get(profileApiUrl + '/' + profileId, {}, function(profile) {
            work(profile, defer);
        });

        return defer.promise;
    }

    function work(profile, defer) {
        const params = {
            TableName: 'profile',
            Item: profile
        };
        dynamo.putItem(params, defer.makeNodeResolver());
    }

    function response(data, statusCode) {
        const response = {
            statusCode: statusCode,
            body: JSON.stringify({
                data: data,
                input: event
            })
        };

        callback(null, response);
    }

    putItem()
        .then(data => response(data, 200))
        .fail(err => response(err, 500));
};