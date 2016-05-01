angular.module('engineApp').factory("console",function(){
    var consoleObj = {
        display: false,
        lines: [
            'test'
        ],
        task: ' ',
        AddLine: function(line, t) {
            var sub = line.split('\n');
            for(var i = 0; i < sub.length; i++){
                this.lines.push({
                    text: sub[i],
                    type: t || false
                });
            }
            if($('.console').length > 0) {
                $('.console')[0].scrollTop = $('.console')[0].scrollHeight;
            }
        }
    }
    return consoleObj;
});
