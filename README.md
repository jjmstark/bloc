# bloc
Minimal commandline build and deploy tool for the blockapps api 

## Installation

``` $ npm install -g blockapps-js ```

## Demo

Initialize a new project:

``` $ bloc project 
    $ cd project && bloc build ```

Run example: 
``` $ block start ```

## Bloc Philosophy

Integrate smart contract design on Ethereum as a lightweight component of your existing workflow.
Easily write a WebApp that can move money in any way you like.

## Commands in Docopt Style, inline comments
```
bloc.

Usage: 
  bloc (directory_name)             # initalize project
  bloc newkey                       # create private key
  bloc compile [contract.sol]
  bloc build (project_directory)
  bloc upload [contract.sol]
  bloc start
  bloc call (contractname) (methodname) <function_args> ...
  bloc -h | --help
  bloc --version

Options:
  -h --help   Show this screen.
  --version
```