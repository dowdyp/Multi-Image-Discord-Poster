// Reference for Danbooru API calls: 
// response.data.file_url = uncompressed file path
// response.data.preview_file_url = thumbnail path
// response.data.md5 = md5


// Initialize angular app
var spammer = angular.module('DiscordSpammer', []);
// Init config
spammer.config(function($httpProvider) {

  delete $httpProvider.defaults.headers.common['X-Requested-With'];

});

// Init controller
spammer.controller('spamController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

// Basic info surrounding Danbooru API and queries to do with said API
  $scope.dan_info = {

// Tag and limit need values in order to submit query, if not filled alert will be fired preventing submission anyways
    tag: '',
    url_json: 'http://danbooru.donmai.us/posts.json?random=true&',
    url: 'http://danbooru.donmai.us',
    posts: null,
    limit: 10,
  };

// Basic Discord Info
// Channel needs value
  $scope.dis_info = {
    channel: ''
  }

  $scope.post = {
    method: "POST",
    url: "https://discordapp.com/api/v6/channels/" + $scope.dis_info.channel + "/messages",
    
// Get headers from a Discord POST (ctrl + shift + i, network tab, send a message, copy as cURL, gather info)
// x-super and auth need a value
    headers: {
      "x-super-properties": "",
      "accept-language": "en-US",
      "authorization": "",
      "content-type": "application/json",
      "accept": "*/*",
    },

// This should stay empty
    data: {
      "content": null,
      "tts":false
    }
  }

// Danbooru API query shown on index.html
  $scope.query = $scope.dan_info.url_json + 'tags=' + $scope.dan_info.tag + '&limit=' + $scope.dan_info.limit;

// Storage for retreived post objects, to then be taken for ng-repeat="post in retreived" and post()
  $scope.retreived = [];

// {{query}} is watched so it can update automatically upon value change
  $scope.$watch(function() {
    return $scope.dan_info.tag + $scope.dan_info.limit;
  }, function(newValue, oldValue) {
    if(newValue != oldValue) {
      $scope.query = $scope.dan_info.url_json + 'tags=' + $scope.dan_info.tag + '&limit=' + $scope.dan_info.limit;
    }
  });

// Query function
  $scope.populate = function() {

// Resets all stored data to prevent repeat posting
    $scope.retreived = [];

// Check if either tag or limit is missing, because this will prevent the query from going through
    if (!$scope.dan_info.tag || !$scope.dan_info.limit) {
      alert('missing either tag or limit');
      throw '';
    };

// Uses $scope.query url to retreive json info
// Sidenote, danbooru has two different post api uris, danbooru.donmai.net/posts & danbooru.donmai.net/posts.json
// /posts will return the default danbooru search page, whereas /posts.json will return an array of post objects
    $http.get($scope.query)
      .then(function(response) {

//        console.log(response.data); this was here for debugging

// Iterate through the recieved json objects, taking the url, thumbnail, and md5 from each object
        angular.forEach(response.data, function(value) {
          var temp = {
            url: '',
            preview: '',
            md5: ''
          };

// Danbooru's objects return unfinished uris, ex. /data/123.jpg instead of danbooru.donmai.net/data/123.jpg
// This next step simply changes the value of the variable temp, and adds $scope.dan_info.url so the result is a web-accessible uri
          temp.url = $scope.dan_info.url + value.file_url;
          temp.preview = $scope.dan_info.url + value.preview_file_url;
          temp.md5 = value.md5;

//Pushes the formed object into the array $scope.retreived, which then populates ng-repeat="post in retreived" on index.html
          $scope.retreived.push(temp);
        });

//        console.log($scope.retreived); this was here for debugging
      });
    }

//  console.log('complete', $scope.dan_info); this was here for debugging

//Takes all gathered urls and posts them one by one to the proper discord channel.
  $scope.disPost = function() {
    angular.forEach($scope.retreived, function(value) {

      $scope.post.data = {
        content: value.url
      }
//console log on next line is simply confirmation that each individual post went through successfully
      $http($scope.post).then(function() {console.log('post successful')});
    });
  };
}]);