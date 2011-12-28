### 概要

Unity iOS および Android において web view 画面内に組み込み、その内部と連携を行うためのプラグインの実装例です。

![screenshot](https://github.com/downloads/keijiro/unity-webview-integration/IMG_0004.jpg)

上は実装されたサンプルシーンです。上部が Unity の画面で、下部が web view です。 Web view 内のリンクをクリックすることにより Unity 画面内にアクションを起こすことができます。

### 構成

[WebMediator.js](https://github.com/keijiro/unity-webview-integration/blob/master/unity/Assets/Plugins/WebMediator.js) が Unity 側の窓口となるスクリプトです。このスクリプトを通して web view の表示制御、指定 URL のロード、マージンの設定を行うことができます。また、web view 内から送信されたメッセージをここから拾い上げることができます。使用例については [TestInterface.js](https://github.com/keijiro/unity-webview-integration/blob/master/unity/Assets/Scripts/TestInterface.js) を参照してください。

Web view 側からメッセージの送信を行うには [unity.js](https://github.com/keijiro/unity-webview-integration/blob/gh-pages/unity.js) を使用する必要があります。詳しい使い方については、テストプロジェクトの [index.html](https://github.com/keijiro/unity-webview-integration/blob/gh-pages/index.html) を参照してください。
