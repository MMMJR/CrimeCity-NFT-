// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./utils/Admin.sol";
import "./utils/Utils.sol";

import "./tokens/Character.sol";
import "./tokens/GANG.sol";
import "./tokens/GameItem.sol";
import "./tokens/Factory.sol";
import "./CoreInGame.sol";
import "./SeasonManager.sol";

contract Core is Admin, IERC721Receiver {
    address private _contractowner;
    address private _rewardPool;
    address private _devWallet;
    address private _secondowner;

    bool private CanTransfer = false;
    uint256 private nextId = 1;

    uint256 private bnbBalance;

    Utils private utils;
    Character private crimeChar;
    GameItem private crimeItem;
    GANG private gangToken;
    CoreInGame private game;
    Factory private crimeFactory;
    SeasonManager private season;

    bool private Initialized;

    constructor(Utils _util, GANG _gangToken, Character _character, GameItem _gameItem, CoreInGame _InGame, Factory _crimeFactory, SeasonManager _season) Admin()
    {
        _contractowner = msg.sender;
        _rewardPool = address(YOUR REWARD POOL WALLET); // EXAMPLE address(0x...);
        _devWallet = address(YOUR DEV WALLET);
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        gangToken = _gangToken;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        game = _InGame;
        crimeFactory = _crimeFactory;
        season = _season;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
        Initialized = false;
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function Initialize(address _Robbery, address _PvP, address _Equipment, address _HospitalPrice) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _Robbery);
            _setupRole(DEFAULT_CORE_ROLE, _PvP);
            _setupRole(DEFAULT_CORE_ROLE, _Equipment);
            _setupRole(DEFAULT_CORE_ROLE, _HospitalPrice);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
    }


    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == type(IERC721Receiver).interfaceId;
    }

    function bnbWithdraw() onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        address payable owner = payable(msg.sender);
        require(bnbBalance > 0, "Insufficient Balance");
        owner.transfer(bnbBalance);
    }

    function getBurnPrice(uint256 rarity) public view returns (uint256) {
        uint256 Receive = utils.getMintPrice();
        if(rarity == 1)
        {
            Receive = Receive / 3;
        }
        else if(rarity == 2)
        {
            Receive = (Receive - ((Receive * 35) / 100));
        }
        else if(rarity == 3)
        {
            Receive = (Receive + ((Receive * 35) / 100));
        }
        else
        {   
            Receive = Receive * 5;
        }
        return Receive;
    }

    function burnCharacter(uint256 tokenId) public payable {
        require(msg.value >= utils.getContractValue(), "Inssuficient Ammount");
        require(crimeChar.ownerOf(tokenId) == msg.sender, "Require owner");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        require(char.seasonId == 0, "Character In Season");
        uint256 rarity = char.rarity;
        uint256 gangReceive = getBurnPrice(rarity);

        require(gangToken.allowance(_contractowner, address(this)) >= gangReceive, "Require Approve");
        require(gangToken.balanceOf(_contractowner) >= gangReceive, "Require Contract Balance");
        crimeChar.burn(tokenId);
        gangToken.transferFrom(_contractowner, msg.sender, gangReceive);
        uint256 fivePercent = ((gangReceive * 5) / 100);
        gangToken.transferFrom(_contractowner, _rewardPool, fivePercent);
        gangToken.transferFrom(_contractowner, _devWallet, fivePercent);
        bnbBalance += msg.value;
    }
    
    function mintCharacter(string memory name) public payable {
        require(msg.value >= utils.getMintValue(), "Incorrect Value");
        uint256 mintPrice = utils.getMintPrice();
        require(gangToken.allowance(msg.sender, address(this)) >= mintPrice, "Require approve");
        require(gangToken.balanceOf(msg.sender) >= mintPrice, "Insufficient Balance");
        InGame memory acc = game.getIngameAccount(msg.sender);
        game.UpdateInGameAccount(msg.sender, acc);
        gangToken.transferFrom(msg.sender, _contractowner, mintPrice);
        uint256 fivePercent = ((mintPrice * 5) / 100);
        gangToken.transferFrom(_contractowner, _rewardPool, fivePercent);
        gangToken.transferFrom(_contractowner, _devWallet, fivePercent);
        crimeChar.mint(msg.sender, name);
        bnbBalance += msg.value;
    }

    function mintGameItem(uint256 itemId) public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        require(crimeItem.checkItemListCanMint(itemId), "Cannot be Mint");
        uint256 totalPrice = crimeItem.getItemPrice(itemId);
        InGame memory acc = game.getIngameAccount(msg.sender);
        require(acc.seasonSlots > 0, "Require one character in Season");
        require(gangToken.allowance(msg.sender, address(this)) >= totalPrice, "Require approve");
        require(gangToken.balanceOf(msg.sender) >= totalPrice, "Insufficient Balance");
        gameSeason memory seasonManager = season.getSeasonManager();
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        gangToken.transferFrom(msg.sender, _contractowner, totalPrice);
        uint256 fivePercent = ((totalPrice * 5) / 100);
        gangToken.transferFrom(_contractowner, _rewardPool, fivePercent);
        gangToken.transferFrom(_contractowner, _devWallet, fivePercent);
        crimeItem.mint(msg.sender, itemId);
        bnbBalance += msg.value;
    }

    function mintFactory() public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        uint256 totalPrice = utils.getMintPrice() * 3;
        InGame memory acc = game.getIngameAccount(msg.sender);
        require(acc.seasonSlots > 0, "Require one character in Season");
        require(gangToken.allowance(msg.sender, address(this)) >= totalPrice, "Require approve");
        require(gangToken.balanceOf(msg.sender) >= totalPrice, "Insufficient Balance");
        gameSeason memory seasonManager = season.getSeasonManager();
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        gangToken.transferFrom(msg.sender, _contractowner, totalPrice);
        uint256 fivePercent = ((totalPrice * 5) / 100);
        gangToken.transferFrom(_contractowner, _rewardPool, fivePercent);
        gangToken.transferFrom(_contractowner, _devWallet, fivePercent);
        crimeFactory.mint(msg.sender);
        bnbBalance += msg.value;
    }
    
}