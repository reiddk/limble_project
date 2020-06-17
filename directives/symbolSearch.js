angular.module('app.directives.symbolSearch', [])
    .directive('symbolSearch', function() {
        return {
            //can only call it as an element
            restrict: 'E',
            require: '?ngModel',
            scope: {
                settings: '=symbolSearchSettings',
                callback:'&symbolSearchCallback',
                toSearch:'=symbolSearchToSearch',
                enterCallback: '&symbolSearchEnterCallback'
            },
            template: `
            <style>
            [contenteditable][placeholder]:empty:before {
                content: attr(placeholder);
                position: absolute;
                color: gray;
                background-color: transparent;
              }
                .matches-wrapper {
                    position: absolute;
                    max-width: 250px;
                    min-width: 150px;
                    max-height: 65px;
                    overflow-y: scroll;
                    z-index: 100;
                    background-color: white;
                    border-radius: 5px;
                    padding: 10px;
                    -webkit-box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);
                    -moz-box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);
                    box-shadow: 0px 0px 5px 1px rgba(0,0,0,0.75);
                }
                .matches-wrapper div {
                    padding:5px;
                    border-radius:5px;
                    cursor:pointer;
                }
                .matches-wrapper div:nth-child(odd) {
                    background-color:#f1f1f1;
                }
                .matches-wrapper div:hover, .active {    
                    background-color: #424284 !important;
                    color: white;
                }
            </style>
            <div style="position:relative;">
            <div style="display:inline-block;overflow:hidden;" contenteditable placeholder="{{placeHolder}}" class="symbol-search-content-editable {{classes}}" ng-model="theval"></div>
            <input style="display:none;" ng-model="theval" />
            <div ng-if="possibleMatches.length > 0" ng-style="{bottom:inputElementHeight, left:inputElementCursor}" class="matches-wrapper">
                <div class="possible-matches" ng-click="chooseMatch($index)" ng-repeat="user in possibleMatches">{{user[propertyToSearch]}}</div>
            </div>
            
            <div>`,
            link: function (scope, element, attr, ngModel) {
                if (!ngModel) {
                    return;
                }
                console.log(ngModel);
              //  const inputElement = element[0].getElementsByTagName('input')[0];
                const inputElement = element[0].getElementsByClassName('symbol-search-content-editable')[0];
                console.log(inputElement);
                scope.inputElementHeight = inputElement.clientHeight + 'px';
                scope.inputElementCursor = '0px';
                scope.activeMatchIndex = 0;
                let symbolTyping = false;
                let matching = [];
                scope.possibleMatches = [];
                let symbolToReplaceLocation = 0;
                let lastSpaceTriggerMatchingLength = 0;
                let builtUpSearch = '';
                let previousDown = '';
                const arrowUp = 38;
                const arrowDown = 40;
                const symbolSearchID = 'symbol-search-suggestion-wrapper';

                //This is the symbol that will trigger the search
                //The default value is '@'
                const symbolToSearch = (scope.settings && scope.settings.symbol)?scope.settings.symbol:'@';

                //this is an array of symbols that will trigger the callback if a user has been found
                //by default the space key will trigger the callback assuming that a user has been selected
                const callbackOnKeys = (scope.settings && scope.settings.callbackOnKeys && scope.settings.callbackOnKeys.length)?scope.settings.callbackOnKeys:[' '];
                
                //If you pass an array of objects, this is the property that will be searched on each object
                //The default value is null, if it is set to null then it will assume that you passed an array of strings and not objects.
                scope.propertyToSearch = (scope.settings && scope.settings.propertyToSearch)?scope.settings.propertyToSearch:null;

                //this will determine if the search value is case sensitive
                const caseSensitive = (scope.settings && scope.settings.caseSensitive);

                //placeholder
                scope.placeHolder = (scope.settings && scope.settings.placeholder)?scope.settings.placeholder:'';

                //classes to style the editable div
                scope.classes = (scope.settings && scope.settings.classes)?scope.settings.classes:''
                
                //This is the array that will be searched
                const toSearch = scope.toSearch;


                function placeCaretAtEnd(el) {
                    el.focus();
                    if (typeof window.getSelection != "undefined"
                            && typeof document.createRange != "undefined") {
                        var range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (typeof document.body.createTextRange != "undefined") {
                        var textRange = document.body.createTextRange();
                        textRange.moveToElementText(el);
                        textRange.collapse(false);
                        textRange.select();
                    }
                }
                

                function getSearchValue(s) {
                    let valToSearch = '';
                    if (scope.propertyToSearch) {
                        valToSearch = s[scope.propertyToSearch];
                    } else {
                        valToSearch = s;
                    }
                    return valToSearch;
                }

                function findMatch() {
                    matching = toSearch.filter(s => {
                        let tempBuiltUpSearch = builtUpSearch;
                        const valToSearch = getSearchValue(s);
                        let regex = new RegExp(symbolToSearch + valToSearch + '\\s', (!caseSensitive)?'gi':'g');
                        return (inputElement.textContent + ' ').match(regex);
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

                function clearPossibleMatches() {
                    scope.possibleMatches = [];
                    scope.activeMatchIndex = -1;
                }

                scope.safeApply = function(fn) {
                    if (this.$root) {
                        var phase = this.$root.$$phase;
                        if (phase == '$apply' || phase == '$digest') {
                            if (fn && (typeof (fn) === 'function')) {
                                fn();
                            }
                        } else {
                            this.$apply(fn);
                        }
                    }
                };

                scope.chooseMatch = function (index) {
                    if (scope.possibleMatches && 
                        scope.possibleMatches[index]) {
                            const toReplace = symbolToSearch + scope.possibleMatches[index][scope.propertyToSearch];
                            const tempValueArr = inputElement.textContent.split('');
                            if (tempValueArr[symbolToReplaceLocation] === symbolToSearch) {
                                let untilSpace = 0;
                                for (let i = symbolToReplaceLocation; i < tempValueArr.length; i++) {
                                    if (tempValueArr[i] === " ") {
                                        break;
                                    }
                                    untilSpace++;
                                }
                                tempValueArr.splice(symbolToReplaceLocation, untilSpace, toReplace);
                                inputElement.textContent = tempValueArr.join('');
                            }
                    }
                    clearPossibleMatches();
                    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
                    placeCaretAtEnd(inputElement);
                }

                function highlightWArrowKey(event) {
                    if (scope.possibleMatches) {
                        if (event.keyCode === arrowUp) {
                            let tempMatchIndex = scope.activeMatchIndex-1;
                            if (tempMatchIndex < 0) {
                                tempMatchIndex = scope.possibleMatches.length-1;
                            }
                            scope.activeMatchIndex = tempMatchIndex;
                        }
                        if (event.keyCode === arrowDown) {
                            let tempMatchIndex = scope.activeMatchIndex+1;
                            if (tempMatchIndex >= scope.possibleMatches.length) {
                                tempMatchIndex = 0;
                            }
                            scope.activeMatchIndex = tempMatchIndex;
                        }
                        const possibleMatchesElements = element[0].getElementsByClassName('possible-matches');
                        for (let i =0; i < possibleMatchesElements.length; i++) {
                            const e = possibleMatchesElements[i];
                            if (e && e.classList && e.classList.remove) {
                                e.classList.remove('active');
                                if (scope.activeMatchIndex === i) {
                                    e.classList.add('active');
                                    e.scrollIntoView();
                                }
                            }
                        }
                    }
                }

                function correctCapitalization() {
                    matching.forEach(match => {
                        const valToSearch = getSearchValue(match);
                        let regex = new RegExp(symbolToSearch + valToSearch,'gi');
                        inputElement.textContent = inputElement.textContent.replace(regex, (matchWithSymbol) => {
                            return matchWithSymbol.replace(new RegExp(valToSearch,'gi'), valToSearch)
                        });
                    });
                }

                function boldKeyWords() {
                    let regexBuilder = "";
                    matching.forEach(match => {
                        const valToSearch = getSearchValue(match);
                        regexBuilder += `(${symbolToSearch + valToSearch})|`;
                    });
                    if (regexBuilder) {
                        regexBuilder = regexBuilder.substring(0, regexBuilder.length-1);
                    }
                    let regex = new RegExp(regexBuilder,(!caseSensitive)?'gi':'g');
                    inputElement.innerHTML = inputElement.textContent.replace(regex, function(match) {
                        return `<b>${match}</b>`;
                    });
                }

                function setLeftDisplacement() {
                    const text = document.createElement("span");
                    document.body.appendChild(text)
                    text.style.visibility = "hidden";
                    text.style.font = window.getComputedStyle(inputElement, null).getPropertyValue('font'); 
                    text.style.fontSize = window.getComputedStyle(inputElement, null).getPropertyValue('font-size'); 
                    text.style.height = 'auto'; 
                    text.style.width = 'auto'; 
                    text.style.position = 'absolute'; 
                    text.style.whiteSpace = 'no-wrap'; 
                    text.innerHTML = inputElement.textContent; 
                    let width = Math.ceil(text.clientWidth);
                    text.parentNode.removeChild(text);
                    if (width > (inputElement.clientWidth - 250)) {
                        width = (inputElement.clientWidth - 250);
                    }
                    scope.inputElementCursor = width + 'px';
                }

                function handleKeyDown(event) {
                    if ((event.key === 'Enter' || event.key === 'ArrowRight' || event.key === 'Tab') && scope.possibleMatches && 
                    scope.possibleMatches.length &&
                    scope.activeMatchIndex >= 0) {
                        scope.chooseMatch(scope.activeMatchIndex);
                    }
                    if (event.keyCode === arrowUp ||
                        event.keyCode === arrowDown) {
                            highlightWArrowKey(event);
                            return;
                    }

                    if (callbackOnKeys.includes(event.key)) {
                        findMatch();
                        symbolTyping = false;
                        if (matching.length > 0) {
                            if (event.key !== " " || lastSpaceTriggerMatchingLength !== matching.length) {
                                scope.callback({event:matching, key:event.key});
                            }
                            lastSpaceTriggerMatchingLength = matching.length;
                            if (!caseSensitive) {
                                correctCapitalization();
                            }
                            boldKeyWords();
                            scope.possibleMatches = [];
                            placeCaretAtEnd(inputElement);
                        }
                    }
                    if (symbolTyping) {
                        builtUpSearch = inputElement.textContent.split(symbolToSearch).splice(-1) + event.key;
                        scope.possibleMatches = findPossibleMatches(builtUpSearch);
                    }
                    if (event.key === symbolToSearch) {
                        builtUpSearch = '';
                        //get carat location 
                        let _range = document.getSelection().getRangeAt(0);
                        let range = _range.cloneRange();
                        range.selectNodeContents(inputElement);
                        range.setEnd(_range.endContainer, _range.endOffset);
                        symbolToReplaceLocation = range.toString().length;
                        
                        scope.possibleMatches = toSearch;
                        setLeftDisplacement();
                        symbolTyping = true;
                    }

                    scope.safeApply(scope.possibleMatches);
                    if(event.which === 13 && scope.enterCallback) {
                        scope.safeApply(scope.enterCallback);
                        event.preventDefault();
                        inputElement.innerHTML = "";
                        clearPossibleMatches();
                    }
                }

                inputElement.addEventListener('keyup', function(event) {
                    ngModel.$setViewValue(inputElement.innerHTML);
                });


                inputElement.addEventListener('keydown', function(event) {
                    handleKeyDown(event);
                });
            }
        };
    });
