# bloc

[![BlockApps logo](http://blockapps.net/img/logo_cropped.png)](http://blockapps.net)

[![Join the chat at https://gitter.im/blockapps/bloc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blockapps/bloc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/blockapps/bloc.svg)](https://travis-ci.org/blockapps/bloc)

Bloc is a small commandline tool that helps you build blockchain applications on the Ethereum network with the [blockapps api](https://blockapps.net). It has 3 main functions
* Scafolding your blockchain app code
* Compiling smart contracts to be deployed
* Deploying your smart contracts to the network so you can change the world

##Installation
Installation is currently done by cloning this repo

```
git clone https://github.com/blockapps/bloc.git
```

Enter the bloc directory

```
cd bloc
```

Install bloc as a global package

```
npm install -g
```

##Generate a new blockchain app

```
bloc init
```

![bloc init](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_init.png)

bloc init builds a base structure for your blockchain app as well as set some default values for transacting. These can be edited in the config.yaml file in your app directory.


Now in your app directory run

```
bloc register
```

![bloc register](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_register.png)

bloc register registers your app with the Blockapps api. Now generate a new private key and fill it with test-ether

```
bloc genkey
```

![bloc genkey](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_genkey.png)

Compile your smart contracts

```
bloc compile -s
```

![bloc compile](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_compile.png)

Upload your smart contracts and scafold your dApp 

```
bloc upload <ContractName> -s
```

![bloc upload](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_upload.png)

## Commands

```
bloc

Usage: /usr/local/bin/bloc <command> (options)

Commands:
  init      start a new project
  compile   compile contracts in contract folder
  upload    upload contracts to blockchain
  genkey    generate a new private key and fill it at the faucet
  register  register your app with BlockApps

Options:
  -s, --scaffold  scaffold html / js / css from your contracts when compiling or
                    uploading
```

### Structure of your dApps
```
/dApp
  config.yaml
  key.json
  /contracts
    Payout.sol
    SimpleStorage.sol
    SimpleMultiSig.sol
  /css
  /html
    Payout.html
    SimpleMultiSig.html
    SimpleStorage.html
  /js
    Payout.sol
    SimpleStorage.sol
    SimpleMultiSig.sol
  /meta
  /routes
```

## Additional Resources
bloc uses [blockapps-js](https://github.com/blockapps/blockapps-js) to interact with the blockchain
The smart contracts that bloc uses are writen in a language similar to javascript called [Solidity](https://github.com/ethereum/wiki/wiki/The-Solidity-Programming-Language). A good place to start playing around with the language is the [online compiler](https://chriseth.github.io/browser-solidity/)
