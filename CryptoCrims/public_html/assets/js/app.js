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
    marketplaceContract = new web3.eth.Contract(await getAbi("MarketPlace"), Config.marketplace);

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
    
    $("#metamask-str").html("MetaMask");
    
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
            let claimTax = await coreingameContract.methods.getClaimTax(ethereum.selectedAddress).call({from:ethereum.selectedAddress});
            let str = "You cannot claim now!";
            claimBalance = web3.utils.fromWei(claimBalance, "ether");
            let realClaim = await coreingameContract.methods.getClaimReal(ethereum.selectedAddress).call({from:ethereum.selectedAddress});
            realClaim = web3.utils.fromWei(realClaim, "ether");
            if(realClaim > 0) str = "You can claim";

            let wbalance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
            wbalance = web3.utils.fromWei(wbalance, "ether");
            wbalance = parseFloat(wbalance).toFixed(2);
            console.log(wbalance);

            $("#wbalance").html(wbalance + " $GANG");

            if(claimTax == 0) claimTax = 30;
            claimBalance = parseFloat(claimBalance).toFixed(2);
            realClaim = parseFloat(realClaim).toFixed(4);
            $("#claim-balance").html(claimBalance);

            let htmlString = `<div class="col-md-6">
                <div class="nk-info-box bg-info">
                    <div class="nk-info-box-icon">
                        <i class="ion-help-buoy"></i>
                    </div>
                    In-Game Balance: ${claimBalance}<br>
                    Claim Tax: ${claimTax}%<br>
        
                    Claim: ${str} <br>
                    <div class="nk-gap"></div>
                    <a class="nk-btn nk-btn-md link-effect-1 nk-btn-color-main-2" onclick="RequestClaim();">
                        <span>Claim:</span>
                        <span id="claim-balance">${realClaim}</span> $GANG
                    </a>
                </div>
            </div>`;

            let element = $.parseHTML(htmlString);
            $("#claim-modal").html(element);
            
        }
        catch(e)
        {
            console.log(e);
            await sleep(10000);
            //window.close();
        }
    }
}

async function RequestClaim()
{
    openModal("Waiting Confirmations.");
    let contractValue = "500000000000000";
    let tx = await coreingameContract.methods.claim().send({
        from: ethereum.selectedAddress,
        value: contractValue
    });
    await closeModalTime(3000);
}

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
    $("#modal-mint-balance").html("MetaMask Balance: " + balance + " $EVEN");
    $("#modal-mint-ingame").html("In-Game Balance: " + ingame + " $EVEN");
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