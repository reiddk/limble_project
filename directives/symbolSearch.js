angular.module('app.directives.symbolSearch', [])
    .directive('symbolSearch', function() {
        return {
            //can only call it as an attribute
            restrict: 'E',
            transclude: true,
            scope: {
                settings: '=symbolSearchSettings',
                callback:'&symbolSearchCallback',
                toSearch:'=symbolSearchToSearch'
            },
            template: `<div style="position:relative;">
            <div ng-transclude></div>
            <div ng-if="possibleMatches.length > 0" ng-style="{bottom:inputElementHeight}" style="position: absolute;
            width: 500px;
            max-height: 65px;
            overflow-y: scroll;
            z-index: 100;
            background-color: white;
            border-radius: 5px;
            padding: 10px;
            -webkit-box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);
            -moz-box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);
            box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);">
                <div ng-repeat="user in possibleMatches">{{user.name}}</div>
            </div>
            
            <div>`,
            link: function (scope, element, attr) {
                const inputElement = element[0].getElementsByTagName('input')[0];
                scope.inputElementHeight = inputElement.clientHeight + 'px';
                let symbolTyping = false;
                let matching = [];
                scope.possibleMatches = [];
                let builtUpSearch = '';
                const symbolSearchID = 'symbol-search-suggestion-wrapper';

                //This is the symbol that will trigger the search
                //The default value is '@'
                const symbolToSearch = (scope.settings && scope.settings.symbol)?scope.settings.symbol:'@';

                //this is an array of symbols that will trigger the callback if a user has been found
                //by default the space key will trigger the callback assuming that a user has been selected
                const callbackOnKeys = (scope.settings && scope.settings.callbackOnKeys && scope.settings.callbackOnKeys.length)?scope.settings.callbackOnKeys:[' '];
                
                //If you pass an array of objects, this is the property that will be searched on each object
                //The default value is null, if it is set to null then it will assume that you passed an array of strings and not objects.
                const propertyToSearch = (scope.settings && scope.settings.propertyToSearch)?scope.settings.propertyToSearch:null;

                //this will determine if the search value is case sensitive
                const caseSensitive = (scope.settings && scope.settings.caseSensitive);

                //This is the array that will be searched
                const toSearch = scope.toSearch;

                function getSearchValue(s) {
                    let valToSearch = '';
                    if (propertyToSearch) {
                        valToSearch = s[propertyToSearch];
                    } else {
                        valToSearch = s;
                    }
                    return valToSearch;
                }

                function findMatch() {
                    matching = toSearch.filter(s => {
                        let tempBuiltUpSearch = builtUpSearch;
                        const valToSearch = getSearchValue(s);
                        let regex = new RegExp(symbolToSearch + valToSearch + ' ', (!caseSensitive)?'gi':'g');
                        return (inputElement.value + ' ').match(regex);
                    });
                }

                function findPossibleMatches(builtUpSearch) {
                    return toSearch.filter(s => {
                        let tempBuiltUpSearch = builtUpSearch;
                        const valToSearch = getSearchValue(s);
                        let regex = new RegExp(symbolToSearch + builtUpSearch, (!caseSensitive)?'gi':'g');
                        return (symbolToSearch+valToSearch).match(regex);
                    });
                }

                function correctCapitalization() {
                    matching.forEach(match => {
                        const valToSearch = getSearchValue(match);
                        let regex = new RegExp(symbolToSearch + valToSearch,'gi');
                        inputElement.value = inputElement.value.replace(regex, (matchWithSymbol) => {
                            return matchWithSymbol.replace(new RegExp(valToSearch,'gi'), valToSearch)
                        });
                    });
                }


                inputElement.addEventListener('keypress', function(event) {
                    if (callbackOnKeys.includes(event.key)) {
                        console.log('it endssssss');
                        findMatch();
                        symbolTyping = false;
                        if (matching.length > 0) {
                            scope.callback({event:matching, key:event.key});
                            if (!caseSensitive) {
                                correctCapitalization();
                            }
                            scope.possibleMatches = [];
                        }
                    }
                    if (symbolTyping) {
                        builtUpSearch = inputElement.value.split(symbolToSearch).splice(-1) + event.key;
                        scope.possibleMatches = findPossibleMatches(builtUpSearch);
                    }
                    if (event.key === symbolToSearch) {
                        console.log('It beginnnnnss');
                        builtUpSearch = '';
                        scope.possibleMatches = toSearch;
                        symbolTyping = true;
                    }
                    console.log(scope.possibleMatches);
                    
                })
            }
        };
    });
