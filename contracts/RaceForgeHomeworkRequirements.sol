// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// This file keeps only the homework requirement-facing code in one place.
// Deploy RaceForgeCampaign.sol. Use this file when explaining which lines meet
// each homework requirement.
abstract contract RaceForgeHomeworkRequirements {
    enum UpgradeStat {
        Control,
        Speed,
        Accel
    }

    // Requirement 4: Event with indexed user wallet address.
    event RaceCarCreated(
        address indexed user,
        uint256 indexed carId,
        string name,
        uint256 controlLevel,
        uint256 speedLevel,
        uint256 accelLevel
    );

    // Requirement 4: Event for a paid upgrade interaction.
    event CarUpgraded(
        address indexed user,
        uint256 indexed carId,
        UpgradeStat indexed stat,
        uint256 newLevel,
        uint256 paid
    );

    // Requirement 4: Event for a race result interaction.
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

    // Requirement 2: modifier for deployer-only access.
    modifier onlyDeployer() {
        require(msg.sender == _deployer(), "Only deployer can call this function");
        _;
    }

    // Requirement 1: external function.
    function createCar(string calldata name) external returns (uint256 carId) {
        return _createCar(msg.sender, name);
    }

    // Requirement 3: payable function. This calls internal game logic.
    function upgradeControl(uint256 carId) external payable {
        _requireCarOwner(carId, msg.sender);
        _upgradeStat(carId, UpgradeStat.Control, msg.value);
    }

    // Requirement 3: payable function. This calls internal game logic.
    function upgradeSpeed(uint256 carId) external payable {
        _requireCarOwner(carId, msg.sender);
        _upgradeStat(carId, UpgradeStat.Speed, msg.value);
    }

    // Requirement 3: payable function. This calls internal game logic.
    function upgradeAccel(uint256 carId) external payable {
        _requireCarOwner(carId, msg.sender);
        _upgradeStat(carId, UpgradeStat.Accel, msg.value);
    }

    // Requirement 1 and 4: external function that emits/records a race result.
    function recordRaceResult(uint256 carId, uint256 day, uint256 finishingPosition) external {
        _requireCarOwner(carId, msg.sender);
        _recordRaceResult(carId, day, finishingPosition);
    }

    // Requirement 2: deployer-only function using the modifier.
    function getContractBalance() external view onlyDeployer returns (uint256) {
        return address(this).balance;
    }

    // Requirement 5: deploy the full RaceForgeCampaign contract to Sepolia.

    // Non-requirement details are intentionally hidden behind these helpers.
    function _deployer() internal view virtual returns (address);
    function _requireCarOwner(uint256 carId, address user) internal view virtual;
    function _createCar(address user, string calldata name) internal virtual returns (uint256);
    function _upgradeStat(uint256 carId, UpgradeStat stat, uint256 paid) internal virtual;
    function _recordRaceResult(uint256 carId, uint256 day, uint256 finishingPosition) internal virtual;
}
