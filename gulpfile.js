var gulp              = require('gulp');
var install           = require('gulp-install');
var zip               = require('gulp-zip');
var aws_lambda        = require('gulp-aws-lambda');
var awsCredentials    = require('./aws-credentials');

var lambda_params     = {
    FunctionName      : 'ZzpMatchWorker',
    Runtime           : 'nodejs4.3',
    Role              : 'arn:aws:iam::240254240210:role/LambdaGetRole'
//    Code              : {
//        S3Bucket      : 'my_s3_bucket',
//        S3Key         : 'archive.zip'
//    }
};

var aws_credentials   = {
    accessKeyId       : awsCredentials.accessKeyId,
    secretAccessKey   : awsCredentials.secretAccessKey,
    region            : 'us-west-2'
};

gulp.task('install_dependencies',function(){
    gulp.src('./package.json')
        .pipe(gulp.dest('./dist'))
        .pipe(install({production : true}))
});

gulp.task('deploy',['install_dependencies'], function(){
    gulp.src(['dist/**/*'])
        .pipe(zip('archive.zip'))
        .pipe(aws_lambda(aws_credentials, lambda_params))
});