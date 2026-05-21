import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.5/+esm";

const CONTRACT_ADDRESS = "0x56f1bcf9abad742ee34c36e338baa078a175693d";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const UPGRADE_FEE = ethers.parseEther("0.003");

const ABI = [
  "function createCar(string name) external returns (uint256 carId)",
  "function upgradeControl(uint256 carId) external payable",
  "function upgradeSpeed(uint256 carId) external payable",
  "function upgradeAccel(uint256 carId) external payable",
  "function getCar(uint256 carId) external view returns (string name,uint256 controlLevel,uint256 speedLevel,uint256 accelLevel,uint256 wins,uint256 races,uint256 totalPaid,address owner)",
  "event RaceCarCreated(address indexed user,uint256 indexed carId,string name,uint256 controlLevel,uint256 speedLevel,uint256 accelLevel)",
  "event CarUpgraded(address indexed user,uint256 indexed carId,uint8 indexed stat,uint256 newLevel,uint256 paid)"
];

const el = {
  walletLabel: document.getElementById("walletLabel"),
  chainLabel: document.getElementById("chainLabel"),
  status: document.getElementById("onchainStatus"),
  carId: document.getElementById("onchainCarId"),
  connect: document.getElementById("connectWallet"),
  create: document.getElementById("createOnchainCar"),
  control: document.getElementById("onchainControl"),
  speed: document.getElementById("onchainSpeed"),
  accel: document.getElementById("onchainAccel")
};

let provider;
let signer;
let contract;
let account;

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function setStatus(message) {
  el.status.textContent = message;
}

function setBusy(busy) {
  for (const button of [el.connect, el.create, el.control, el.speed, el.accel]) {
    button.disabled = busy;
  }
}

function rememberCarId(carId) {
  el.carId.value = String(carId);
  localStorage.setItem("raceforge.carId", String(carId));
}

function restoreCarId() {
  const saved = localStorage.getItem("raceforge.carId");
  if (saved !== null) el.carId.value = saved;
}

function currentCarId() {
  const value = Number(el.carId.value);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("carId must be 0 or greater");
  }
  return BigInt(value);
}

async function ensureSepolia() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId === SEPOLIA_CHAIN_ID) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  } catch (error) {
    if (error.code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: SEPOLIA_CHAIN_ID,
        chainName: "Sepolia",
        nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://rpc.sepolia.org"],
        blockExplorerUrls: ["https://sepolia.etherscan.io"]
      }]
    });
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus("MetaMaskが見つかりません。ChromeのMetaMask拡張を開いてください。");
    return;
  }

  setBusy(true);
  try {
    await ensureSepolia();
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    account = accounts[0];
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    el.walletLabel.textContent = `Wallet: ${shortAddress(account)}`;
    el.chainLabel.textContent = `Sepolia contract: ${shortAddress(CONTRACT_ADDRESS)}`;
    setStatus("接続完了。CREATE CARか、carIdを指定して強化できます。");
  } catch (error) {
    setStatus(`接続失敗: ${error.shortMessage || error.message}`);
  } finally {
    setBusy(false);
  }
}

async function requireContract() {
  if (!contract) await connectWallet();
  if (!contract) throw new Error("wallet is not connected");
  await ensureSepolia();
  return contract;
}

async function createCar() {
  setBusy(true);
  try {
    const raceForge = await requireContract();
    setStatus("MetaMaskで車作成トランザクションを確認してください。");
    const tx = await raceForge.createCar("YOU");
    setStatus(`送信済み: ${shortAddress(tx.hash)} / 承認待ち...`);
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log) => {
        try { return raceForge.interface.parseLog(log); } catch { return null; }
      })
      .find((log) => log?.name === "RaceCarCreated");
    if (event) rememberCarId(event.args.carId);
    setStatus(`車作成成功。carId=${el.carId.value} / tx ${shortAddress(tx.hash)}`);
  } catch (error) {
    setStatus(`車作成失敗: ${error.shortMessage || error.message}`);
  } finally {
    setBusy(false);
  }
}

async function upgrade(kind) {
  setBusy(true);
  try {
    const raceForge = await requireContract();
    const carId = currentCarId();
    const method = {
      control: "upgradeControl",
      speed: "upgradeSpeed",
      accel: "upgradeAccel"
    }[kind];
    setStatus(`MetaMaskで ${kind.toUpperCase()} 強化 0.003 ETH を確認してください。`);
    const tx = await raceForge[method](carId, { value: UPGRADE_FEE });
    setStatus(`送信済み: ${shortAddress(tx.hash)} / 承認待ち...`);
    await tx.wait();
    setStatus(`${kind.toUpperCase()} 強化成功。Sepoliaに記録されました。tx ${shortAddress(tx.hash)}`);
  } catch (error) {
    setStatus(`強化失敗: ${error.shortMessage || error.message}`);
  } finally {
    setBusy(false);
  }
}

restoreCarId();
el.connect.addEventListener("click", connectWallet);
el.create.addEventListener("click", createCar);
el.control.addEventListener("click", () => upgrade("control"));
el.speed.addEventListener("click", () => upgrade("speed"));
el.accel.addEventListener("click", () => upgrade("accel"));

if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", () => window.location.reload());
  window.ethereum.on?.("chainChanged", () => window.location.reload());
}
