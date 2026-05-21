// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RaceForgeCampaign {
    struct RaceCar {
        string name;
        uint256 controlLevel;
        uint256 speedLevel;
        uint256 accelLevel;
        uint256 wins;
        uint256 races;
        uint256 totalPaid;
        address owner;
    }

    enum UpgradeStat {
        Control,
        Speed,
        Accel
    }

    address public immutable deployer;
    uint256 public constant MAX_LEVEL = 10;
    uint256 public constant UPGRADE_FEE = 0.003 ether;

    RaceCar[] private raceCars;

    // Requirement 4: Event records the interaction result.
    // The user's wallet address is indexed so it can be searched on Etherscan.
    event RaceCarCreated(
        address indexed user,
        uint256 indexed carId,
        string name,
        uint256 controlLevel,
        uint256 speedLevel,
        uint256 accelLevel
    );

    // Requirement 4: Event records paid upgrade transactions.
    // The user wallet and car id are indexed for easier lookup.
    event CarUpgraded(
        address indexed user,
        uint256 indexed carId,
        UpgradeStat indexed stat,
        uint256 newLevel,
        uint256 paid
    );

    // Requirement 4: Event records a race result.
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

    // Requirement 2: function modifier for deployer-only access.
    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can call this function");
        _;
    }

    modifier onlyCarOwner(uint256 carId) {
        require(carId < raceCars.length, "Race car does not exist");
        require(raceCars[carId].owner == msg.sender, "You are not the car owner");
        _;
    }

    constructor() {
        deployer = msg.sender;
    }

    // ============================================================
    // Homework requirement section
    // ============================================================

    // Requirement 1: external function.
    // Free action: users can create a race car.
    function createCar(string calldata name) external returns (uint256 carId) {
        carId = _createCar(msg.sender, name);
    }

    // Requirement 3: payable function.
    // Paid action: upgrade control by paying Sepolia ETH.
    function upgradeControl(uint256 carId) external payable onlyCarOwner(carId) {
        _upgradeStat(carId, UpgradeStat.Control, msg.value);
    }

    // Requirement 3: payable function.
    // Paid action: upgrade speed by paying Sepolia ETH.
    function upgradeSpeed(uint256 carId) external payable onlyCarOwner(carId) {
        _upgradeStat(carId, UpgradeStat.Speed, msg.value);
    }

    // Requirement 3: payable function.
    // Paid action: upgrade acceleration by paying Sepolia ETH.
    function upgradeAccel(uint256 carId) external payable onlyCarOwner(carId) {
        _upgradeStat(carId, UpgradeStat.Accel, msg.value);
    }

    // Requirement 1: external function.
    // Records the result of one race. 1st place is treated as a win.
    function recordRaceResult(uint256 carId, uint256 day, uint256 finishingPosition)
        external
        onlyCarOwner(carId)
    {
        _recordRaceResult(carId, day, finishingPosition);
    }

    // Requirement 2: deployer-only function using the onlyDeployer modifier.
    function getContractBalance() external view onlyDeployer returns (uint256) {
        return address(this).balance;
    }

    // Requirement 5: deploy this contract to the Sepolia testnet.

    // ============================================================
    // Extra read functions for demo / presentation
    // ============================================================

    function getCar(uint256 carId)
        external
        view
        returns (
            string memory name,
            uint256 controlLevel,
            uint256 speedLevel,
            uint256 accelLevel,
            uint256 wins,
            uint256 races,
            uint256 totalPaid,
            address owner
        )
    {
        require(carId < raceCars.length, "Race car does not exist");
        RaceCar storage car = raceCars[carId];
        return (
            car.name,
            car.controlLevel,
            car.speedLevel,
            car.accelLevel,
            car.wins,
            car.races,
            car.totalPaid,
            car.owner
        );
    }

    function getCarCount() external view returns (uint256) {
        return raceCars.length;
    }

    // ============================================================
    // Internal game logic. These are helper functions, not the
    // direct homework requirement surface.
    // ============================================================

    function _createCar(address user, string calldata name) private returns (uint256 carId) {
        require(bytes(name).length > 0, "Name is required");

        carId = raceCars.length;
        raceCars.push(RaceCar({
            name: name,
            controlLevel: 1,
            speedLevel: 1,
            accelLevel: 1,
            wins: 0,
            races: 0,
            totalPaid: 0,
            owner: user
        }));

        emit RaceCarCreated(user, carId, name, 1, 1, 1);
    }

    function _upgradeStat(uint256 carId, UpgradeStat stat, uint256 paid) private {
        require(paid == UPGRADE_FEE, "Upgrade costs exactly 0.003 ETH");

        RaceCar storage car = raceCars[carId];
        uint256 newLevel;

        if (stat == UpgradeStat.Control) {
            require(car.controlLevel < MAX_LEVEL, "Control is already max level");
            car.controlLevel += 1;
            newLevel = car.controlLevel;
        } else if (stat == UpgradeStat.Speed) {
            require(car.speedLevel < MAX_LEVEL, "Speed is already max level");
            car.speedLevel += 1;
            newLevel = car.speedLevel;
        } else {
            require(car.accelLevel < MAX_LEVEL, "Accel is already max level");
            car.accelLevel += 1;
            newLevel = car.accelLevel;
        }

        car.totalPaid += paid;
        emit CarUpgraded(msg.sender, carId, stat, newLevel, paid);
    }

    function _recordRaceResult(uint256 carId, uint256 day, uint256 finishingPosition) private {
        require(day >= 1 && day <= 6, "Day must be 1 to 6");
        require(finishingPosition >= 1, "Finishing position is required");

        RaceCar storage car = raceCars[carId];
        bool won = finishingPosition == 1;
        car.races += 1;
        if (won) {
            car.wins += 1;
        }

        emit RaceResultRecorded(
            msg.sender,
            carId,
            day,
            won,
            finishingPosition,
            car.controlLevel,
            car.speedLevel,
            car.accelLevel
        );
    }
}
