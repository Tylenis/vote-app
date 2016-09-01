angular.module("voteApp")
    .factory("pagination", [function(){
        return {
            showPolls: function(itemsPerPage, itemarray, pagenumber){
                return {
                    perpage: itemsPerPage,
                    totalItems: itemarray.length,
                    currentPage: pagenumber ? pagenumber:1,
                    pollsToShow: itemarray.slice(0, itemsPerPage),
                    changePage: function(num){
                        var start = itemsPerPage*(num-1);
                        var end = itemsPerPage*num;
                        this.pollsToShow = itemarray.slice(start, end);
                    }
                };
            }
        };
    }]);