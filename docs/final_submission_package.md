# Development Tool Homework - Final Submission Package

## Submission status

- Sepolia ETH transfer: completed
- Smart contract source: ready
- Requirements-only explanation file: ready
- Browser demo: ready
- Sepolia contract deployment: completed
- Presentation deck: ready
- Remaining before email submission:
  - Send the draft email below

## Wallet and transfer

- Your wallet address: `0x7D5802Ca1D234d9c525c2bDcc1AB548C742014f6`
- Teacher wallet address: `0x1d2B4152f1925BD0e13D40590eD52e412C78aDBd`
- Sepolia ETH transfer amount: `0.06 ETH`
- Sepolia ETH transfer transaction:
  `0xd728d84628cdca6c9a605a183602b4cbcee1945206e97ab9c761cde59dd013f4`

## Sepolia deployment

- Deployed contract address:
  `0x56f1bcf9abad742ee34c36e338baa078a175693d`
- Contract deployment transaction:
  `0x68d243345a7c64f4d4f28b304bb9ad13cc5cba97bdc35eafd3a536e44957a4fb`
- Etherscan:
  `https://sepolia.etherscan.io/tx/0x68d243345a7c64f4d4f28b304bb9ad13cc5cba97bdc35eafd3a536e44957a4fb`

## Files to use

- Deploy this contract:
  `RaceForgeCampaign.sol`
- Use this file to explain only the homework requirement parts:
  `RaceForgeHomeworkRequirements.sol`
- Browser demo:
  `index.html`
- Presentation deck:
  `RaceForgeCampaign_student_presentation.pptx`
- Email templates:
  `submission_email_templates.md`

## Email attachments

The slides say to submit by email. If screenshot proof is required, attach the
Sepolia transfer proof screenshot as well.
Recommended attachment:

- `screenshots/sepolia_eth_transfer_0.06_etherscan_visible.png`
- `RaceForgeCampaign.sol`
- `RaceForgeCampaign_student_presentation.pptx`

Optional attachment:

- `RaceForgeHomeworkRequirements.sol`

Do not attach the local deployment helper or generated build files unless requested.

## Requirement checklist

1. External function
   - `createCar(string calldata name)`
   - `recordRaceResult(uint256 carId, uint256 day, uint256 finishingPosition)`

2. Deployer-only function using a modifier
   - Modifier: `onlyDeployer`
   - Function: `getContractBalance()`

3. Payable function
   - `upgradeControl(uint256 carId)` requires `0.003 ETH`
   - `upgradeSpeed(uint256 carId)` requires `0.003 ETH`
   - `upgradeAccel(uint256 carId)` requires `0.003 ETH`

4. Event that records interaction or transaction results
   - `RaceCarCreated(address indexed user, ...)`
   - `CarUpgraded(address indexed user, ...)`
   - `RaceResultRecorded(address indexed user, ...)`

5. Sepolia deployment
   - `RaceForgeCampaign.sol` has been deployed to Sepolia testnet.

## Contract concept

The contract theme is a racing game. A user can create a race car for free.
The user can pay Sepolia ETH to upgrade three car stats:

- Control
- Speed
- Acceleration

Each upgrade costs `0.003 ETH` and increases the selected stat by 1 level,
up to level 10. Race results can also be recorded on-chain.

## Demo explanation

The browser demo shows the same concept visually:

- The player's car is marked with a blue `YOU` label and a ring.
- The player upgrades Control, Speed, and Acceleration.
- ETH payment is represented by the `ETH PAID` display.
- The race has AI opponents, position changes, start effects, finish effects,
  and a six-day campaign ending with a boss race.

## Draft email

To: `hank.lu@star-bit.io`

Subject: `Development Tool Homework Submission`

本文:

```text
お世話になっております。
Development Tool の課題を提出いたします。

ウォレットアドレス:
0x7D5802Ca1D234d9c525c2bDcc1AB548C742014f6

Sepolia ETH送金トランザクション:
0xd728d84628cdca6c9a605a183602b4cbcee1945206e97ab9c761cde59dd013f4

デプロイしたコントラクトアドレス:
0x56f1bcf9abad742ee34c36e338baa078a175693d

コントラクトデプロイトランザクション:
0x68d243345a7c64f4d4f28b304bb9ad13cc5cba97bdc35eafd3a536e44957a4fb

コントラクト概要:
レース車の強化とレース結果記録をテーマにしたスマートコントラクトです。
無料でレース車を作成でき、0.003 ETHでカーブ制御・最高速度・加速度を最大10段階まで強化できます。
アップグレード時とレース結果記録時にはユーザーのウォレットアドレスをindexedにしたイベントを発行します。
また、コントラクト残高確認はデプロイ者のみ実行できます。

よろしくお願いいたします。
```
