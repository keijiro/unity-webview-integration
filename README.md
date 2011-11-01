### サンプルの内容

![Screenshot (DROID 2)](https://github.com/downloads/keijiro/unity-webview-integration/device-2011-11-01-123428.png)

上半分が Unity の表示、下半分が web view となっています。Web view にあるボタンを押すとそのアクションが Unity 側に通知され、対応する色の箱がワールド上に生成されます。

なお、画面上部にもボタンが用意されています。これは Unity 画面に対するインタラクションが有効であることを確認するために用意してあるものです。

### 既知の問題 (Android)

- Web view が破棄された場合にそれを復帰させていません。バックグラウンドにして他の作業を行い、再びこのアプリへ戻ってきたときに web view の部分が真っ暗になっている場合があります。
