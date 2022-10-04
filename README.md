Hey Guys, this is a game made with erc structure by me (MMMJR) | DISCORD: MarceloJr#7526  
I made this one year ago, i will publish this project to all community can use for learn and use for free the code.
To made this project i use a html website template GodLike, if you use godlike code, pls buy this template: https://themeforest.net/item/godlike-the-game-template/17166433?gclid=CjwKCAjws--ZBhAXEiwAv-RNL1Cnlxs5yFo0MLkuJK29pMLjCWv3cx8kD6P1k6w5V7tblO9KrPl86BoC9psQAvD_BwE

If this is helpfull for you and you can do a donation to my wallet: 
(BSC) (ETH) (POLYGON): 0x29A47cA226F7C4330c06d21E4D435bB1D4230787

How to Setup:

NOTE: Code was not commented and not organized.

NOTE: To understand the game: The game is based on oldschool browser game https://thecrims.com/
NOTE: Setup is based on BSC Network, but you can deploy in ETH and Polygon if you want.
NOTE: The game is based on seasons.
NOTE: This game was not finished.
NOTE: You need liquidity in contract owner to exchange work.
NOTE: This game is full on blockchain back-end. you can test easily usint extension Live Server of HTML in your VS Code.

First: You will need to install all dependencys:

-Install Solidity extencion in your vs code.
-Install NodeJs.
-Open this Project folder in your VS Code.
-Run: "npm install"

Second: You will need to compile all contracts:

-Select Four wallets:
     -One for contracts owner.
     -One for second owner. (Security).
     -One for Dev Wallet (Will receive 5% of royalts of mint of characters.)
     -One for Reward Pool (Receive 5% of royalts of mint of characters to distribute to all ranked players in Season). 

-In folder "contracts":
    - Open all contract archives and update wallets in constructor of code.

-Run "npx truffle compile"

Third: You need to copy all artifacts ABIs to your front-end website:

-Open folder "build/contracts" and copy all json files to "CryptoCrims/public_html/cryptocrims"

Four: Deploy Smart Contracts on NETWORK you want with truffle:

NOTE: RECOMMENDED to deploy this project in testnet network.
NOTE: This project have pre-set BSC NETWORK and BSC TESTNET in Truflle configuration.
NOTE: You will need Binace Faucet BNB (~3BNB) to deploy in testnet: https://testnet.binance.org/faucet-smart or if you deploy in polygon you can get faucet matic on BuildSpace discord: https://discord.gg/buildspace

-Open "contracts/mmmjr.json" and put the contract owner mnemonic.

-Open "truffle-config.js" update your wallet in configuration.

-Run: "npx run truffle migrate --network testnet --compile-none"

NOTE: If Network is busy, you can get error of timeout and need to deploy again.

-After Deploy all contracts you will get in console all respectives address.

-Open "CryptoCrims/public_html/cryptocrims/config.json"
    -Update respectives contract address of yours deployed smart contracts in this archive.

HOW TO PLAY AND SETUP FINANCE:

You need to setup contract owner approves to manage finance of the game.

-Open "CryptoCrims/public_html/admin.html" as live server with Vs Code.
-Connect your Contract Owner Wallet on website and click on:
     -Approve 1 (Wait Finish)
     -Approve 2 (Wait Finish)
     -Initialize Season (Wait Finish)


If have GANG tokens in Contract owner wallet, players can exchange bnb faucet to gang tokens using: "CryptoCrims\public_html\trade.html"

HOW TO PLAY:

-Players need to mint characters and apply him to Season
-Every season you have option to delete all characters, factorys, auctions... participating on season.
-Players can do Robbery or PvP only one time per day, can buy and equip weapons and buy factorys and sell products to blackmarket or in Marketplace Auction.

THANKS FOR ALL HAVE CONTRIBUTE TO PROJECT, if you have any question send DM in discord.





