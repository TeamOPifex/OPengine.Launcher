angular.module('engineApp').directive('ngRightClick', function($parse) {
	document.oncontextmenu = function (e) {
       if(e.target.hasAttribute('right-click')) {
           return false;
       }
    };
    return function(scope,el,attrs){
        el.bind('contextmenu',function(event){
			var fn = $parse(attrs.ngRightClick);
			scope.$apply(function() {
				event.preventDefault();
				fn(scope, { $event:event });
			});
        }) ;
    }
});
