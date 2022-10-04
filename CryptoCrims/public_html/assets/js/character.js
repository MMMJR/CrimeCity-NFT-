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
    selectedTokenId: 0,
    mintx: 1
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

            let mbalance = await characterContract.methods.balanceOf(ethereum.selectedAddress).call();
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
            $("#character-balance").html(mbalance);
            $("#mint-price").html(mintPrice.toString());
            
        }
        catch(e)
        {
            console.log(e);
            await sleep(10000);
            //window.close();
        }

        try
        {
            await changeFilter(0);
        }
        catch(e)
        {
            console.log(e);
        }
    }
}

async function Load(max, min, data, filter) {
    let hs = await webutilsContract.methods.getAllCharactersByTokenIds(max, min, data, ethereum.selectedAddress).call({from:ethereum.selectedAddress});
    if(hs.length > 0)
    {
        if(Config.pageId == 1)
        {
            for(let x = max; x >= min; x--)
            {
                let _data = hs[x];
                await renderNFT(_data.tokenId, _data);
            }  
        }
        else
        {
            let _max = (max - ((Config.pageId -1) * 9));
            let _min = (min - ((Config.pageId -1) * 9));
            for(let x = _max; x >= _min; x--)
            {
                let _data = hs[x];
                await renderNFT(_data.tokenId, _data);
            }
        }
        
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

$("#mint-btn").click(async () => {
    closeModalMint();
    await Mint();
})

$("#market-btn").click(async () => {
    await closeModalMarket(300);
    let value = document.getElementById("modal-market-value").value;
    let valuec = parseFloat(value).toFixed(4);

    if(valuec <= 0.0)
    {
        openModal("Incorrect Value");
        await closeModalTime(2000);
        return;
    }

    if(value.includes(','))
    {
        document.getElementById("modal-market-value").value = value.replace(',','.');
        value = value.replace(',','.');
    }
    value = web3.utils.toWei(value, "ether");
    openModal("Loading");
    let contractValue = "50000000000000";
    try
    {
        let app = await characterContract.methods.isApprovedForAll(ethereum.selectedAddress, Config.market).call();
        if(!app)
        {
            changeModalText("Waiting Approval");
            await characterContract.methods.setApprovalForAll(Config.market, true).send({from:ethereum.selectedAddress});
            changeModalText("Waiting Confirmations");
            await marketplaceContract.methods.sellNft(Config.selectedTokenId, 0, 0, "1", value).send({from:ethereum.selectedAddress, value: contractValue});
            changeModalText("Sucessful Market List");
            await closeModalTime(2000);
            window.location.reload();
            return;
        }
        else
        {
            changeModalText("Waiting Confirmations");
            await marketplaceContract.methods.sellNft(Config.selectedTokenId, 0, 0, "1", value).send({from:ethereum.selectedAddress, value: contractValue});
            changeModalText("Sucessful Market List");
            await closeModalTime(2000);
            window.location.reload();
            return;
        }
    }
    catch(e)
    {
        changeModalText(e.message);
        await closeModalTime(2000);
        return;
    }
})


async function renderNFT(id, data){
    //let burnPrice = await evenCoreContract.methods.getBurnPrice(data.rarity).call({from:ethereum.selectedAddress});
    let burnPrice = await coreContract.methods.getBurnPrice(data.rarity).call({from:ethereum.selectedAddress});
    burnPrice = web3.utils.fromWei(burnPrice, "ether");
    burnPrice = parseFloat(burnPrice).toFixed(2);
    
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

    let htmlString =  `<div class="nk-gallery-item-box nk-isotope-item" data-mouse-parallax-z="5" data-mouse-parallax-speed="1" id="nft_${id}">
            <a href="" class="nk-gallery-item" data-size="360x280">
                <img src="./assets/game/chars/${data.class}.png" alt="" style="width: 150px; heigth: 150px; max-width: 180px; max-heigth: 180px">
            </a>
            <div class="photoswipe-description">
                <h4>Character</h4>
                <h5>Name: ${data.name}</h5>
                <h5>Rarity: ${rarity}</h5>
                <h5>Class: ${classStr}</h5>
                <h5>Power: ${data.power}</h5>
            </div>
            <input type="button" data-nft-id="${id}" class="button-x" value="Sell"/>
            <input type="button" data-nft-id="${id}" class="button-y" value="Burn: ${burnPrice} $GANG"/>
        </div>`;

    let element = $.parseHTML(htmlString);
    $("#nft_row").append(element);

    $(`#nft_${id} .button-x`).click(async () => {
        //sell
        Config.selectedTokenId = data.tokenId;
        if(data.seasonId != 0)
        {
            openModal("Character in season.");
            await closeModalTime(2000);
            return;
        }

        openModalMarket("Market Place", "Character: " + data.name, "Rarity: " + rarity);
        //openInNewTab("");
    })
    $(`#nft_${id} .button-y`).click(async () => {
        openModal("Waiting Confirmations.");
        if(data.seasonId != 0)
        {
            changeModalText("Character In Season!");
            await closeModalTime(3000);
            return;
        }
        try{
            await coreContract.methods.burnCharacter(id).send({
                from:ethereum.selectedAddress,
                value: contractValue
             });
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Sucessuful Burn.");
        await closeModalTime(3000);
        window.location.reload();
    })
}

async function RequestMint()
{
    Config.mintx = document.getElementById("mintx").value;
    if(Config.mintx < 1 || Config.mintx > 10) Config.mintx = 1;

    let balance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
    balance = web3.utils.fromWei(balance, "ether");
    let balanceIn = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    balanceIn = balanceIn.balance;
    balanceIn = web3.utils.fromWei(balanceIn, "ether");

    let price = await utilsContract.methods.getMintPrice().call();
    price = web3.utils.fromWei(price, "ether");
    price = price * Config.mintx;

    openModalMint("Mint Character:", ("Characters: " + Config.mintx.toString()), ("Total Price: " + parseFloat(price).toFixed(2) + " $GANG"), balance.toString(), balanceIn.toString());
}

async function Mint()
{
    let appr = "100000000000000000000000";
    let _mintvalue = "500000000000000";
    let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.core).call({from:ethereum.selectedAddress});
    let name = ``;
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if(allw < 90000000000000000000000)
    {
        try
        {
            openModal("Waiting Approval.");
            let Approval = await gangContract.methods.approve(Config.core, appr).send({from: ethereum.selectedAddress});
            changeModalText("Wainting Confirmations.");

            for(let x = 0; x < Config.mintx; x++)
            {
                if(Config.mintx == 1) name = document.getElementById("modal-mint-name").value;
                else name  = document.getElementById(`modal-mint-name-${x}`).value;

                if(format.test(name))
                {
                    openModal("Cannot put special characters in name.");
                    await closeModalTime(3000);
                    return;
                }

                if(name.length < 3 || name.length > 15)
                {
                    openModal("Maximum 16 characters and Minimum 3 characters.");
                    await closeModalTime(3000);
                    return;
                }

                if(x == (Config.mintx - 1))
                {
                    await coreContract.methods.mintCharacter(name).send({
                        from: ethereum.selectedAddress,
                        value: _mintvalue
                    });
                }
                else
                {
                    coreContract.methods.mintCharacter(name).send({
                        from: ethereum.selectedAddress,
                        value: _mintvalue
                    });
                }
            }

            changeModalText("Successful mint.");
            await closeModalTime(4000);
            window.location.reload();
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(4000);
        }
    }
    else
    {
        try
        {
            openModal("Waiting Confirmations.");
            for(let x = 0; x < Config.mintx; x++)
            {
                if(Config.mintx == 1) name = document.getElementById("modal-mint-name").value;
                else name  = document.getElementById(`modal-mint-name-${x}`).value;

                if(format.test(name))
                {
                    openModal("Cannot put special characters in name.");
                    await closeModalTime(3000);
                    return;
                }

                if(name.length < 3 || name.length > 15)
                {
                    openModal("Maximum 16 characters and Minimum 3 characters.");
                    await closeModalTime(3000);
                    return;
                }

                if(x == (Config.mintx - 1))
                {
                    await coreContract.methods.mintCharacter(name).send({
                        from: ethereum.selectedAddress,
                        value: _mintvalue
                    });
                }
                else
                {
                    coreContract.methods.mintCharacter(name).send({
                        from: ethereum.selectedAddress,
                        value: _mintvalue
                    });
                }
            }
            changeModalText("Successful mint.");
            await closeModalTime(4000);
            window.location.reload();
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(4000);
        }
    }
}

async function changeFilter(id)
{
    openModal("Loading.....");
    Config.filter = id;
    $("#nft_row").html("");
    let filterNfts;
    if(id == 0) filterNfts = await webutilsContract.methods.getAllCharactersForUser(ethereum.selectedAddress).call();
    else filterNfts = await webutilsContract.methods.getAllCharactersByRarity(ethereum.selectedAddress, Config.filter.toString()).call({from:ethereum.selectedAddress});
    await createPages(filterNfts.length, id);
    if(Config.pages > 1) await changePage(1, id);
    else
    {
        if(filterNfts.length > 0) await Load((filterNfts.length - 1), 0, filterNfts, Config.filter.toString());
    }
    closeModal();
}

async function changePage(id, id_f)
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
    if(id_f == 0) filterNfts = await webutilsContract.methods.getAllCharactersForUser(ethereum.selectedAddress).call();
    else filterNfts = await webutilsContract.methods.getAllCharactersByRarity(ethereum.selectedAddress, Config.filter.toString()).call();
    $("#nft_row").html("");
    let max = parseInt(Config.pageId * 9);
    let rest = parseInt(filterNfts.length % 9);
    
    let min = 0;

    if(Config.pageId > 1 && Config.pageId < Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 9);
        await Load((max - 1), min, filterNfts, Config.filter);
    }
    else if(Config.pageId == Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 9);
        if(rest != 0) max = parseInt(((Config.pageId - 1) * 9) + rest);
        await Load((max - 1), min, filterNfts, Config.filter);
    }
    else if(Config.pageId == 1)
    {
        await Load((max - 1), min, filterNfts, Config.filter);
    }
    closeModal();
}

async function createPages(length, id)
{
    $("#pages-enable").hide();
    $("#pages").html("");

    let htmlString = ``;
    if(length > 9)
    {
        $("#pages-enable").show();
        Config.pages = parseInt(length / 9);
        if(length % 9 > 0) Config.pages++;
        for(let x = 0; x < Config.pages; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pg-1" onclick="changePage(1, ${id});">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pg-${x+1}" onclick="changePage(${x+1}, ${id});">${x+1}</a>`;
            $("#pages").append(htmlString);
        }
    }
    else
    {
        Config.pages = 1;
    }
}

document.getElementById("filter").addEventListener('change', async function() {
    var selbox = document.getElementById("filter");
    var idx = selbox.selectedIndex;
    var _Value = selbox.options[idx].value;
    if(_Value >= 0 && _Value <= 4)
    {
        await changeFilter(_Value);
    }
});

document.getElementById("mintx").addEventListener('change', async function() {
    Config.mintx = document.getElementById("mintx").value;
    if(Config.mintx < 1 || Config.mintx > 10) Config.mintx = 1;
    $("#mint-price").html(parseFloat(1 * Config.mintx).toString()); 
});

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
    htmlString += `<input id="modal-market-value" class="form-control" type="number" value="" placeholder="Price: 1.00 $GANG"></input>`;
    htmlString += `<div class="nk-gap-1"></div>`;
    $("#modal-market-input").html(htmlString);
    $("#modal-market").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-market").modal("show");
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

function closeModalMarket()
{
    $("#modal-market").modal("hide");
}

async function closeModalMarketTime(_time)
{
    await sleep(_time);
    $("#modal-market").modal("hide");
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