このプロジェクトは、アプリ内に組み込んだ web view と Unity の間で連携を行う仕組みを検証するものです。

### サンプルの内容

![Screenshot (DROID 2)](https://github.com/downloads/keijiro/unity-webview-integration/iPhone4.png)

上半分が Unity の表示、下半分が web view となっています。Web view にあるリンクを押すとそのアクションが Unity 側に通知され、対応する箱がワールド上に生成されます。

なお、画面上部にもボタンが用意されています。これは Unity 画面に対するインタラクションが有効であることを確認するために用意してあるものです。

Web view に表示しているページのソースは[gh-pagesブランチ](https://github.com/keijiro/unity-webview-integration/tree/gh-pages)に格納されています。このブランチの内容は GitHub Pages によってウェブページとしてホスティングされています。

### インタフェース

次のように`unity:`をスキームとした URL へアクセスすると、その内容が Unity 側へとコールバックされます。

    unity://callback/action/xyz?param1=foo&param2=bar

Unity 側では URL のパス部分（上の例における`/action/xyz`）とパラメータ（上の例における`param1=foo`と`param2=bar`）を取得できます。

### 既知の問題 (iOS)

- Web view に対するインタラクションを行っている最中は Unity 側の動作が止まるという問題があります。これは Display Link の使用を止めることによって回避できます。

### 既知の問題 (Android)

- Web view が破棄された場合にそれを復帰させていません。バックグラウンドにして他の作業を行い、再びこのアプリへ戻ってきたときに web view の部分が真っ暗になっている場合があります。

### 分かりにくいポイント (Android)

- NativeActivity に対応した環境（Android 2.3 以降）で web view 組み込みを行うと、web view にタッチイベントが届かないという現象が発生します。この問題を解決するには [AndroidManifest](https://github.com/keijiro/unity-webview-integration/blob/master/unity/Assets/Plugins/Android/AndroidManifest.xml) の中で NativeActivity を使わない UnityPlayerActivity を起動アクティビティとして明示的に指定してやる必要があります。
