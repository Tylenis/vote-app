angular.module("voteApp")
    .factory("Api", ["$http", "APIURL", "$localStorage", function($http, APIURL, $localStorage){
        return {
            getResourceSimple: function(endpoint){
                return $http.get(APIURL+endpoint);
            },
            getResourceWithParam: function(endpoint, param){
                return $http.get(APIURL+endpoint+param);
            },
            postResource: function(endpoint, data){
                return $http.post(APIURL+endpoint, data);
            },
            logout: function(success){
                delete $localStorage.token;
                delete $localStorage.user;
                delete $localStorage.pollsnumber;
                success();
            }
        };
    }]);