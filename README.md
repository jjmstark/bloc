# bloc

[![Join the chat at https://gitter.im/blockapps/bloc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blockapps/bloc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Minimal commandline build and deploy tool for the blockapps api 

## Installation

``` 
$ npm install -g blockapps/bloc
```

## Demo

Initialize a new project:

``` $ bloc init ```

## Bloc Philosophy

Integrate smart contract design on Ethereum as a lightweight component of your existing workflow.
Easily write a WebApp that can move money in any way you like.

## Commands
```
bloc.

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
