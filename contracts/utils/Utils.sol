// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */

import "../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./Admin.sol";


contract Utils is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    bool private CanTransfer = false;

    uint256 private nextId = 1;

    uint256 private bnbBalance;

    uint256 private lastSeed = 0;

    uint256 private mintPrice = 15000000000000000000;

    uint256 private contractValue = 48000000000000;

    uint256 private mintValue = 480000000000000;
    uint256 private minToClaim = 10000000000000000;

    uint256[] private experienceTable = [
             0, 10, 20, 30, 40, 50,
             60, 70, 80, 90, 100,
             110, 120, 130, 140, 150,
             160, 170, 180, 190, 200];

    uint256[] private powerExpedition = [
             600, 1800, 3000, 4800, 6600,
             9000, 12000, 15000, 18000, 21000 ];

    uint256[] private rewardExpedition = [
             1000000000000000000, 1000000000000000000, 3000, 4800, 6600,
             9000, 12000, 15000, 18000, 21000 ];

    constructor() Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(0xbf752Eb4b851B241A36e22767b304ef28242198A);
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function getMinToClaim() public view returns (uint256) {
        return minToClaim;
    }

    function memcmp(bytes memory a, bytes memory b) internal pure returns(bool){
        return (a.length == b.length) && (keccak256(a) == keccak256(b));
    }

    function strcmp(string memory a, string memory b) public pure returns(bool){
        return memcmp(bytes(a), bytes(b));
    }

    function getExperienceTable(uint256 level) public view returns (uint256) {
        return experienceTable[level];
    }

    function getBasePrisonChance(uint256 rarity, uint256 vicio) public pure returns (uint256) {
        uint256 returnValue = 12;
        if(rarity == 1) returnValue = 14;
        else if(rarity == 2) returnValue = 12;
        else if(rarity == 3) returnValue = 10;
        else returnValue = 7;
        if(vicio >= 10) returnValue += (vicio / 10);
        return returnValue;
    }

    function getMintPrice() public view returns (uint256) {
        return mintPrice;
    }

    function setMintPrice(uint256 _mintPrice) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_mintPrice > 0, "Error 02");
        mintPrice = _mintPrice;
    }

    function getMintValue() public view returns (uint256) {
        return mintValue;
    }

    function getContractValue() public view returns (uint256) {
        return contractValue;
    }

    function bnbWithdraw() onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        address payable owner = payable(msg.sender);
        require(bnbBalance > 0, "Insufficient Balance");
        owner.transfer(bnbBalance);
    }

    function getBlockChainTime() public view returns (uint256)
    {
        return block.timestamp;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == type(IERC721Receiver).interfaceId;
    }

    function _rand(uint256 max) private view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(
        block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)))));
        seed = (seed - ((seed / 1000) * 1000));
        return seed % max;
    }

    function _rand2(uint256 max) private view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(
        block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.gaslimit +  ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp))
        )));
        seed = (seed - ((seed / 1000) * 1000));
        return seed % max;
    } 

    function _rand3(uint256 max) private view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(
        block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.number +
        ((uint256(keccak256(abi.encodePacked(blockhash(block.number))))) / (block.timestamp))
        )));
        seed = (seed - ((seed / 1000) * 1000));
        return seed % max;
    } 

    function rand(uint256 max) public returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(
        block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.gaslimit + 
        ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
        block.number +
        ((uint256(keccak256(abi.encodePacked(blockhash(block.number))))) / (block.timestamp))
    )));
        seed = (seed - ((seed / 1000) * 1000));
        if(lastSeed == seed)
        {
            uint256 randrand = _rand3(2);
            if(randrand <= 1) seed += _rand(18200);
            else seed += _rand2(2100);
        }
        lastSeed = seed;
        return seed % max;
    }
}