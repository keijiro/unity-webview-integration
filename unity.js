function UnityWebMediator() {
    this.android = navigator.userAgent.match(/Android/);
    this.ios = navigator.userAgent.match(/iPhone/) || navigator.userAgent.match(/iPad/);

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
        } else if (this.ios) {
            window.location = "unity://callback" + message;
        } else {
            console.log(message);
        }
    };
}
