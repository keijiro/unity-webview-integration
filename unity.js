function UnityWebMediator() {
    this.android = navigator.userAgent.match(/Android/);

    this.callback = function(path, args) {
        var message = path;
        
        if (args) {
            var stack = [];
            for (var key in args) {
                stack.push(key + "=" + encodeURIComponent(args[key]));
            }
            message += "?" + stack.join("&");
        }
        
        if (this.android) {
            UnityInterface.pushMessage(message);
        } else {
            console.log(message);
        }
    };
}
