このプロジェクトは、アプリ内に組み込んだ web view と Unity の間で連携を行う仕組みを検証するものです。

### サンプルの内容

画面下半分をタップすると Web view が出現します。Web view にあるリンクを押すとそのアクションが Unity 側に通知され、対応する箱がワールド上に生成されます。

Web view に表示しているページのソースは[gh-pagesブランチ](https://github.com/keijiro/unity-webview-integration/tree/gh-pages)に格納されています。このブランチの内容は GitHub Pages によってウェブページとしてホスティングされています。

### インタフェース

次のように`unity:`をスキームとした URL へアクセスすると、その内容が Unity 側へとコールバックされます。

    unity://callback/action/xyz?param1=foo&param2=bar

Unity 側では URL のパス部分（上の例における`/action/xyz`）とパラメータ（上の例における`param1=foo`と`param2=bar`）を取得できます。
