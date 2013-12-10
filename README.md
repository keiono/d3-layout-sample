# D3.js Advent Calendar 2013
### Day 11: 12/11/2013 スクリプトを書かずに各種グラフデータをD3.jsで扱える形式に書き出す


### はじめに
私はアメリカの大学の医学部で、お医者さんや生物学者向けのソフトウェア開発を行っているものです。ずっとJavaやC++などの世界に居ましたので、Webの世界はまだまだ勉強中です。その勉強の過程ででっち上げたツールなどを少し公開させていただきます。一部「生煮え」のものも含まれるので、徐々に改善していきます。


### D3.jsとグラフデータ
D3.jsには「元になるデータのフォーマットに関する制約は最小限にする」と言う思想があるようです。基本的にはCSVなどのテーブル形式でデータを用意すれば大抵の場合は間に合います。そんな中[グラフ](http://ja.wikipedia.org/wiki/%E3%82%B0%E3%83%A9%E3%83%95_(%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0))形式のデータに関しては、並び順(ordinal)をIDとみなすという、冗長性は少なくなる一方、若干可読性に欠ける方式となっています。もちろんそれでもシンプルなので、ちょっとしたスクリプトを書いてしまえば済む作業ですが、目で見ながらグラフィカルにグラフ構造をエディットし、それを自動的に書き出せたらそれも便利です。

というわけで作りました。これは、[Cytoscape](http://cytoscape.org/)と言うグラフ解析・可視化アプリケーションの上で動くプラグイン(App)で、読み込まれたグラフのトポロジと属性データをそのままD3.jsで読み込める形式に書き出すものです。


### ソフトウェアのダウンロードとインストール
現在このAppは正式発表前のCytoscape 3.1.0以降にのみの対応しているため、ベータ版のダウンロードが必要となります。
(注: どちらも、最終版がリリースされた時にこのドキュメントもアップデートします。）

http://chianti.ucsd.edu/~kono/data/cy3latest/build-2013-12-04-21-32-34-PST/  (12/4/2013の最新ビルド）

そして、このAppをインストールする。

https://github.com/keiono/cytoscape-d3/releases/tag/1.0.0-BETA

App-->App ManagerでAppのインストール画面を開いて、***Install from File...*** ボタンをクリックすれば、あとはダウンロードした.jarファイルを指定するだけです。



### ネットワークの作成
Cytoscapeで読み込める形式なら何でもかまいませんが、最もシンプルなものはエッジのリストを書いただけのテーブル形式でしょう。

例えば、このリストは

```
1	2
2	3
3	1
1	4
4	3
```

以下のように読み込む事ができます:

![Small Network Sample](https://raw.github.com/keiono/d3-layout-sample/develop/doc/img/small.png)


ネットワークの読み込み方は、[こちら](http://opentutorials.cgl.ucsf.edu/index.php/Tutorial:Introduction_to_Cytoscape_3-part2#Loading_a_Simple_Network)を参考にして下さい。


#### 各種データの追加
D3.jsに限りませんが、複雑な可視化を目指す場合、各種統計量や、その他ノードやエッジに付随するデータを一緒に使うのが一般的です。Cytoscape上であれば、そういったものを比較的簡単に統合することが出来、それをそのままD3.jsように書き出されるJSONに含めることが可能です。以下は、読み込んだ比較的小規模なネットワークを、NetworkAnalyzerと言う機能で各種統計量を計算して、それをそのまま書き出した例です:


```javascript
  "nodes" : [ {
    "id" : "1480",
    "NeighborhoodConnectivity" : 2.0,
    "NumberOfDirectedEdges" : 1,
    "SUID" : 1480,
    "Stress" : 0,
    "SelfLoops" : 0,
    "IsSingleNode" : false,
    "PartnerOfMultiEdgedNodePairs" : 0,
    "selected" : false,
    "name" : "YDL194W",
    "Degree" : 1,
    "TopologicalCoefficient" : 0.0,
    "BetweennessCentrality" : 0.0,
    "Radiality" : 0.55122461,
    "Eccentricity" : 26,
    "NumberOfUndirectedEdges" : 0,
    "ClosenessCentrality" : 0.07623732,
    "shared_name" : "YDL194W",
    "AverageShortestPathLength" : 13.11693548,
    "ClusteringCoefficient" : 0.0
  }]
```

このように、各種統計量が含まれた状態でネットワークを書き出すことができれば、D3.jsの基本的な機能を使って、それらを視覚効果へとマッピングすることが容易です。

この記事の主眼は、あくまでCytoscape上でエディットしたデータを簡単にD3.js形式に書き出すという点なので、Cytoscapeに関する詳しい説明はしませんが、興味のある方は以下のリンクを参考にして下さい。

 * [Cytoscape Official Web Site](http://cytoscape.org/)


いくつかプレゼンテーションスライドもありますので、興味のある方はどうぞ:

 * [繋がりを見る](http://www.slideshare.net/keiono/cytoscape)
 * [Cytoscape Presentations at SpeakerDeck](https://speakerdeck.com/keiono)



### D3.jsへの書き出し
File-->Export-->Networkで、D3.js形式のフォーマットを選択するだけです。書き出しの結果は[こんな感じ](https://github.com/keiono/d3-layout-sample/blob/develop/app/data/net1.json)になります:


### 書き出されるデータのサンプルと実際の可視化
一度様々な属性値(attributes)を付随したグラフデータをJSON化すれば、それをマッピングするのは非常に容易で、例えば[Edge Betweenness](http://med.bioinf.mpi-inf.mpg.de/netanalyzer/help/2.7/index.html#attributes)をエッジの太さとしたいときは、*stroke-width* attributeの返り値にそのデータを指定するだけで良い（そのままでは太さの値としては大きすぎるので、底を10とする対数としました）:

```javascript
var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .attr('stroke-width', function(d) {
        return Math.log(d.EdgeBetweenness)/ Math.LN10;
    });
```

更にシンプルな例として、ノードの次数をそのままノードの大きさにマッピングすることも、同じように返り値を半径にマップするだけで可能です:

```javascript
node.append("circle")
    .attr("class", "node")
    .attr("r", function(d) {
        return d.Degree;
    });
```

書き出した結果を単純に可視化したものは[こちら](http://chianti.ucsd.edu/~kono/js/sample1/)です。このレポジトリにサンプルコードを含めておきます。Yeomanで作成したテンプレートほぼそのままです。ビルドにはnode.jsとGruntが必要です。

![net1.json](https://raw.github.com/keiono/d3-layout-sample/develop/doc/img/sample1.png)


このように、予め外部でネットワークに関する詳細なデータを付加しておくことにより、より複雑な可視化のアイデアを実装していくことが可能になります。

Tree形式の書き出しと、更に複雑な可視化例は次回の記事に。

質問等は、kono アットマークucsdドットeduまでお願いします。


