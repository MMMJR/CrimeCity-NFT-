// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */
 

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./../utils/Admin.sol";
import "./../utils/Utils.sol";
import "./../utils/ItemList.sol";

struct _Factory
{
    uint256 rarity;
    uint256 class;
    uint256 itemIdProduce; //stamina, fixo, usa  
    uint256 quantity;
    address owner;
    uint256 claimTime;
    uint256 tokenId;
    bool transfer;
}

contract Factory is ERC721, Admin {
    address private _contractowner;
    address private _secondowner;

    Utils private utils;
    ItemList private itemList;

    uint256 private nextId = 1;

    bool private Initialized = false;

    mapping( uint256 => _Factory) private _tokenStorage;

    constructor(string memory name, string memory symbol, Utils _ut, ItemList _itemList) Admin() ERC721(name, symbol)
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        utils = _ut;

        itemList = _itemList;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function Initialize(address _Core, address _CoreIn) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _Core);
            _setupRole(DEFAULT_CORE_ROLE, _CoreIn);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
    }

    function mint(address addr) onlyCore() public {

        uint256 _randChar = utils.rand(100);
        uint256 _class = 1;
        uint256 _rarity = 1;
        uint256 itemIdProduce = 10;
        uint256 quantity = 5;
        uint256 claimTime = block.timestamp;

        if(_randChar <= 40)
        {
            _class = 1;
            itemIdProduce = 10;
        }
        else if(_randChar <= 70)
        {
            _class = 2;
            itemIdProduce = 11;
        }
        else if(_randChar <= 90)
        {
            _class = 3;
            itemIdProduce = 12;
        }
        else
        {
            _class = 4;
            itemIdProduce = 13;
        }

        uint256 _randRarity = utils.rand(100);

        if(_randRarity <= 55)
        {
            _rarity = 1;
            quantity = 5;
        } 
        else if(_randRarity <= 80)
        {
            _rarity = 2;
            quantity = 9;
        } 
        else if(_randRarity <= 95)
        {
            _rarity = 3;
            quantity = 13;
        } 
        else
        {
            _rarity = 4;
            quantity = 17;
        } 

        uint256 slot = getIndexSlot();

        _tokenStorage[slot] = _Factory(_rarity, _class, itemIdProduce, quantity, addr, claimTime, slot, true); 
        _mint(addr, slot);
        if(slot == nextId) nextId++;
    }

    function UpdateFactory(uint256 tokenId, _Factory memory _factory) onlyCore() public
    {
        require(_exists(tokenId), "no Exist");
        _tokenStorage[tokenId] = _factory;
    }

    function getFactory(uint256 tokenId) public view returns (_Factory memory)
    {
        require(_exists(tokenId), "No Exist");
        return _tokenStorage[tokenId];
    }

    function getContractOwner() public view returns (address)
    {
        return _contractowner;
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

    function getTotalSupply() public view returns (uint256)
    {
        return nextId;
    }
    function exists (uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function transferFromAll(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public onlyRole(DEFAULT_CORE_ROLE) {
        if(tokenIds.length <= 0) return;
        for(uint256 x = 0; x < tokenIds.length; x++)
        {
            transferFrom(from, to, tokenIds[x]);
        }
    }
    
    function burnAllFactorysInSeason() onlyCore() public {
        for(uint256 x = 1; x < nextId; x++)
        {
            if(_exists(x))
            {
                _burn(x);
            }
        }
    }

    function getAllFactorysForUser(address user) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = balanceOf(user);
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalNfts = getTotalSupply();
            uint256 i;
            uint256 resultIndex = 0;
            for(i = 1; i < totalNfts; i++)
            {
                if(!exists(i)) continue;
                if(ownerOf(i) == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getAllFactorysByTokenIds(int256 max, int256 min, int256[] memory tokenIds) public view returns (_Factory[] memory)
    {
        uint256 tokenCount = tokenIds.length;

        if(tokenCount == 0)
        {
            return new _Factory[](0);
        }
        else
        {
            _Factory[] memory result = new _Factory[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = max; i >= min; i--)
            {
                if(i >= 0)
                {
                    if(!exists(uint256(tokenIds[uint256(i)]))) continue;
                    _Factory memory _item = getFactory(uint256(tokenIds[uint256(i)]));
                    result[resultIndex] = _item;
                    resultIndex++;
                }
            }
            return result;
        }
    }
    
    function burn(uint256 tokenId) onlyCore() public {
        _burn(tokenId);
    }

    function _beforeTokenTransfer( address from, address to, uint256 tokenId) internal override {
        require(_tokenStorage[tokenId].transfer == true, "No trasfer factorys");
        _tokenStorage[tokenId].transfer = false;
        _tokenStorage[tokenId].owner = to;
    }
}