import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import { readdirSync } from "fs";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import { join, resolve } from "path";

try {
  readdirSync(join(__dirname, "types"));
  require("./tasks");
} catch {
  //
}

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const chainIds = {
  hardhat: 31337,
  mainnet: 1,
  sepolia: 11155111,
  goerli: 5,
  blast: 81457, 
  blastSepolia: 168587773
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "blast":
      jsonRpcUrl = "https://rpc.blast.io"; 
      break;
    case "blastSepolia":
      jsonRpcUrl = "https://smart-burned-shape.blast-sepolia.quiknode.pro/6c705029086a38c8cd49a9d7a4f4942adcfec60f/";
      break;
    default:
      jsonRpcUrl = "https://" + chain + ".infura.io/v3/" + infuraApiKey;
  }

  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      blast: process.env.ETHERSCAN_API_KEY || "blast",
      blastSepolia: process.env.ETHERSCAN_API_KEY || "blastSepolia"
    },
    customChains: [
      {
        network: "blast",
        chainId: chainIds.blast,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan", // TODO: change with blast mainnet config
          browserURL: "https://blastscan.io" 
        }
      },
      {
        network: "blastSepolia",
        chainId: chainIds.blastSepolia,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
          browserURL: "https://testnet.blastscan.io"
        }
      }
    ]
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      chainId: chainIds.hardhat,
    },

    // TESTNET
    sepolia: getChainConfig("sepolia"),
    goerli: getChainConfig("goerli"),
    blastSepolia: getChainConfig("blastSepolia"),

    // MAINNET
    mainnet: getChainConfig("mainnet"),
    blast: getChainConfig("blast"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;