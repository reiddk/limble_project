angular.module('app.directives.symbolSearch', [])
    .directive('symbolSearch', function() {
        return {
            //can only call it as an attribute
            restrict: 'A',
            scope: {
                settings: '=symbolSearchSettings',
                callback:'&symbolSearchCallback',
                toSearch:'=symbolSearchToSearch'
            },
            link: function (scope, element, attr) {
                let symbolTyping = false;
                let matching = [];
                let possibleMatches = [];
                let builtUpSearch = '';

                //This is the symbol that will trigger the search
                //The default value is '@'
                const symbolToSearch = (scope.settings && scope.settings.symbol)?scope.settings.symbol:'@';

                //this is an array of symbols that will trigger the callback if a user has been found
                //by default the space key will trigger the callback assuming that a user has been selected
                const callbackOnKeys = (scope.settings && scope.settings.callbackOnKeys && scope.settings.callbackOnKeys.length)?scope.settings.callbackOnKeys:[' '];
                
                //If you pass an array of objects, this is the property that will be searched on each object
                //The default value is null, if it is set to null then I will assume that you passed an array of strings and not objects.
                const propertyToSearch = (scope.settings && scope.settings.propertyToSearch)?scope.settings.propertyToSearch:null;

                //this will determine if the search value is case sensitive
                const caseSensitive = (scope.settings && scope.settings.caseSensitive);

                //This is the array that will be searched
                const toSearch = scope.toSearch;

                console.log(callbackOnKeys);
                console.log(scope.settings);
                console.log(element);

                function findMatch() {
                    matching = toSearch.filter(s => {
                        let valToSearch = '';
                        let tempBuiltUpSearch = builtUpSearch;
                        if (propertyToSearch) {
                            valToSearch = s[propertyToSearch];
                        } else {
                            valToSearch = s;
                        }
                        let regex = new RegExp(symbolToSearch + valToSearch + ' ', (!caseSensitive)?'gi':'g');
                        return (element[0].value + ' ').match(regex);
                    });
                    console.log(matching);

                }


                element[0].addEventListener('keypress', function(event) {
                    if (callbackOnKeys.includes(event.key)) {
                        console.log('it endssssss');
                        findMatch();
                        symbolTyping = false;
                        if (matching.length > 0) {
                            console.log(matching);
                            scope.callback({event:matching});
                        }
                    }
                    if (symbolTyping) {
                        builtUpSearch += event.key;
                       /* possibleMatches = toSearch.filter(s => {
                            let valToSearch = '';
                            let tempBuiltUpSearch = builtUpSearch;
                            if (propertyToSearch) {
                                valToSearch = s[propertyToSearch];
                            } else {
                                valToSearch = s;
                            }
                            if (!caseSensitive) {
                                valToSearch = valToSearch.toUpperCase();
                                tempBuiltUpSearch = tempBuiltUpSearch.toUpperCase();
                            }
                            return valToSearch.includes(tempBuiltUpSearch);
                        });*/
                    }
                    if (event.key === symbolToSearch) {
                        console.log('It beginnnnnss');
                        builtUpSearch = '';
                        symbolTyping = true;
                    }
                    
                })
            }
        };
    });
