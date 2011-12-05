function UnityWebMediator() {
    this.android = navigator.userAgent.match(/Android/);

    this.queue = [];

    var timerFunction = function(mediator) {
        var url = mediator.queue.shift();

        if (mediator.android) {
            window.location = url;
        } else {
            console.log(url);
        }

        if (mediator.queue.length > 0) {
            setTimeout(timerFunction, 50, mediator);
        }
    };

    this.callback = function(path, args) {
        if (args) {
            var stack = [];
            for (var key in args) {
                stack.push(key + "=" + encodeURIComponent(args[key]));
            }
            this.queue.push("unity://callback" + path + "?" + stack.join("&"));
        } else {
            this.queue.push("unity://callback" + path);
        }

        if (this.queue.length == 1) {
            setTimeout(timerFunction, 50, this);
        }
    };
}
