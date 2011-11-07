#pragma strict

// 入力に応じて箱を生み出すスクリプト

var redBoxPrefab : GameObject;
var blueBoxPrefab : GameObject;

function Awake() {
    WebMediator.Install("http://keijiro.github.com/unity-webview-integration/mediator.html");
}

function Update() {
    // WebView からの入力処理。
    var message = WebMediator.PollMessage();
    if (message && message.path == "/spawn") {
        if (message.params.ContainsKey("color")) {
            var prefab = (message.params["color"] == "red") ? redBoxPrefab : blueBoxPrefab;
        } else {
            prefab = Random.value < 0.5 ? redBoxPrefab : blueBoxPrefab;
        }

        var box = Instantiate(prefab, redBoxPrefab.transform.position, Random.rotation) as GameObject; 

        if (message.params.ContainsKey("scale")) {
            box.transform.localScale = Vector3.one * float.Parse(message.params["scale"]);
        }
    }
}

function OnGUI() {
    // Unity GUI からの入力処理。
    var sw = Screen.width;
    var sh = Screen.height;
    if (GUI.Button(Rect(0, 0, 0.5 * sw, 0.05 * sh), "RED")) {
        Instantiate(redBoxPrefab, redBoxPrefab.transform.position, Random.rotation);
    }
    if (GUI.Button(Rect(0.5 * sw, 0, 0.5 * sw, 0.05 * sh), "BLUE")) {
        Instantiate(blueBoxPrefab, blueBoxPrefab.transform.position, Random.rotation);
    }
}
