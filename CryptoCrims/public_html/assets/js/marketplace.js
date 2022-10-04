//MMMJR

var CurrentScene = "home";
var CurrentSubScene = "jornal";
var bnbContract = null;
var utilsContract;
var itemlistContract;
var gangContract;
var characterContract;
var gameitemContract;
var factoryContract;
var seasonContract;
var marketplaceContract;
var webutilsContract;
var rankingContract;
var characterutilsContract;
var coreContract;
var coreingameContract;
var equipmentContract;
var hospitalprisonContract;
var robberyContract;
var pvpContract;

var _liveListings = [];
//MMMJR

var Config = {
    utils: "",
    itemlist: "",
    gang: "",
    character: "",
    gameitem: "",
    webutils: "",
    characterutils: "",
    factory: "",
    market: "",
    seasonManager: "",
    core: "",
    coreingame: "",
    equipment: "",
    hospitalprison: "",
    robbery: "",
    trade: "",
    pvp: "",
    gasPriceVeryFast: "",
    gasLimitVeryFast: "",
    gasPriceFast: "",
    web: "",
    gasLimitFast: "",
    filter: 1,
    pages: 1,
    pageId: 1,
    mintx: 1
}

var Market = {
    selectedMarket: 0,
    filterMarket: 0,
    filterClass: 0,
    filterRarity: 0,
    filterPower: 0,
    filterWeapon: 0,
    filterDrugs: 0,
    filterCharacter: 1,
    liveSearch: false
}

async function GlobalSettings()
{
    //$("#metamask-str").html("");
    var Configs = await fetchExam("config.json");

    Config.utils = Configs.Config[0].utils;
    Config.itemlist = Configs.Config[0].itemlist;
    Config.gang = Configs.Config[0].gang;
    Config.character = Configs.Config[0].character;
    Config.gameitem = Configs.Config[0].gameitem;
    Config.webutils = Configs.Config[0].webutils;
    Config.characterutils = Configs.Config[0].characterutils;
    Config.core = Configs.Config[0].core;
    Config.coreingame = Configs.Config[0].coreingame;
    Config.equipment = Configs.Config[0].equipment;
    Config.hospitalprison = Configs.Config[0].hospitalprison;
    Config.robbery = Configs.Config[0].robbery;
    Config.pvp = Configs.Config[0].pvp;
    Config.trade = Configs.Config[0].trade;
    Config.market = Configs.Config[0].marketplace;
    Config.factory = Configs.Config[0].factory;
    Config.seasonManager = Configs.Config[0].seasonmanager;

}

async function LoadContracts()
{
    let erc20abi = await getERC20Abi();

    utilsContract = new web3.eth.Contract(await getAbi("Utils"), Config.utils);
    itemlistContract = new web3.eth.Contract(await getAbi("ItemList"), Config.itemlist);
    gangContract = new web3.eth.Contract(await getAbi("GANG"), Config.gang);
    characterContract = new web3.eth.Contract(await getAbi("Character"), Config.character);
    gameitemContract = new web3.eth.Contract(await getAbi("GameItem"), Config.gameitem);
    webutilsContract = new web3.eth.Contract(await getAbi("WebUtils"), Config.webutils);
    characterutilsContract = new web3.eth.Contract(await getAbi("CharacterUtils"), Config.characterutils);
    coreContract = new web3.eth.Contract(await getAbi("Core"), Config.core);
    coreingameContract = new web3.eth.Contract(await getAbi("CoreInGame"), Config.coreingame);
    equipmentContract = new web3.eth.Contract(await getAbi("Equipment"), Config.equipment);
    hospitalprisonContract = new web3.eth.Contract(await getAbi("HospitalPrison"), Config.hospitalprison);
    robberyContract = new web3.eth.Contract(await getAbi("Robbery"), Config.robbery);
    pvpContract = new web3.eth.Contract(await getAbi("PvP"), Config.pvp);
    factoryContract = new web3.eth.Contract(await getAbi("Factory"), Config.factory);
    seasonContract = new web3.eth.Contract(await getAbi("SeasonManager"), Config.seasonManager);
    marketplaceContract = new web3.eth.Contract(await getAbi("MarketPlace"), Config.market);
}

const getWeb3 = () => {
    return new Promise((resolve, reject) => {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            // ask user permission to access his accounts
            await window.ethereum.request({ method: "eth_requestAccounts" });
            resolve(web3);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("Must install MetaMask");
        }
      });
    });
  };


async function ApplicationInit()
{
    await GlobalSettings();
    
    $("#metamask-str").html("Connect MetaMask");
    
    window.web3 = await getWeb3();
    
    var acc = ethereum.selectedAddress;
    if(acc == null)
    {
        $("#metamask-str").html("Metamask");
    }
    else
    {
        try
        {
            acc = acc.substring(0,5) + "...";
            $("#metamask-str").html(acc);
            $("#pages-enable").hide();
            let chainId = await web3.eth.getChainId();
            if(chainId != 97)
            {
                openModal("Please switch network to Binance Testnet!");
                return;
            }
            await LoadContracts();

            let claimBalance = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
            claimBalance = claimBalance.balance;
            claimBalance = web3.utils.fromWei(claimBalance, "ether");
            claimBalance = parseFloat(claimBalance).toFixed(4);

            let mintPrice = await utilsContract.methods.getMintPrice().call();
            mintPrice = web3.utils.fromWei(mintPrice, "ether");

            let wbalance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
            wbalance = web3.utils.fromWei(wbalance, "ether");
            wbalance = parseFloat(wbalance).toFixed(2);

            $("#wbalance").html(wbalance + " $GANG");
            $("#claim-balance").html(claimBalance);

            document.getElementById("market-char").value = Market.filterCharacter;
            await LoadMarket();
        }
        catch(e)
        {
            console.log(e);
            await sleep(10000);
            //window.close();
        }
    }
}

document.getElementById("filter-market").addEventListener('change', async function() {
    let filter = document.getElementById("filter-market").value;
    if(filter != 0)
    {
        document.getElementById("filter-power").value = 0;
        Market.filterPower = 0;
    }
    Market.filterMarket = filter;
    await LoadMarket();
});

document.getElementById("filter-class").addEventListener('change', async function() {
    let filter = document.getElementById("filter-class").value;
    if(filter != 0 && Market.selectedMarket != 0)
    {
        document.getElementById("filter-class").value = 0;
        Market.filterClass = 0;
        return;
    }
    Market.filterClass = filter;
    await LoadMarket();
});

document.getElementById("filter-rarity").addEventListener('change', async function() {
    let filter = document.getElementById("filter-rarity").value;
    if(filter != 0 && (Market.selectedMarket != 0 && Market.selectedMarket != 1))
    {
        document.getElementById("filter-rarity").value = 0;
        Market.filterRarity = 0;
        return;
    }
    Market.filterRarity = filter;
    await LoadMarket();
});

document.getElementById("filter-power").addEventListener('change', async function() {
    let filter = document.getElementById("filter-power").value;
    if(filter != 0 && (Market.selectedMarket != 0 && Market.selectedMarket != 1))
    {
        document.getElementById("filter-power").value = 0;
        Market.filterPower = 0;
        return;
    }
    if(Market.filterMarket != 0)
    {
        document.getElementById("filter-market").value = 0;
        Market.filterMarket = 0;
        return;
    }
    Market.filterPower = filter;
    await LoadMarket();
});

document.getElementById("market-char").addEventListener('change', async function() {
    let filter = document.getElementById("market-char").value;
    if(filter == 0 && Market.selectedMarket == 0)
    {
        document.getElementById("market-char").value = 1;
        return;
    }
    if(filter != 0)
    {
        document.getElementById("market-weapon").value = 0;
        document.getElementById("market-drugs").value = 0;
        document.getElementById("filter-market").value = 0;
        document.getElementById("filter-class").value = 0;
        document.getElementById("filter-rarity").value = 0;
        document.getElementById("filter-power").value = 0;
        Market.filterMarket = 0;
        Market.filterPower = 0;
        Market.filterRarity = 0;
        Market.filterClass = 0;
        Market.selectedMarket = 0;
        await LoadMarket();
        return;
    }
    return;
});

document.getElementById("market-weapon").addEventListener('change', async function() {
    let filter = document.getElementById("market-weapon").value;
    if(filter == 0 && Market.selectedMarket == 1)
    {
        document.getElementById("market-weapon").value = 11;
        Market.filterWeapon = 11;
        document.getElementById("market-char").value = 0;
        document.getElementById("market-drugs").value = 0;
        document.getElementById("filter-market").value = 0;
        document.getElementById("filter-class").value = 0;
        document.getElementById("filter-rarity").value = 0;
        document.getElementById("filter-power").value = 0;
        Market.filterMarket = 0;
        Market.filterPower = 0;
        Market.filterRarity = 0;
        Market.filterClass = 0;
        LoadMarket();
        return;
    }
    if(filter != 0)
    {
        document.getElementById("market-char").value = 0;
        document.getElementById("market-drugs").value = 0;
        document.getElementById("filter-market").value = 0;
        document.getElementById("filter-class").value = 0;
        document.getElementById("filter-rarity").value = 0;
        document.getElementById("filter-power").value = 0;
        Market.filterMarket = 0;
        Market.filterPower = 0;
        Market.filterRarity = 0;
        Market.filterClass = 0;
        Market.filterWeapon = filter;
        Market.selectedMarket = 1;
        await LoadMarket();
        return;
    }
    return;
});

document.getElementById("market-drugs").addEventListener('change', async function() {
    let filter = document.getElementById("market-drugs").value;
    if(filter == 0 && Market.selectedMarket == 2)
    {
        document.getElementById("market-drugs").value = 0;
        Market.filterDrugs = 0;
        document.getElementById("market-char").value = 1;
        document.getElementById("market-weapon").value = 0;
        document.getElementById("filter-market").value = 0;
        document.getElementById("filter-class").value = 0;
        document.getElementById("filter-rarity").value = 0;
        document.getElementById("filter-power").value = 0;
        Market.filterMarket = 0;
        Market.filterPower = 0;
        Market.filterRarity = 0;
        Market.filterClass = 0;
        Market.selectedMarket = 0;
        await LoadMarket();
        return;
    }
    if(filter != 0)
    {
        document.getElementById("market-char").value = 0;
        document.getElementById("market-weapon").value = 0;
        document.getElementById("filter-market").value = 0;
        document.getElementById("filter-class").value = 0;
        document.getElementById("filter-rarity").value = 0;
        document.getElementById("filter-power").value = 0;
        Market.filterMarket = 0;
        Market.filterPower = 0;
        Market.filterRarity = 0;
        Market.filterClass = 0;
        Market.filterDrugs = filter;
        Market.selectedMarket = 2;
        await LoadMarket();
        return;
    }
    return;
});

function compareExpensive(a, b) {
    return a.price - b.price;
}

function comparePrice(a, b) {
    return b.price - a.price;
}

function comparePower(a, b) {
    return b.power - a.power;
}

function comparePowerA(a, b) {
    return a.power - b.power;
}

function compareTime(a, b) {
    return a.time - b.time;
}

async function applyFilterLive(listing)
{
    var newArrayFilter = [];
    if(Market.selectedMarket == 0)
    {
        var _listings = [];
        
        for(let x = 0; x < listing.length; x++)
        {
            _listings[x] = listing[x];
        }
        let resultIndex = 0;
        if((Market.filterClass >= 1 && Market.filterClass <= 4) && (Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].class == Market.filterClass && _listings[x].rarity == Market.filterRarity && _listings[x].nftType == 1)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else if((Market.filterClass >= 1 && Market.filterClass <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].class == Market.filterClass  && _listings[x].nftType == 1)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        } 
        else if((Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].rarity == Market.filterRarity  && _listings[x].nftType == 1)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else
        {
            newArrayFilter = _listings;
        }

        if(Market.filterPower != 0)
        {
            if(Market.filterPower == 2) newArrayFilter = newArrayFilter.sort(comparePower);
            else newArrayFilter = newArrayFilter.sort(comparePowerA);
        }
        else
        {
            if(Market.filterMarket == 0)
            {
                newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
            }
            else if(Market.filterMarket == 1)
            {
                newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
            }
            else
            {
                newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
            }
        }
        
    }
    else if(Market.selectedMarket == 1)
    {   
        var _listings = [];
        let rIndex = 0;
        let fweapon = parseInt(Market.filterWeapon);
        fweapon -= 1;
        
        for(let x = 0; ((x < listing.length) && (rIndex < listing.length)); x++)
        {
            if(Market.filterWeapon != 11)
            {
                if(listing[x].nftType == 2 && listing[x].itemId == (fweapon))
                {
                    _listings[rIndex] = listing[x];
                    rIndex++;
                }
            }
            else
            {
                _listings[rIndex] = listing[x];
                rIndex++;
            }
        }
        let resultIndex = 0;
        if((Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].rarity == Market.filterRarity)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else
        {
            newArrayFilter = _listings;
        }

        if(Market.filterPower != 0)
        {
            if(Market.filterPower == 2) newArrayFilter = newArrayFilter.sort(comparePower);
            else newArrayFilter = newArrayFilter.sort(comparePowerA);
        }
        else
        {
            if(Market.filterMarket == 0)
            {
                newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
            }
            else if(Market.filterMarket == 1)
            {
                newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
            }
            else
            {
                newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
            }
        }
    }
    else if(Market.selectedMarket == 2)
    {
        var _listings = [];
        let rIndex = 0;
        let fdrugs = parseInt(Market.filterDrugs);
        fdrugs += 9;
        for(let x = 0; ((x < listing.length) && (rIndex < listing.length)); x++)
        {
            if(Market.filterDrugs != 5)
            {
                if(listing[x].nftType == 3 && listing[x].itemId == (fdrugs))
                {
                    _listings[rIndex] = listing[x];
                    rIndex++;
                }
            }
            else
            {
                _listings[rIndex] = listing[x];
                rIndex++;
            }
        }

        newArrayFilter = _listings;

        if(Market.filterMarket == 0)
        {
            newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
        }
        else if(Market.filterMarket == 1)
        {
            newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
        }
        else
        {
            newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
        }
    }
    return newArrayFilter;
}

async function applyFilter()
{
    var newArrayFilter = [];
    if(Market.selectedMarket == 0)
    {
        let listing = await marketplaceContract.methods.getAllListingByNftType("1").call();
        var _listings = [];
        
        for(let x = 0; x < listing.length; x++)
        {
            _listings[x] = listing[x];
        }
        let resultIndex = 0;
        if((Market.filterClass >= 1 && Market.filterClass <= 4) && (Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].class == Market.filterClass && _listings[x].rarity == Market.filterRarity)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else if((Market.filterClass >= 1 && Market.filterClass <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].class == Market.filterClass)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        } 
        else if((Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].rarity == Market.filterRarity)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else
        {
            newArrayFilter = _listings;
        }

        if(Market.filterPower != 0)
        {
            if(Market.filterPower == 2) newArrayFilter = newArrayFilter.sort(comparePower);
            else newArrayFilter = newArrayFilter.sort(comparePowerA);
        }
        else
        {
            if(Market.filterMarket == 0)
            {
                newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
            }
            else if(Market.filterMarket == 1)
            {
                newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
            }
            else
            {
                newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
            }
        }
        
    }
    else if(Market.selectedMarket == 1)
    {
        let listing = await marketplaceContract.methods.getAllListingByNftType("2").call();
        var _listings = [];
        let rIndex = 0;
        let fweapon = parseInt(Market.filterWeapon);
        fweapon -= 1;
        
        for(let x = 0; ((x < listing.length) && (rIndex < listing.length)); x++)
        {
            if(Market.filterWeapon != 11)
            {
                if(listing[x].nftType == 2 && listing[x].itemId == (fweapon))
                {
                    _listings[rIndex] = listing[x];
                    rIndex++;
                }
            }
            else
            {
                _listings[rIndex] = listing[x];
                rIndex++;
            
            }
        }
        let resultIndex = 0;
        if((Market.filterRarity >= 1 && Market.filterRarity <= 4))
        {
            for(let x = 0; x < _listings.length; x++)
            {
                if(_listings[x].rarity == Market.filterRarity)
                {
                    newArrayFilter[resultIndex] = _listings[x];
                    resultIndex++;
                }
            }
        }
        else
        {
            newArrayFilter = _listings;
        }

        if(Market.filterPower != 0)
        {
            if(Market.filterPower == 2) newArrayFilter = newArrayFilter.sort(comparePower);
            else newArrayFilter = newArrayFilter.sort(comparePowerA);
        }
        else
        {
            if(Market.filterMarket == 0)
            {
                newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
            }
            else if(Market.filterMarket == 1)
            {
                newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
            }
            else
            {
                newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
            }
        }
    }
    else if(Market.selectedMarket == 2)
    {
        let listing = await marketplaceContract.methods.getAllListingByNftType("3").call();
        var _listings = [];
        let rIndex = 0;
        let fdrugs = parseInt(Market.filterDrugs);
        fdrugs += 9;
        for(let x = 0; ((x < listing.length) && (rIndex < listing.length)); x++)
        {
            if(Market.filterDrugs != 5)
            {
                if(listing[x].nftType == 3 && listing[x].itemId == (fdrugs))
                {
                    _listings[rIndex] = listing[x];
                    rIndex++;
                }
            }
            else
            {
                _listings[rIndex] = listing[x];
                rIndex++;
            }
        }
        newArrayFilter = _listings;

        if(Market.filterMarket == 0)
        {
            newArrayFilter = newArrayFilter.sort(compareTime);
                //Latest
        }
        else if(Market.filterMarket == 1)
        {
            newArrayFilter = newArrayFilter.sort(comparePrice);
                //cheapest
        }
        else
        {
            newArrayFilter = newArrayFilter.sort(compareExpensive);
                //expensive
        }
    }
    return newArrayFilter;
}

async function LoadMyListings()
{
    openModal("Loading.....");
    var newArrayFilter = await marketplaceContract.methods.getAllListingByUser(ethereum.selectedAddress).call();
    $("#nft_row").html("");

    await createPages(newArrayFilter.length, true);
    if(Config.pages > 1) await changePage(1, true);
    else
    {
        if(newArrayFilter.length > 0) await Load((newArrayFilter.length - 1), 0, newArrayFilter, true);
    }
    await closeModalTime(200);

}

async function LoadMarket()
{
    var newArrayFilter = await applyFilter();
    $("#nft_row").html("");
    if(newArrayFilter.length == 0)
    {
        $("#pages-enable").hide();
        $("#pages").html("");
        return;
    }
    await createPages(newArrayFilter.length, false);
    if(Config.pages > 1) await changePage(1, false);
    else
    {
        openModal("Loading.....");
        if(newArrayFilter.length > 0) await Load((newArrayFilter.length - 1), 0, newArrayFilter, false);
        await closeModalTime(300);
    }
}

async function changePage(id, listing)
{
    if(!$('#btn-pg-' + id).hasClass('nk-pagination-current-white'))
    {
        $('#btn-pg-' + id).addClass('nk-pagination-current-white');
        for(let x = 1; x <= Config.pages; x++)
        {
            if(x != id)
            {
                if ($('#btn-pg-' + x).hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pg-' + x).removeClass('nk-pagination-current-white');
                }
            }
        }
    }
    else
    {
        if(id != 1)
        {
            if ($('#btn-pg-' + id).hasClass('nk-pagination-current-white'))
            {
                $('#btn-pg-' + id).removeClass('nk-pagination-current-white');
                for(let x = 1; x <= Config.pages; x++)
                {
                    if(x != id)
                    {
                        if ($('#btn-pg-' + x).hasClass('nk-pagination-current-white'))
                        {
                            $('#btn-pg-' + x).removeClass('nk-pagination-current-white');
                        }
                    }
                }
                if (!$('#btn-pg-1').hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pg-1').addClass('nk-pagination-current-white');
                }
            }
        }
    }
    openModal("Loading...");
    Config.pageId = id;
    let filterNfts;
    if(listing == true)
    {
        filterNfts = await marketplaceContract.methods.getAllListingByUser(ethereum.selectedAddress).call();
    }
    else filterNfts = await applyFilter();
    $("#nft_row").html("");
    let max = parseInt(Config.pageId * 7);
    let rest = parseInt(filterNfts.length % 7);
    
    let min = 0;
    if(Config.pageId > 1 && Config.pageId < Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 7);
        await Load((max - 1), min, filterNfts, listing);
    }
    else if(Config.pageId == Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 7);
        if(rest != 0) 
        {
            max = parseInt(((Config.pageId - 1) * 7) + rest);
            //max -= 1;
        }
        await Load((max - 1), min, filterNfts, listing);
    }
    else if(Config.pageId == 1)
    {
        await Load((max - 1), min, filterNfts, listing);
    }
    await closeModalTime(200);
    await closeModalTime(200);
}

async function createPages(length, listing)
{
    $("#pages-enable").hide();
    $("#pages").html("");

    let htmlString = ``;
    if(length > 7)
    {
        $("#pages-enable").show();
        Config.pages = parseInt(length / 9);
        if(length % 7 > 0) Config.pages++;
        for(let x = 0; x < Config.pages; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pg-1" onclick="changePage(1, ${listing});">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pg-${x+1}" onclick="changePage(${x+1}, ${listing});">${x+1}</a>`;
            $("#pages").append(htmlString);
        }
    }
    else
    {
        Config.pages = 1;
    }
}

async function Load(max, min, data, listing) {
    if(data.length > 0)
    {
        for(let x = max; x >= min; x--)
        {
            let _data = data[x];
            if(listing == true)
            {
                if(_data.nftType == 1)
                {
                    await renderChar(_data.listingId, _data, listing);
                }
                else if(_data.nftType == 2)
                {
                    await renderWeapon(_data.listingId, _data, listing);
                }
                else await renderDrugs(_data.listingId, _data, listing);
            }
            else
            {
                if(Market.selectedMarket == 0)
                {
                    await renderChar(_data.listingId, _data, listing);
                }
                else if(Market.selectedMarket == 1)
                {
                    await renderWeapon(_data.listingId, _data, listing);
                }
                else await renderDrugs(_data.listingId, _data, listing);
            }
        }  
    }
}

/*
<div class="mbox-5">
                <img src="./assets/game/chars/1.png" alt=""/>
                <div class="labelM">MMMJR</div>
                <div class="labelM">Character</div>
                <div class="labelM">Rarity: Epic</div>
                <div class="labelM">Power: 285</div>
                <div class="labelM">Price: 95 $GANG</div>
                <input type="button" class="button-48" value="Buy"/>
            </div>
            <div class="mbox-5">
                <img src="./assets/game/Guns/w_2.png" alt=""/>
                <div class="labelMM">Baseball Bat</div>
                <div class="labelMM">GameItem</div>
                <div class="labelS">Strenght: 200</div>
                <div class="labelS">Inteligence: 200</div>
                <div class="labelS">Charisma: 200</div>
                <div class="labelS">Resistance: 200</div>
                <div class="labelMM">Power: 285</div>
                <div class="labelSS">Price: 1200.2548 $GANG</div>
                <input type="button" class="button-49" value="Buy"/>
            </div>
            <div class="mbox-5">
                <img src="" alt=""/>
                <div class="labelM">Cannabis</div>
                <div class="labelM">GameItem</div>
                <div class="labelM">Health Heal: +500</div>
                <div class="labelMMM">Price: 0.005 $GANG</div>
                <input type="button" class="button-48" value="Buy"/>
            </div>

*/

async function renderChar(id, data, listing){
    let contractValue = "500000000000000";

    let rarity = "";
    if(data.rarity == 1) rarity = "Common";
    else if(data.rarity == 2) rarity = "Uncommon";
    else if(data.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let classStr = "";
    if(data.class == 1) classStr = "Thief";
    else if(data.class == 2) classStr = "Gangster";
    else if(data.class == 3) classStr = "Business Man";
    else classStr = "Drug Dealer";

    let priceStr = web3.utils.fromWei(data.price, "ether");
    priceStr = parseFloat(priceStr).toFixed(3) + " $GANG";
    

    let htmlString =  `<div class="mbox-5" id="nft_${id}">
        <img src="./assets/game/chars/${data.class}.png" alt=""/>
        <div class="labelxx">${data.name}</div>
        <div class="labelxx">Character</div>
        <div class="labelxx">Rarity: ${rarity}</div>
        <div class="labelxx">Power: ${data.power}</div>
        <div class="labelxx">Price: ${priceStr}</div>`;
    
    if(listing == true)
    {
        htmlString += `<input type="button" class="button-48" value="Cancel"/></div>`;
    }
    else
    {
        htmlString += `<input type="button" class="button-48" value="Buy"/></div>`;
    }
        

    let element = $.parseHTML(htmlString);
    $("#nft_row").append(element);

    $(`#nft_${id} .button-48`).click(async () => {
        openModal("Waiting Confirmations.");
        let appr = "100000000000000000000000";
        let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.market).call({from:ethereum.selectedAddress});
        try{
            if(listing)
            {
                await marketplaceContract.methods.cancelListing(id).send({
                    from:ethereum.selectedAddress,
                    value: contractValue
                 });
            }
            else
            {
                if(allw < 90000000000000000000000)
                {
                    changeModalText("Waiting Approval.");
                    let Approval = await gangContract.methods.approve(Config.market, appr).send({from: ethereum.selectedAddress});
                    changeModalText("Wainting Confirmations.");
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
                else
                {
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
            }
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Sucessuful Buy.");
        await closeModalTime(3000);
        window.location.reload();
    })
}

async function renderWeapon(id, data, listing){
    let contractValue = "500000000000000";

    let rarity = "";
    if(data.rarity == 1) rarity = "Common";
    else if(data.rarity == 2) rarity = "Uncommon";
    else if(data.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let weapon = await gameitemContract.methods.getGameItem(data.tokenId).call();

    let priceStr = web3.utils.fromWei(data.price, "ether");
    priceStr = parseFloat(priceStr).toFixed(3) + " $GANG";

    let htmlString =  `<div class="mbox-5" id="nft_${id}">
            <img src="./assets/game/Guns/w_${weapon.itemId}.png" alt=""/>
            <div class="labelMM">${data.name}</div>
            <div class="labelMM">GameItem</div>
            <div class="labelS">Strenght: ${weapon.strBonus}</div>
            <div class="labelS">Inteligence: ${weapon.intBonus}</div>
            <div class="labelS">Charisma: ${weapon.chaBonus}</div>
            <div class="labelS">Resistance: ${weapon.resBonus}</div>
            <div class="labelMM">Power: ${data.power}</div>
            <div class="labelSS">Price: ${priceStr}</div>`;
    
    if(listing == true)
    {
        htmlString += `<input type="button" class="button-49" value="Cancel"/></div>`;
    }
    else
    {
        htmlString += `<input type="button" class="button-49" value="Buy"/></div>`;
    }

    let element = $.parseHTML(htmlString);
    $("#nft_row").append(element);

    $(`#nft_${id} .button-49`).click(async () => {
        let appr = "100000000000000000000000";
        let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.market).call({from:ethereum.selectedAddress});
        openModal("Waiting Confirmations.");
        try{
            if(listing)
            {
                await marketplaceContract.methods.cancelListing(id).send({
                    from:ethereum.selectedAddress,
                    value: contractValue
                 });
            }
            else
            {
                if(allw < 90000000000000000000000)
                {
                    changeModalText("Waiting Approval.");
                    let Approval = await gangContract.methods.approve(Config.market, appr).send({from: ethereum.selectedAddress});
                    changeModalText("Wainting Confirmations.");
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
                else
                {
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
            }
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Sucessuful Buy.");
        await closeModalTime(3000);
        window.location.reload();
    })
}

async function renderDrugs(id, data, listing){
    let contractValue = "500000000000000";

    let priceStr = web3.utils.fromWei(data.price, "ether");
    priceStr = parseFloat(priceStr).toFixed(3) + " $GANG";
    let hpstr = "";
    
    if(data.itemId == 10) 
    {
        hpstr = "+50";
    }
    else if(data.itemId == 11) 
    {
        hpstr = "+100";
    }
    else if(data.itemId == 12) 
    {
        hpstr = "+200";
    }
    else
    {
        hpstr = "+500";
    }

    let htmlString =  `<div class="mbox-5" id="nft_${id}">
        <img src="" alt=""/>
        <div class="labelx">${data.name}</div>
        <div class="labelM">GameItem</div>
        <div class="labelM">Quantity: ${data.quantity}</div>
        <div class="labelxx">Health Heal: ${hpstr}</div>
        <div class="labelMMM">Price: ${priceStr}</div>`;
    
    if(listing == true)
    {
        htmlString += `<input type="button" class="button-48" value="Cancel"/></div>`;
    }
    else
    {
        htmlString += `<input type="button" class="button-48" value="Buy"/></div>`;
    }

    let element = $.parseHTML(htmlString);
    $("#nft_row").append(element);

    $(`#nft_${id} .button-48`).click(async () => {
        let appr = "100000000000000000000000";
        let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.market).call({from:ethereum.selectedAddress});
        openModal("Waiting Confirmations.");
        try{
            if(listing)
            {
                await marketplaceContract.methods.cancelListing(id).send({
                    from:ethereum.selectedAddress,
                    value: contractValue
                 });
            }
            else
            {
                if(allw < 90000000000000000000000)
                {
                    changeModalText("Waiting Approval.");
                    let Approval = await gangContract.methods.approve(Config.market, appr).send({from: ethereum.selectedAddress});
                    changeModalText("Wainting Confirmations.");
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
                else
                {
                    await marketplaceContract.methods.buyNft(id).send({
                        from:ethereum.selectedAddress,
                        value: contractValue
                     });
                }
            }
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Sucessuful Buy.");
        await closeModalTime(3000);
        window.location.reload();
    })
}

$("#live-btn").click(async () => {
    
    if(Market.liveSearch == false)
    {
        openModal("Live Search ON");
        $("#pages-enable").hide();
        $("#pages").html("");
        $("#nft_row").html("");
        Market.liveSearch = true;
        document.getElementById("live-btn").value = "Live Search ON";
        let nftType = parseInt(Market.selectedMarket);
        nftType += 1;
        marketplaceContract.events.NewListing({
            fromBlock: 'latest'
            },async function(error, event){
                let data = event.returnValues;
                let liveListing = await marketplaceContract.methods.getListing(data._listingId).call();
                _liveListings.push(liveListing);

                var newArrayFilter = await applyFilterLive(_liveListings);

                await createPages(newArrayFilter.length, false);
                if(Config.pages > 1) await changePage(1, false);
                else
                {
                    if(newArrayFilter.length > 0) await Load((newArrayFilter.length - 1), 0, newArrayFilter, false);
                }
            })
        .on("connected",async function(subscriptionId){
            await closeModalTime(1000);
        })
        .on("error", console.error);
    }
    else
    {
        Market.liveSearch = false;
        document.getElementById("live-btn").value = "Live Search OFF";
        $("#nft_row").html("");
        web3.eth.clearSubscriptions();
        await LoadMarket();
    }
})

$("#market-btn").click(async () => {
    document.getElementById("market-char").value = 1;
    document.getElementById("market-weapon").value = 0;
    document.getElementById("market-drugs").value = 0;
    document.getElementById("filter-market").value = 0;
    document.getElementById("filter-class").value = 0;
    document.getElementById("filter-rarity").value = 0;
    document.getElementById("filter-power").value = 0;
    Market.filterMarket = 0;
    Market.filterPower = 0;
    Market.filterRarity = 0;
    Market.filterClass = 0;
    Market.selectedMarket = 0;
    await LoadMarket();
})

$("#market-listing").click(async () => {
    document.getElementById("market-char").value = 0;
    document.getElementById("market-weapon").value = 0;
    document.getElementById("market-drugs").value = 0;
    document.getElementById("filter-market").value = 0;
    document.getElementById("filter-class").value = 0;
    document.getElementById("filter-rarity").value = 0;
    document.getElementById("filter-power").value = 0;
    Market.filterMarket = 0;
    Market.filterPower = 0;
    Market.filterRarity = 0;
    Market.filterClass = 0;
    Market.selectedMarket = 0;
    await LoadMyListings();
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

ethereum.on('accountsChanged', (accounts) => {
    window.location.reload();
    // Handle the new accounts, or lack thereof.
    // "accounts" will always be an array, but it can be empty.
});
  
ethereum.on('chainChanged', async (chainId) => {
    if(chainId != 97)
    {
        $("#metamask-str").html("Switch");
        openModal("Please switch network to Binance Testnet");
        await closeModalTime(3000);
    }
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    window.location.reload();
});

$("#metamask-btn").click(async () => {
    if(!window.web3)
    {
        window.web3 = await getWeb3();
    }
})

async function checkAcc(accs)
{
    var b = false;
    var a = await fetchExam("acc.json");
    a.Users.forEach((acc) => {
        if(accs == acc.acc)
        {
            b = true;
        }
    });
    return b;
}

function openInNewTab(url) {
    window.open(url, '_blank').focus();
}

function replaceTab(url) {
    window.open(url, 'self').focus();
}

async function getERC20Abi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/ERC20.json", ( (json) => {
            res(json);
        }))
    })
}

async function getERC20Abi()
{
    return new Promise( (res) => {
        $.getJSON("./cryptocrims/ERC20.json", ( (json) => {
            res(json);
        }))
    })
}

async function getAbi(name)
{
    return new Promise( (res) => {
        $.getJSON(`./cryptocrims/${name}.json`, ( (json) => {
            res(json.abi);
        }))
    })
}

async function fetchExam(id) {

    try {
        const response = await fetch(`./cryptocrims/${id}`, {
            method: 'GET',
            credentials: 'same-origin'
        });
        const exam = await response.json();
        return exam;
    } catch (error) {
        console.error(error);
    }
}

function openModalMint(title, text, text2, balance, ingame)
{
    $("#modal-mint-title").html(title);
    $("#modal-mint-text").html(text);
    $("#modal-mint-text2").html(text2);
    $("#modal-mint-balance").html("MetaMask Balance: " + balance + " $GANG");
    let htmlString = ``;
    if(Config.mintx > 1)
    {
        for(let x = 0; x < Config.mintx; x++)
        {
            htmlString += `<input id="modal-mint-name-${x}" class="form-control" type="text" value="" placeholder="Put Character Name ${x}"></input>`;
            htmlString += `<div class="nk-gap-1"></div>`;
        }
    }
    else
    {
        htmlString = `<input id="modal-mint-name" class="form-control" type="text" value="" placeholder="Put Character Name"></input>`;
    }
    $("#modal-input").html(htmlString);
    $("#modal-mint").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-mint").modal("show");
}

function openModalMarket(title, text, text2)
{
    $("#modal-market-title").html(title);
    $("#modal-market-text").html(text);
    $("#modal-market-text2").html(text2);
    let htmlString = ``;
    if(Config.mintx > 1)
    {
        for(let x = 0; x < Config.mintx; x++)
        {
            htmlString += `<input id="modal-market-name-${x}" class="form-control" type="number" value="" placeholder="Price: 1.00"></input>`;
            htmlString += `<div class="nk-gap-1"></div>`;
        }
    }
    else
    {
        htmlString = `<input id="modal-mint-name" class="form-control" type="text" value="" placeholder="Put Character Name"></input>`;
    }
    $("#modal-input").html(htmlString);
    $("#modal-mint").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-mint").modal("show");
}


function closeModalMint()
{
    $("#modal-mint").modal("hide");
}

async function closeModalMintTime(_time)
{
    await sleep(_time);
    $("#modal-mint").modal("hide");
}

function openModal(text)
{
    $("#modal-text").html(text);
    $("#modal-load").modal({
        backdrop: "static", //remove ability to close modal with click
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-load").modal("show");
}

function changeModalText(text)
{
    $("#modal-text").html(text);
}

function closeModal()
{
    $("#modal-load").modal("hide");
}

async function closeModalTime(_time)
{
    await sleep(_time);
    $("#modal-load").modal("hide");
}

ApplicationInit();