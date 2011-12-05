#pragma strict

// 入力に応じて箱を生み出すスクリプト

var guiSkin : GUISkin;
var redBoxPrefab : GameObject;
var blueBoxPrefab : GameObject;

private var note : String;

private function ActivateWebView() {
    // 指定 URL のロード要求。
    WebMediator.LoadUrl("http://keijiro.github.com/unity-webview-integration/index.html");
    // 表示を有効化する。
    WebMediator.SetMargin(12, Screen.height / 2 + 12, 12, 12);
    WebMediator.Show();
}

private function DeactivateWebView() {
    // 表示を無効化する
    WebMediator.Hide();
}

private function ProcessMessages() {
    while (true) {
        var message = WebMediator.PollMessage();
        if (!message) break;

        if (message.path == "/spawn") {
            // 引数に応じた箱を生成する。
            if (message.args.ContainsKey("color")) {
                var prefab = (message.args["color"] == "red") ? redBoxPrefab : blueBoxPrefab;
            } else {
                prefab = Random.value < 0.5 ? redBoxPrefab : blueBoxPrefab;
            }

            var box = Instantiate(prefab, redBoxPrefab.transform.position, Random.rotation) as GameObject; 

            if (message.args.ContainsKey("scale")) {
                box.transform.localScale = Vector3.one * float.Parse(message.args["scale"] as String);
            }
        } else if (message.path == "/note") {
            // 引数からテキストを受け取る。
            note = message.args["text"];
        } else if (message.path == "/close") {
            // WebView の非表示化。
            DeactivateWebView();
        }
    }
}

function Start() {
    // WebView の組み込み。ここではまだ非表示。
    WebMediator.Install();
}

function Update() {
    if (WebMediator.IsVisible()) {
        ProcessMessages();
    } else {
        if (Input.GetButtonDown("Fire1") && Input.mousePosition.y < Screen.height / 2) {
            ActivateWebView();
        }
    }
}

function OnGUI() {
    var sw = Screen.width;
    var sh = Screen.height;

    GUI.skin = guiSkin;

    if (note) GUI.Label(Rect(0, 0, sw, 0.5 * sh), note);

    GUI.Label(Rect(0, 0.5 * sh, sw, 0.5 * sh), "TAP HERE", "center");
}
