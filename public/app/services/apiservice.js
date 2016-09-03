angular.module("voteApp")
    .factory("Api", ["$http", "APIURL", "$localStorage", "$location",
    function($http, APIURL, $localStorage, $location){
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
            authentication: function(path){
                var pathroot = path.split("/")[1]; 
                return $http.get(APIURL+"auth").then(function(res){
                    if(pathroot === "logged"){
                        return res;
                    } else {
                        $location.path("/logged"+path);
                        return res;
                    }
                    
                }, function(){
                    if(pathroot === "logged"){
                        console.log("Not authorized!");
                        delete $localStorage.token;
                        $location.path("/log-in");
                    }
                    return false;
                    
                });
            },
            logout: function(success){
                delete $localStorage.token;
                delete $localStorage.user;
                delete $localStorage.userId;
                delete $localStorage.pollsnumber;
                success();
            }
        };
    }]);