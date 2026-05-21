# Iot特論 Blockchain 発表台本

## 1ページ目: 表紙

これから、Development Tool 課題として作成したスマートコントラクトについて発表します。

作品名は、`RaceForgeCampaign` です。

テーマは、レース車を作って、Sepolia ETH を支払うことで車の能力が上がる、というものです。

今回は Solidity でスマートコントラクトを作成し、それを Sepolia テストネットにデプロイしました。

また、Webゲームの画面も作って、スマートコントラクトのテーマが見た目でも分かるようにしました。

この発表では、まず課題要件を確認して、次にテーマ、コード、実行結果、最後に感想の順番で説明します。

## 2ページ目: 課題要件

まず、今回の課題要件について説明します。

この課題では、主に5つの条件を満たす必要がありました。

1つ目は、外部から呼び出せる `external function` を1つ以上作ることです。

2つ目は、コントラクトをデプロイしたウォレットアドレスだけが実行できる機能を、`modifier` を使って作ることです。

3つ目は、ETHを支払う必要がある `payable function` を1つ以上作ることです。

4つ目は、`Event` を実装して、操作結果やトランザクション結果を記録することです。

5つ目は、作成したコントラクトを Sepolia テストネットにデプロイすることです。

今回の実装では、この5つをすべて満たすように作りました。

先生のポケモン例と同じように、「無料作成」「有料強化」「Eventで記録」という構造を、レース車のテーマに置き換えています。

## 3ページ目: テーマ

次に、テーマについて説明します。

先生の例では、シンプルなポケモンがテーマでした。

ポケモンには、名前、攻撃力、防御力があり、無料でポケモンを作成できて、有料で攻撃力や防御力を上げるという内容でした。

今回私は、その構造をレース車に置き換えました。

ポケモンの攻撃力や防御力にあたる部分を、レース車の `カーブ制御`、`速度`、`加速度` にしました。

無料でレース車を作成できて、0.003 ETH を払うことで、Control、Speed、Accel のどれかを1段階強化できるようにしています。

また、強化した操作やレース結果を Event として記録するようにしました。

難しいテーマにしすぎると自分で説明しにくくなるので、課題例と同じ構造を保ったまま、見た目として分かりやすいレースゲームにしました。

## 4ページ目: 要件1 external function

ここからは、課題要件に対応するコードについて説明します。

まず、要件1の `external function` です。

`external` は、コントラクトの外部から呼び出せる関数という意味です。

今回のコードでは、`createCar` を external function として作りました。

```solidity
function createCar(string calldata name)
    external
    returns (uint256 carId)
{
    carId = _createCar(msg.sender, name);
}
```

この関数は、ユーザーが無料でレース車を作る入口です。

`msg.sender` は、この関数を呼び出したウォレットアドレスを表します。

つまり、車を作った人のウォレットアドレスを使って、その人の車として登録しています。

また、レース結果を記録する `recordRaceResult` も external function です。

```solidity
function recordRaceResult(
    uint256 carId,
    uint256 day,
    uint256 finishingPosition
) external onlyCarOwner(carId) {
    _recordRaceResult(carId, day, finishingPosition);
}
```

この関数は、どの車が、何日目のレースで、何位だったかを記録するための入口です。

このように、外部から呼び出せる関数を作っているので、要件1を満たしています。

## 5ページ目: 要件2 デプロイ者だけが実行できる機能

次に、要件2の、デプロイ者だけが実行できる機能について説明します。

ここでは、`onlyDeployer` という modifier を作りました。

```solidity
address public immutable deployer;

modifier onlyDeployer() {
    require(
        msg.sender == deployer,
        "Only deployer can call this function"
    );
    _;
}

constructor() {
    deployer = msg.sender;
}
```

`constructor` は、コントラクトをデプロイしたときに一度だけ実行される処理です。

ここで `deployer = msg.sender` としているので、デプロイしたウォレットアドレスを保存しています。

`onlyDeployer` の中では、`msg.sender` が `deployer` と同じかどうかを `require` で確認しています。

`require` は、条件を満たしていなければ処理を止める命令です。

そして、この modifier を `getContractBalance` に付けています。

```solidity
function getContractBalance()
    external
    view
    onlyDeployer
    returns (uint256)
{
    return address(this).balance;
}
```

この関数は、コントラクトに入っているETHの残高を確認する関数です。

`onlyDeployer` が付いているので、デプロイしたウォレットだけが実行できます。

そのため、要件2を満たしています。

## 6ページ目: 要件3 ETHを払う payable function

次に、要件3の `payable function` について説明します。

`payable` は、その関数がETHを受け取れるという意味です。

今回のコードでは、Control、Speed、Accel の3種類の強化関数を payable にしています。

```solidity
uint256 public constant UPGRADE_FEE = 0.003 ether;

function upgradeControl(uint256 carId) external payable onlyCarOwner(carId) {
    _upgradeStat(carId, UpgradeStat.Control, msg.value);
}

function upgradeSpeed(uint256 carId) external payable onlyCarOwner(carId) {
    _upgradeStat(carId, UpgradeStat.Speed, msg.value);
}

function upgradeAccel(uint256 carId) external payable onlyCarOwner(carId) {
    _upgradeStat(carId, UpgradeStat.Accel, msg.value);
}
```

この3つの関数は、それぞれカーブ制御、速度、加速度を強化します。

全部に `payable` が付いているので、ETHを送って呼び出すことができます。

強化料金は、分かりやすく全部 `0.003 ETH` にしました。

内部処理では、次のように金額を確認しています。

```solidity
require(paid == UPGRADE_FEE, "Upgrade costs exactly 0.003 ETH");
```

これは、支払われたETHがちょうど 0.003 ETH でなければ、強化処理を止めるという意味です。

また、`onlyCarOwner(carId)` を付けているので、自分の車だけを強化できるようにしています。

この部分で、要件3を満たしています。

## 7ページ目: 要件4 Eventで操作結果を残す

次に、要件4の Event について説明します。

Event は、トランザクションの結果をログとして残すための仕組みです。

今回のコードでは、強化したときの記録として `CarUpgraded` を作りました。

```solidity
event CarUpgraded(
    address indexed user,
    uint256 indexed carId,
    UpgradeStat indexed stat,
    uint256 newLevel,
    uint256 paid
);
```

この Event では、誰が、どの車を、どの能力で、何レベルに強化したか、そしていくら払ったかを記録します。

`address indexed user` のように `indexed` を付けると、Etherscanなどでウォレットアドレスから検索しやすくなります。

また、レース結果を記録するために `RaceResultRecorded` も作っています。

```solidity
event RaceResultRecorded(
    address indexed user,
    uint256 indexed carId,
    uint256 indexed day,
    bool won,
    uint256 finishingPosition,
    uint256 controlLevel,
    uint256 speedLevel,
    uint256 accelLevel
);
```

実際に強化が成功したときは、次のように `emit` しています。

```solidity
emit CarUpgraded(msg.sender, carId, stat, newLevel, paid);
```

`emit` することで、強化結果がブロックチェーン上のログとして残ります。

このように Event を使って操作結果を記録しているので、要件4を満たしています。

## 8ページ目: 要件5 Sepoliaテストネットにデプロイ

次に、要件5の Sepolia テストネットへのデプロイについて説明します。

作成した `RaceForgeCampaign` コントラクトは、Sepolia テストネットにデプロイしました。

コントラクトアドレスは、次の通りです。

```text
0x56f1bcf9abad742ee34c36e338baa078a175693d
```

デプロイトランザクションは、次の通りです。

```text
0x68d243345a7c64f4d4f28b304bb9ad13cc5cba97bdc35eafd3a536e44957a4fb
```

Sepolia はテストネットなので、ここで使うETHはテスト用のETHです。

実際のお金として使うメインネットETHではありません。

このように、作成したコントラクトを Sepolia に公開しているので、要件5も満たしています。

## 9ページ目: 実行結果

次に、実行結果について説明します。

Web画面では、スマートコントラクトのテーマをレースゲームとして見えるようにしました。

自分の車は `YOU` と表示されます。

車には、Control、Speed、Accel の3つの能力があります。

Control はカーブ制御、Speed は最高速度、Accel は加速度です。

レースは1周で、4台の車が走り、順位が決まります。

また、6日間のコースを用意していて、それぞれ特徴が違います。

ただし、このWebゲーム画面は、課題の必須要件そのものというより、スマートコントラクトのテーマを見せるためのデモです。

実際にETHを支払う必要がある部分は、Solidity側の `payable function` で表現しています。

画面上でも、MetaMaskと接続して、Sepoliaのコントラクトに対して車作成や強化を呼び出せるようにしました。

## 10ページ目: まとめ・感想

最後に、まとめと感想です。

今回の課題では、`external function`、`modifier`、`payable function`、`Event`、そして Sepolia へのデプロイという5つの要件を満たすように実装しました。

テーマは、先生のポケモン例を参考にして、レース車の強化という形に置き換えました。

また、コードは課題要件に関係ある部分だけ説明しやすいように整理しました。

最初は、仮想通貨とは何なのか、スマートコントラクトで何ができるのかを、何となくしか理解できていませんでした。

しかし今回、ETHを支払うことで能力値を強化するゲームを作ったことで、仮想通貨をただ送るだけではなく、サービスの中の機能として使えることが分かりました。

特に、`payable function` によって支払いが必要な機能を作れることや、`Event` によってユーザーの操作を記録できることが印象に残りました。

ゲームやWebサービスの中で、支払いと機能を結びつけた開発ができるという点が、今回一番学びになりました。

以上で発表を終わります。

