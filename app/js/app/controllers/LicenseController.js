﻿angular.module('engineControllers').controller('LicenseCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text('Subscription');

        $scope.startPayment = function() {
          $('.license-choices-content-wrapper').addClass('payment');
          setTimeout(function() {
            $('#card-number').focus();
          }, 1000);
        }

        $scope.cancel = function() {
          $('.license-choices-content-wrapper').removeClass('payment');
          $('.license-choices-content-wrapper').removeClass('unsubscribe');
        }


        $scope.startUnsubscribe = function() {
          $('.license-choices-content-wrapper').addClass('unsubscribe');
        }

        $scope.unsubscribe = function() {
          $('.loading-icon').addClass('active');
            require('electron').remote.getCurrentWindow().webContents.session.clearCache(function(res, err) { console.log(res, err) })
            $.ajax({
              url: 'http://api.opengine.io/api/v1/account/unsubscribe?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
              method: 'PUT',
              data: {
              },
              success: function(data) {
                  console.log(data);
                  $('.loading-icon').removeClass('active');
                  if(data.success) {
                    alert('Unsubscribed successfully');
                    $scope.user.subscription = null;
                    $('.license-choices-content-wrapper').removeClass('payment');
                    $('.license-choices-content-wrapper').removeClass('unsubscribe');
                  	$(window).trigger('update-account');
                    $scope.$digest();
                  } else {
                    alert('ERR unsubscribing');
                  }
              },
              error: function(data) {
                $('.loading-icon').removeClass('active');
                alert('There was a problem making the call');
              }
            });
        };

        $scope.subscribing = false;

        $scope.subscribe = function() {
          console.log('subscribing');
          $('.loading-icon').addClass('active');

          $scope.cardNumber = $('#card-number').val();
          $scope.cardName = $('#card-name').val();
          $scope.expiration = $('#card-expiration').val();
          $scope.cvc = $('#card-cvc').val();

          console.log($scope.expiration, $scope.cardNumber, $scope.cvc);

          $scope.month = $scope.expiration.split('/')[0].split(' ').join('');
          $scope.year = $scope.expiration.split('/')[1].split(' ').join('');

          $scope.subscribing = true;

          Stripe.setPublishableKey('pk_live_XknMkJP1JCX82Ev7QcC0Hf3R');
          Stripe.card.createToken({
            number: $scope.cardNumber.split(' ').join(''),
            cvc: $scope.cvc,
            exp_month: $scope.month,
            exp_year: $scope.year,
            name: $scope.cardName
          }, function(err, cardToken) {

            console.log(err, cardToken);
            if(err) {
              alert(cardToken.error.message);
            }

            $.ajax({
              url: 'http://api.opengine.io/api/v1/account/subscribe?token=' + window.localStorage['login-token'],
              method: 'POST',
              data: {
                cardToken: cardToken.id
              },
              success: function(data) {
                  console.log(data);
                  $('.loading-icon').removeClass('active');
                  if(data.success) {
                    alert('Subscribed successfully');
                  	$(window).trigger('update-account');
                    window.location = '#!/account';

                  } else {
                    alert('There was a problem: ' + data.message);
                  }
                  $scope.subscribing = false;
                  $scope.$digest();
              },
              error: function(data) {
                $('.loading-icon').removeClass('active');
                alert('There was a problem making the call: ' + data);
              }
            });
          });


        }



        var card = new Card({form: 'form', container: '.card-wrapper'});
	}]);
