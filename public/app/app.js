angular.module("voteApp", ["ngRoute", "ui.bootstrap", "ngAnimate", "ngStorage", "chart.js", "720kb.socialshare"])
    .config(["$routeProvider", "$httpProvider",
    function($routeProvider, $httpProvider){
        
        $httpProvider.interceptors.push(["$q", "$location", "$localStorage", function($q, $location, $localStorage) {
            return {
                "request": function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = $localStorage.token;
                    }
                    return config;
                },
                "responseError": function(response) {
                    if(response.success === false || response.success === undefined) {
                        $location.path("/log-in");
                    }
                    return $q.reject(response);
                }
            };
        }]);
        
        $routeProvider.when("/", {
            templateUrl: "public/app/views/main.html",
            controller: "anonimCtrl",
            resolve: {
                polls: ["Api", function(Api){
                    return Api.getResourceSimple("polls");
                }]
            }
            })
            .when("/poll/:pollId/vote", {
                templateUrl: "public/app/views/vote.html",
                controller: "voteCtrl"
            })
            .when("/poll/:pollId/results", {
                templateUrl: "public/app/views/pollresults.html",
                controller: "resultsCtrl"
            })
            .when("/sign-up", {
                templateUrl: "public/app/views/signup.html",
                controller: "loginsignupCtrl"
            })
            .when("/log-in", {
                templateUrl: "public/app/views/login.html",
                controller: "loginsignupCtrl"
            })
            .when("/logged", {
                templateUrl: "public/app/views/logged.html",
                controller: "loggedCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }],
                    polls: ["Api", function(Api){
                        return Api.getResourceSimple("polls");
                    }]
                }
            })
            .when("/logged/newpoll", {
                templateUrl: "public/app/views/newpoll.html",
                controller: "newpollCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }]
                }
            })
            .when("/logged/poll/:pollId/vote", {
                templateUrl: "public/app/views/votelog.html",
                controller: "voteCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }]
                }
            })
            .when("/logged/poll/:pollId/results", {
                templateUrl: "public/app/views/pollresults.html",
                controller: "resultsCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }]
                }
            })
            .when("/logged/mypolls", {
                templateUrl: "public/app/views/mypolls.html",
                controller: "mypollsCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }],
                    polls: ["Api", "$localStorage", function(Api, $localStorage){
                        return Api.getResourceWithParam("mypolls/", $localStorage.userId);
                    }]
                }
            })
            .when("/logged/settings", {
                templateUrl: "public/app/views/settings.html",
                controller: "settingsCtrl",
                resolve: {
                    authentication: ["Api", function(Api){
                        return Api.getResourceSimple("auth");
                    }]
                }
            })
            .otherwise("/");
            
    }])
    .constant("APIURL", "https://voting-app-tylenis.c9users.io/")
    .filter("key", function(){
        return function(obj){
           return Object.keys(obj)[0]; 
        };
    })
    .filter("mylimitTo", function(){
        return function(text){
            var temp = text.substring(0, 38);
            temp = text.length>38 ? temp+"...":temp;
            return temp;
        };
    })