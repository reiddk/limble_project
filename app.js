'use strict';

// Declare app level module which depends on views, and core components
angular.module('myApp', [
  'app.directives.symbolSearch'
]).
component('chatComponent', {
  templateUrl: 'chat-component/chat-component.html',
  controller: function GreetUserController($scope) {

    $scope.myId = 1;
    $scope.currentComment = {value: ''};

    $scope.users = [
      {'userID' : 1, 'name' : 'Kevin'},
      {'userID' : 2, 'name' : 'Jeff'},
      {'userID' : 3, 'name' : 'Bryan'},
      {'userID' : 4, 'name' : 'Gabbey'},
  ]

  //gets current timestamp minus a certain offset, 
  //I'm using this to give comments a start date close to the current date.
  $scope.getTimestamp = function(offset = 0) {
    return (Number(moment().format('X'))*1000) - offset;
  }

  //turns the time represented by a unix timestamp
  $scope.timestampToDate = function(timestamp) {
    return {
      date: moment(timestamp).format('MMM D YYYY'),
      time: moment(timestamp).format('h:mm A')
    }
    
  }

    $scope.comments = [
      {comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 
      userID: 1, timestamp: $scope.getTimestamp((1000 * 60 * 5)) },
      {comment: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto ', 
      userID: 2, timestamp: $scope.getTimestamp((1000 * 60 * 4))},
      {comment: 'excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.', 
      userID: 3, timestamp: $scope.getTimestamp((1000 * 60 * 10))},
    ].sort((a,b) => a.timestamp - b.timestamp);

    $scope.addComment = function() {
      $scope.comments.push({comment:$scope.currentComment.value, userID:$scope.myId, timestamp: $scope.getTimestamp()});
      $scope.currentComment.value = '';
    } 

    $scope.getUserNameFromId = function(userID) {
      const user = $scope.users.find(user => {
        return user.userID === userID;
      });
      return (user && user.name)?user.name:'';
    }

    $scope.personFound = function(matching, key) {
      alert(matching.map(m => m.name).join(','));
    } 

  }
});
