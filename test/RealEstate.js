/**
 * Author: CastleBomber
 * Project: Ultimate-Solidity-Project
 *
 * Acknowledgements: Ultimate Solidity Youtube Tutorial: DeFi, Flash Loans, Hacking
 *
 * Notes:
 * https://github.com/nvm-sh/nvm
 * source ~/.bashrc
 * nvm install 16.14.0
 * Hardhat Runtime Environment (HRE)
 * Ethers v6 vs v5
 *
 * Progress:
 * ~01:49:00
 * npx hardhat test test/RealEstate.js [Failed]
 * "Error: invalid address or ENS name (argument="name", value=undefined, code=INVALID_ARGUMENT, version=contracts/5.7.0)"
 *
 * Shortcuts:
 *  VS Code:
 *      code folding: cmd+k, cmd+2
 *      code expanding: cmd+k, release, cmd+j
 * 	    c++ VS Code clang-formatter: shift+alt+f
 *      Go to definition - F12
 *      Command pallete - shtift+cmd+p
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("RealEstate", () => {
  //let accounts;
  let realEstate, escrow;
  let deployer, seller, buyer, inspector, lender;
  let nftID = 1;
  let purchasePrice = ether(100);
  let escrowAmount = ether(20);

  beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners(); // Represents an ETH account
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    // Load Contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    // Deploy Contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice,
      escrowAmount,
      seller.address,
      buyer.addres,
      inspector.address,
      lender.address
    );

    // Seller approves NFT
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);
    await transaction.wait();
  });

  describe("Deployment", async () => {
    it("send an NFT to the seller / deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    });
  });

  describe("Selling real estate", async () => {
    let balance, transaction;

    it("executes a successful transactions", async () => {
      // Expects: Seller to be NFT home owner before sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      // Buyer deposits earnest
      transaction = await escrow
        .connect(buyer)
        .depositEarnest({ value: escrowAmount });

      // Check escrow balance
      balance = await escrow.getBalance();
      console.log("escrow balance: ", ethers.utils.formatEther(balance));

      // Finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes sale");

      // Expects: Buyer to be NFT home owner after sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
