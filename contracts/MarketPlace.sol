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
import "./utils/ItemList.sol";
import "./tokens/GANG.sol";
import "./tokens/Character.sol";
import "./tokens/GameItem.sol";
import "./CoreInGame.sol";

struct Listing
{
    uint256 tokenId;
    uint256 nftType;
    address owner; //stamina, fixo, usa  
    string name;
    uint256 price;
    uint256 rarity;
    uint256 class;
    uint256 power;
    uint256 itemId;
    uint256 drugId;
    uint256 quantity;
    uint256 time;
    uint256 active;
    uint256 listingId;
}

contract MarketPlace is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    GANG private gangToken;
    Utils private utils;
    Character private crimeChar;
    GameItem private crimeItem;
    CoreInGame private game;
    ItemList private itemList;
    
    uint256 private nextId = 1;

    uint256 private Tax = 5;
    bool private Initialized;
    
    mapping(uint256 => Listing) private _Listings;

    event NewListing(
        uint256 indexed tokenId,
        uint256 nftType,
        address indexed seller,
        uint256 price,
        uint256 indexed _listingId
    );

    constructor(GANG _gang, Utils _utils, Character _char, GameItem _item, CoreInGame _core, ItemList _itemList) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        gangToken = _gang;
        utils = _utils;
        crimeChar = _char;
        crimeItem = _item;
        game = _core;
        itemList = _itemList;
        Initialized = false;
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
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

    function getListing(uint256 id) public view returns (Listing memory)
    {
        return _Listings[id];
    }
    
    function UpdateListing(uint256 id, Listing memory _list) internal
    {
        require(_exists(id), "no Exist");
        _Listings[id] = _list;
    }

    function getContractOwner() public view returns (address)
    {
        return _contractowner;
    }

    function _exists(uint256 id) public view returns(bool) {
        return (_Listings[id].active == 1);
    }

    function getTotalSupply() public view returns (uint256)
    {
        return nextId;
    }

    function getTax() public view returns (uint256)
    {
        return Tax;
    }

    function setTax(uint256 _tax) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Tax = _tax;
    }

    function getIndexSlot() public view returns (uint256)
    {
        uint256 result = nextId;
        for(uint256 x = 1; x <= nextId; x++)
        {
            if(!_exists(x))
            {
                result = x;
                return result;
            }
        }
        return result;
    }

    function burnAllGameItemsListing() public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for(uint256 x = 1; x < nextId; x++)
        {
            if(_exists(x))
            {
                if(_Listings[x].nftType > 1)
                {
                    _Listings[x].active = 0;
                }
            }
        }
    }

    function ListNft(address owner, uint256 tokenId, uint256 nftType, uint256 price, uint256 itemId, uint256 drugId, uint256 quantity) internal returns (uint256)
    {
        uint256 slot = getIndexSlot();
        if(nftType == 1)
        {
            CharacterDetail memory char = crimeChar.getCharacter(tokenId);
            _Listings[slot] = Listing(tokenId, nftType, owner, char.name, price, char.rarity, char.class, char.power, itemId, drugId, quantity, block.timestamp, 1, slot); 
        }
        else if(nftType == 2)
        {
            _GameItem memory item = crimeItem.getGameItem(tokenId);
            _Listings[slot] = Listing(tokenId, nftType, owner, item.name, price, item.rarity, 0, item.powerBonus, itemId, drugId, quantity, block.timestamp, 1, slot);
        }
        else
        {
            _ItemList memory item = itemList.getItemListData(drugId);
            _Listings[slot] = Listing(tokenId, nftType, owner, item.name, price, 0, 0, 0, itemId, drugId, quantity, block.timestamp, 1, slot);
        }
        
        if(slot == nextId) nextId++;
        return slot;
    }

    function buyNft(uint256 id) public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        require(_exists(id), "Require Exists");
        require(gangToken.allowance(msg.sender, address(this)) >= _Listings[id].price, "Require Approval");
        require(gangToken.balanceOf(msg.sender) >= _Listings[id].price, "Require Approval");
        require(_Listings[id].owner != msg.sender, "No buy to yourself");
        uint256 taxValue = ((_Listings[id].price * Tax) / 100);
        uint256 sellerReceive = _Listings[id].price - taxValue;
        gangToken.transferFrom(msg.sender, _Listings[id].owner, sellerReceive);
        gangToken.transferFrom(msg.sender, _contractowner, taxValue);
        if(_Listings[id].nftType == 1)
        {
            crimeChar.transferFrom(address(this), msg.sender, _Listings[id].tokenId);
        }
        else if(_Listings[id].nftType == 2)
        {
            crimeItem.transferFrom(address(this), msg.sender, _Listings[id].tokenId);
        }
        else
        {
            uint256 itemId = _Listings[id].drugId;
            uint256 quantity = _Listings[id].quantity;
            InGame memory acc = game.getIngameAccount(msg.sender);
            if(itemId == 10)
            {
                acc.beer += quantity;
            }
            else if(itemId == 11)
            {
                acc.cannabis += quantity;
            }
            else if(itemId == 12) 
            {
                acc.opio += quantity;
            }
            else 
            {
                acc.cocaine += quantity;
            }
            game.UpdateInGameAccount(msg.sender, acc);
        }
        _Listings[id].active = 0;
        bnbBalance += msg.value;
    }

    function cancelListing(uint256 id) public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        require(_exists(id), "Require Exists");
        require(_Listings[id].owner == msg.sender, "Require Owner os listing");
        if(_Listings[id].nftType == 1)
        {
            crimeChar.transferFrom(address(this), msg.sender, _Listings[id].tokenId);
        }
        else if(_Listings[id].nftType == 2)
        {
            crimeItem.transferFrom(address(this), msg.sender, _Listings[id].tokenId);
        }
        else
        {
            uint256 itemId = _Listings[id].drugId;
            uint256 quantity = _Listings[id].quantity;
            InGame memory acc = game.getIngameAccount(msg.sender);
            if(itemId == 10)
            {
                acc.beer += quantity;
            }
            else if(itemId == 11)
            {
                acc.cannabis += quantity;
            }
            else if(itemId == 12) 
            {
                acc.opio += quantity;
            }
            else 
            {
                acc.cocaine += quantity;
            }
            game.UpdateInGameAccount(msg.sender, acc);
        }
        _Listings[id].active = 0;
        bnbBalance += msg.value;
    }

    function sellNft(uint256 tokenId, uint256 drugId, uint256 quantity, uint256 nftType, uint256 price) public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        require(nftType == 1 || nftType == 2 || nftType == 3, "Incorrect Input");
        require(price > 0, "Incorrect Input");
        uint256 itemId = 0;
        if(nftType == 1)
        {
            require(crimeChar.ownerOf(tokenId) == msg.sender, "Require Owner");
            CharacterDetail memory nftchar = crimeChar.getCharacter(tokenId);
            require(nftchar.seasonId == 0, "Character in Season");
            require(crimeChar.isApprovedForAll(msg.sender, address(this)), "Require Approval");
            crimeChar.transferFrom(msg.sender, address(this), tokenId);
        }
        else if(nftType == 2)
        {
            require(crimeItem.ownerOf(tokenId) == msg.sender, "Require Owner");
            _GameItem memory nftItem = crimeItem.getGameItem(tokenId);
            require(nftItem.itemId >= 0 && nftItem.itemId <= 9, "Incorrect Item");
            if(nftItem.itemId <= 9) require(!nftItem.equiped, "no equiped weapons");
            require(crimeItem.isApprovedForAll(msg.sender, address(this)), "Require Approval");
            crimeItem.transferFrom(msg.sender, address(this), tokenId);
            itemId = nftItem.itemId;
        }
        else
        {
            require(drugId >= 10 && drugId <= 13, "Incorrect Drug");
            itemId = drugId;
            InGame memory acc = game.getIngameAccount(msg.sender);
            if(itemId == 10)
            {
                require(acc.beer >= quantity, "Inssuficient balance");
                acc.beer -= quantity;
            }
            else if(itemId == 11)
            {
                require(acc.cannabis >= quantity, "Inssuficient balance");
                acc.cannabis -= quantity;
            }
            else if(itemId == 12) 
            {
                require(acc.opio >= quantity, "Inssuficient balance");
                acc.opio -= quantity;
            }
            else 
            {
                require(acc.cocaine >= quantity, "Inssuficient balance");
                acc.cocaine -= quantity;
            }
            game.UpdateInGameAccount(msg.sender, acc);
        }
        uint256 slot = ListNft(msg.sender, tokenId, nftType, price, itemId, drugId, quantity);
        emit NewListing(tokenId, nftType, msg.sender, price, slot);
        bnbBalance += msg.value;
    }

    function getAllListingByNftType(uint256 nftType) public view returns (Listing[] memory)
    {
        uint256 tokenCount  = getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new Listing[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!_exists(x)) continue;
                if(_Listings[x].nftType == nftType)
                {
                    resultIndex++;
                }
            }
            if(resultIndex > 0)
            {
                Listing[] memory result = new Listing[](resultIndex);
                uint256 totalNfts = getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; ((i < totalNfts) && (index < resultIndex)); i++)
                {
                    if(!_exists(i)) continue;
                    if(_Listings[i].nftType == nftType)
                    {
                            result[index] = _Listings[i];
                            index++;
                    }
                }
                return result;
            }
            else
            {
                return new Listing[](0);
            }
        }
    }

    function getAllListingByItemId(uint256 itemId) public view returns (Listing[] memory)
    {
        uint256 tokenCount  = getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new Listing[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!_exists(x)) continue;
                if(_Listings[x].itemId == itemId)
                {
                    resultIndex++;
                }
            }
            if(resultIndex > 0)
            {
                Listing[] memory result = new Listing[](resultIndex);
                uint256 totalNfts = getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; ((i < totalNfts) && (index < resultIndex)); i++)
                {
                    if(!_exists(i)) continue;
                    if(_Listings[i].itemId == itemId)
                    {
                            result[index] = _Listings[i];
                            index++;
                    }
                }
                return result;
            }
            else
            {
                return new Listing[](0);
            }
        }
    }

    function getAllListingByUser(address user) public view returns (Listing[] memory)
    {
        uint256 tokenCount  = getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new Listing[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!_exists(x)) continue;
                if(_Listings[x].owner == user)
                {
                    resultIndex++;
                }
            }
            if(resultIndex > 0)
            {
                Listing[] memory result = new Listing[](resultIndex);
                uint256 totalNfts = getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; ((i < totalNfts) && (index < resultIndex)); i++)
                {
                    if(!_exists(i)) continue;
                    if(_Listings[i].owner == user)
                    {
                            result[index] = _Listings[i];
                            index++;
                    }
                }
                return result;
            }
            else
            {
                return new Listing[](0);
            }
        }
    }
}