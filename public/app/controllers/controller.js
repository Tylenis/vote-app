angular.module("voteApp")
    .controller("mainCtrl", ["$scope", "Api", "$location", "$localStorage",
    function($scope, Api, $location, $localStorage){
        $scope.homeurl = "#/";
        $scope.locationobj = {};
        $scope.locationobj.currentlocation = $location.url();
    
        $scope.maindata = {
            loginerror: undefined,
            signuperror: undefined,
            current: 1,
            mypollscurrent: 1,
            userstatus: false
            
        };
        
        $scope.closeAlert = function(errortype){
            $scope.maindata[errortype] = undefined;
            delete $scope.maindata.signupsuccess;
        };
        $scope.$on("status", function(event, data){
            $scope.maindata.userstatus = data.status;
            $scope.homeurl = data.home;
        });
        $scope.$on("navbardata", function(event, data){
            $scope.maindata.welcomename = data.welcomename;
            $scope.maindata.pollsnumber = data.pollsnumber;
            delete $scope.maindata.loginerror;
            delete $scope.maindata.signuperror;
            delete $scope.maindata.signupsuccess;
        });
        
        $scope.$on("current", function(event, data){
           $scope.maindata.current = data.current; 
        });
        $scope.resetCurrent = function(){
            $scope.$broadcast("resetcurrent");
        };
        $scope.logout = function(){
            Api.logout(function(){
                $scope.maindata.userstatus = false;
                $scope.homeurl = "#/";
                $location.path("/");
            });
        };
    }])
    .controller("anonimCtrl", ["$scope", "$location", "$routeParams", "polls", "pagination", "$localStorage",
    function($scope, $location, $routeParams, polls, pagination, $localStorage){
        $scope.animate = "animate";
        $scope.$emit("status", {
            "status": false,
            "home": "#/"
        });
        $scope.locationobj.currentlocation = $location.url();
        $scope.current = $scope.maindata.current;
        var pollsarray = polls.data.data;
        $scope.pollsview = pagination.showPolls(12, pollsarray, $scope.current);
        $scope.pollsview.changePage($scope.current);
        $scope.changepage = function(number){
            $scope.pollsview.changePage(number);
            $scope.$emit("current", {
                "current": number
            });
        };
        $scope.$on("resetcurrent", function(){
           $scope.pollsview = pagination.showPolls(12, pollsarray, 1);
        });
    }])
    .controller("loginsignupCtrl", ["$scope", "Api", "$localStorage", "$location", "authentication",
    function($scope, Api, $localStorage, $location, authentication){
        $scope.animate = "animate";
        $scope.$emit("status", {
            "status": false,
            "home": "#/"
        });
         $scope.locationobj.currentlocation = $location.url();
         $scope.signup = function(){
            if($scope.signupform.$valid){
                var formData = {};
                formData.username = $scope.username;
                formData.password = $scope.password;
                Api.postResource("sign-up", formData).then(function(res){
                    $scope.maindata.signuperror = res.data.msg;
                    if(res.data.success){
                        $scope.maindata.signupsuccess = "Account successfully created.  Now you can log in.";
                        delete $scope.maindata.signuperror;
                        $location.path("/log-in");
                    }
                });
            }
        };
        
        $scope.login = function(){
            if($scope.form.$valid){
                var formData = {};
                formData.username = $scope.username;
                formData.password = $scope.password;
                Api.postResource("log-in", formData).then(function(res){
                    $scope.maindata.loginerror = res.data.msg;
                    if(res.data.success){
                        $localStorage.token = res.data.token;
                        delete $scope.maindata.signuperror;
                        delete $scope.maindata.loginerror;
                        $location.path("/logged");
                        
                    }
                });
            }
        };
    }])
    .controller("loggedCtrl", ["$scope", "$location", "$localStorage", "Api",
    "authentication", "polls", "pagination",
    function($scope, $location, $localStorage, Api, authentication, polls, pagination){
        $scope.animate = "animate";
        $localStorage.userId = authentication.data.userId;
        $scope.current = $scope.maindata.current;
        $scope.locationobj.currentlocation = $location.url();
        $scope.$emit("navbardata", {
            "welcomename": authentication.data.username,
            "pollsnumber": authentication.data.pollqty
        });
        $scope.$emit("status", {
            "status": true,
            "home": "#/logged"
        });
        $scope.$on("resetcurrent", function(){
           $scope.pollsview = pagination.showPolls(12, pollsarray, 1);
        });
        var pollsarray = polls.data.data;
        $scope.pollsview = pagination.showPolls(12, pollsarray, $scope.current);
        $scope.pollsview.changePage($scope.current);
        $scope.changepage = function(number){
            $scope.pollsview.changePage(number);
            $scope.$emit("current", {
                "current": number
            });
        };
        
    }])
    .controller("newpollCtrl", ["$scope", "$location", "$localStorage", "Api", "authentication",
    function($scope, $location, $localStorage, Api, authentication){
        $scope.animate = "animate";
        $localStorage.userId = authentication.data.userId;
        $scope.options = ["option1", "option2", "option3"];
        $scope.successfullycreated = false;
        $scope.dataToSent = {};
        $scope.dataToSent.options = [];
        $scope.locationobj.currentlocation = $location.url();
        $scope.$emit("status", {
            "status": true,
            "home": "#/logged"
        });
        $scope.$emit("navbardata", {
            "welcomename": authentication.data.username,
            "pollsnumber": authentication.data.pollqty
        });
        $scope.addOpt = function(){
            var optionslength = $scope.options.length+1;
            $scope.options.push("option"+optionslength);
        };
        
        $scope.delOpt = function(index){
            $scope.options.pop(index);
            $scope.dataToSent.options.splice(index, 1);
        };
        
        $scope.savePoll = function(data){
            if(data.$valid){
                Api.postResource("polls", $scope.dataToSent).then(function(res){
                    $scope.successfullycreated = res.data.success;
                });
            }
        };
        $scope.reset = function(){
            $scope.successfullycreated = false;
            $scope.dataToSent.options = [];
            $scope.dataToSent.title = undefined;
        };
        
    }])
    .controller("resultsCtrl", ["$scope", "$routeParams", "Api", "$localStorage",
    "$location", "authentication",
    function($scope, $routeParams, Api, $localStorage, $location, authentication){
        if(authentication){
            $localStorage.userId = authentication.data.userId;
            $scope.$emit("status", {
                "status": true,
                "home": "#/logged"
            });
            $scope.$emit("navbardata", {
                "welcomename": authentication.data.username,
                "pollsnumber": authentication.data.pollqty
            });
        } else {
            $scope.$emit("status", {
                "status": false,
                "home": "#/"
            });
        }
        $scope.animate = "animate";
        $scope.locationobj.currentlocation = $location.url();
        $scope.backurl = authentication ? "#/logged":"#/";
        
        Api.getResourceWithParam("pollresults/", $routeParams.pollId).then(function(res){
            var width = angular.element(".panel-success").prop("offsetWidth");
            $scope.title = res.data.title;
            $scope.labels = res.data.labels;
            $scope.data = res.data.data;
            $scope.options = {
                
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        fontColor: "white",
                        fontSize: width>450 ? 14:8,
                        boxWidth: width>450 ? 40:20
                    }
                },
                onResize: function(chart, size){
                    if(size.width==298){
                        this.legend.labels.fontSize=8;
                        this.legend.labels.boxWidth=20;
                    } else {
                        this.legend.labels.fontSize=14;
                        this.legend.labels.boxWidth=40;
                    }
                },
            };
        });
    }])
    .controller("voteCtrl", ["$scope", "$routeParams", "Api", "$localStorage",
    "$location", "authentication",
    function($scope, $routeParams, Api, $localStorage, $location, authentication){
        if(authentication){
            $localStorage.userId = authentication.data.userId;
            $scope.$emit("status", {
                "status": true,
                "home": "#/logged"
            });
            $scope.$emit("navbardata", {
                "welcomename": authentication.data.username,
                "pollsnumber": authentication.data.pollqty
            });
        } else {
            $scope.$emit("status", {
                "status": false,
                "home": "#/"
            });
        }
        $scope.animate = "animate";
        $scope.votesuccess = false;
        $scope.locationobj.currentlocation = $location.url();
        $scope.backurl = authentication ? "#/logged":"#/";
        $scope.needoption = false;
        $scope.optionsadded = 0;
        $scope.showerror = false;
        $scope.errottxt = "";
        $scope.choosen = {};
        $scope.inputobj = {};
        
        Api.getResourceWithParam("poll/", $routeParams.pollId).then(function(res){
            $scope.poll = res.data;
            $scope.options = [];
            angular.forEach($scope.poll.options, function(value) {
                $scope.options.push(Object.keys(value)[0]);
            });
        });
        
        $scope.vote = function(){
            if($scope.choosen.option){
                var dataToSend = {
                    pollId: $routeParams.pollId,
                    option: $scope.choosen.option,
                    optionindex: $scope.options.indexOf($scope.choosen.option)
                };
                Api.postResource("vote", dataToSend).then(function(res){
                    if(res.data.success){
                        $scope.votesuccess = true;
                    } else {
                        $scope.votefail = true;
                    }
                });
            } else {
                $scope.errottxt = "You must select an option!";
                $scope.showerror = true;
            }
            
        };
        $scope.requestOption = function(){
            if($scope.optionsadded == 0 ){
                $scope.needoption = true;
            }
        };
        $scope.submitOption = function(form){
            if(form.$valid){
                $scope.options.push($scope.inputobj.option);
                $scope.needoption = false;
                $scope.optionsadded++;
                $scope.showerror = false;
            } else {
                $scope.errottxt = "Add option field is empty!";
                $scope.showerror = true;
            }
        };
        $scope.delOption = function(){
            $scope.needoption = false;
            $scope.showerror = false;
            delete $scope.inputobj.option;
        };
    }])
    .controller("mypollsCtrl", ["$scope", "Api", "pagination", "$location", 
    "$localStorage", "$uibModal", "$routeParams", "polls", "authentication",
    function($scope, Api, pagination, $location, $localStorage, $uibModal, $routeParams, polls, authentication){
        console.log(authentication);
        $scope.animate = "animate";
        $localStorage.userId = authentication.data.userId;
        $scope.isCollapsed = true;
        $scope.mypollscurrent = $scope.maindata.mypollscurrent;
        $scope.temp = {};
        $scope.urlpartone = $location.protocol()+"://"+$location.host()+"/#/poll/";
        $scope.animationsEnabled = true;
        $scope.locationobj.currentlocation = $location.url();
        
        $scope.polls = polls.data.data;
        $scope.nopolls = $scope.polls.length>0 ? false:true;
        $scope.pollsview = pagination.showPolls(3, $scope.polls, $scope.mypollscurrent);
        $scope.pollsview.changePage($scope.mypollscurrent);
        $scope.$emit("status", {
            "status": true,
            "home": "#/logged"
        });
        $scope.$emit("navbardata", {
            "welcomename": authentication.data.username,
            "pollsnumber": authentication.data.pollqty
        });
        $scope.changepage = function(number){
            $scope.pollsview.changePage(number);
            $scope.mypollscurrent = $scope.pollsview.currentPage;
            
        };
        $scope.addnewoption = function(id, option, index){
            if(option != undefined){
                var data = {};
                data.pollId = id;
                data.action = "add";
                data.newoption = {};
                data.newoption[option] = 0;
                Api.postResource("mypolls/update", data).then(function(res){
                    $scope.pollsview.pollsToShow[index].options.push(data.newoption);
                    delete $scope.temp[index];
                });
            }
            
        };
        $scope.deleteoption = function(id, pollindex, optionindex){
            var data = {};
            data.pollId = id;
            data.action = "del";
            data.optionindex = optionindex;
            Api.postResource("mypolls/update", data).then(function(res){
                $scope.pollsview.pollsToShow[pollindex].options.splice(optionindex, 1);
            });
        };
        $scope.open = function(polltitle, pollid){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: "sm",
                resolve: {
                    polltitle: function(){
                        return polltitle;
                    },
                    pollid: function(){
                        return pollid;
                    }
                }
            });
            modalInstance.result.then(function(pollid){
                var data = {};
                data.pollId = pollid;
                Api.postResource("mypolls/delete", data).then(function(res){
                    Api.getResourceWithParam("mypolls/", authentication.data.userId).then(function(res){
                        $scope.polls = res.data.data;
                        $scope.nopolls = $scope.polls.length>0 ? false:true;
                        $scope.pollsview = pagination.showPolls(3, $scope.polls, $scope.mypollscurrent);
                        $scope.pollsview.changePage($scope.mypollscurrent);
                        $scope.$emit("navbardata", {
                            "pollsnumber": $scope.polls.length,
                            "welcomename": authentication.data.username
                        });
                    });
                });
            });
        };
        
    }])
    .controller("settingsCtrl", ["$scope", "Api", "$localStorage", "authentication", "$location",
    function($scope, Api, $localStorage, authentication, $location){
        $scope.animate = "animate";
        $scope.data = {};
        $scope.showerror = false;
        $scope.errottxt = "";
        $scope.nomatch = false;
        $scope.changed = false;
        $scope.wrongpsw = false;
        $scope.locationobj.currentlocation = $location.url();
        $scope.$emit("status", {
            "status": true,
            "home": "#/logged"
        });
        $scope.$emit("navbardata", {
            "welcomename": authentication.data.username,
            "pollsnumber": authentication.data.pollqty
        });
        $scope.changePsw = function(form){
            if(form.$valid){
                if($scope.data.new !== $scope.data.newagain){
                    $scope.showerror = true;
                    $scope.nomatch = true;
                    $scope.errottxt = "New passwords must be identical!";
                } else {
                    $scope.showerror = false;
                    $scope.errottxt = "";
                    $scope.nomatch = false;
                    $scope.data.username = authentication.data.username;
                    Api.postResource("change-password", $scope.data).then(function(res){
                        if(res.data.success == false){
                            $scope.showerror = true;
                            $scope.wrongpsw = true;
                            $scope.errottxt = res.data.msg;
                        } else {
                            $scope.changed = true;
                        }
                    });
                }
                
            }
        };
        $scope.delAccount = function(form){
            if(form.$valid){
                var data = {};
                data.userid = authentication.data.userId;
                data.password = $scope.data.psw;
                Api.postResource("delete-account", data).then(function(res){
                    if(res.data.success == false){
                        $scope.showerror = true;
                        $scope.wrongpsw = true;
                        $scope.errottxt = res.data.msg;
                    } else {
                        Api.logout(function(){
                            $scope.$emit("status", {
                                "status": false,
                                "home": "#/"
        });
                            $location.path("#/");
                        });
                    }
                });
            }
            
        };
        
    }])
    .controller('ModalInstanceCtrl', ["$scope", "$uibModalInstance", "polltitle", "pollid", "Api",
    function ($scope, $uibModalInstance, polltitle, pollid, Api) {
        
        $scope.polltitle = polltitle;
        $scope.ok = function () {
            $uibModalInstance.close(pollid);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);