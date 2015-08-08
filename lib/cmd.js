

module.exports.argv = require('yargs')
               .usage('Usage: $0 <command> (options)')
               .demand(1)
               .command('init', 'start a new project')
               .command('compile (pathToFilename.sol)', 'compile solidity source file or all contracts')
               .command('upload', 'upload contracts to blockchain')
               .command('genkey', 'generate a new private key and fill it at the faucet')
               .command('register', 'register your app with blockapps')
               .argv;
