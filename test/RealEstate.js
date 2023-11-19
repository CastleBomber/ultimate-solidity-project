const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Real Estate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let nftID = 1;

  beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];

    // Load Contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    // Deploy Contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      seller.address,
      buyer.addres
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
    it("executes a successful transactions", async () => {
      // Expects: Seller to be NFT home owner before sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      // Finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes sale");

      // Expects: Buyer to be NFT home owner after sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
