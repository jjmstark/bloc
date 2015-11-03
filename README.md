# bloc

[![BlockApps logo](http://blockapps.net/img/logo_cropped.png)](http://blockapps.net)

[![Join the chat at https://gitter.im/blockapps/bloc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blockapps/bloc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/blockapps/bloc.svg)](https://travis-ci.org/blockapps/bloc)

Bloc is a small command line tool that helps you build blockchain applications on the Ethereum network with the [blockapps api](https://blockapps.net). Bloc makes it effortless to:
* Compile and deploy smart contracts to the blockchain
* Automatically wire those contracts to the front-end, so you can bring the blockchain to the world!

##Installation
Installation is currently done by cloning:

```
git clone https://github.com/blockapps/bloc.git
```

Enter the bloc directory:

```
cd bloc
```

Install bloc as a global package:

```
npm install -g
```

##Generate a new blockchain app

```
bloc init
```

![bloc init](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_init.png)

bloc init builds a base structure for your blockchain app as well as sets some default parameters values for creating transactions. These can be edited in the config.yaml file in your app directory.


Now in your app directory run
```
bloc genkey
```

![bloc genkey](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_genkey.png)

Compile your smart contracts

```
bloc compile -s
```

![bloc compile](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_compile.png)

Upload a contract and scaffold (`-s`) your dApp

```
bloc upload <ContractName> -s
```

![bloc upload](https://raw.githubusercontent.com/blockapps/bloc/readme-images/readme_img/bloc_upload.png)

## Commands

```
bloc

Usage: bloc <command> (options)

Commands:
  init      start a new project
  compile   compile contracts in contract folder
  upload    upload contracts to blockchain
  genkey    generate a new private key and fill it at the faucet
  
  
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
bloc uses [blockapps-js](https://github.com/blockapps/blockapps-js), our simple library for interfacing with the blockchain.
Smart contracts that are written in javascript-like language called [Solidity](https://github.com/ethereum/wiki/wiki/The-Solidity-Programming-Language). A good place to start playing around with Solidity is the [online compiler](https://chriseth.github.io/browser-solidity/).
