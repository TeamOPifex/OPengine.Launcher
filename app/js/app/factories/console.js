angular.module('launcherFactories').factory("console",function(){
    var consoleObj = {
        display: false,
        lines: [
            'test'
        ],
        task: ' ',
        AddLine: function(line, t) {
            var sub = line.split('\n');
            for(var i = 0; i < sub.length; i++){
                // this.lines.push({
                //     text: sub[i],
                //     type: t || false
                // });
                var l = $('<div class="line"></div>');
                var cont = $('<span>' + sub[i] + '</span>');
                switch(t || 0) {
                  case 2:
                    cont.addClass('error');
                    break;
                  case 3:
                    cont.addClass('success');
                    break;
                }
                l.append(cont);
                $('.console').append(l);
            }
            if($('.console').length > 0) {
                $('.console')[0].scrollTop = $('.console')[0].scrollHeight;
            }
        },
        Clear: function() {
          $('.console').html('');
        }
    }
    return consoleObj;
});
