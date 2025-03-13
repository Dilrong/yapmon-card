import { ethers } from "hardhat";
import { expect } from "chai";
import { YapmonCards, YapmonCards__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YapmonCards", () => {
  let yapmonCards: YapmonCards;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  const initialBaseURI = "https://your-cloud-storage.com/yapmon/";
  const mintingCost = ethers.parseEther("0.001");
  const yapScore = 1234;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const YapmonCardsFactory = (await ethers.getContractFactory(
      "YapmonCards"
    )) as YapmonCards__factory;
    yapmonCards = await YapmonCardsFactory.deploy(owner.address);
    await yapmonCards.waitForDeployment();
  });

  // === DEPLOYMENT ===
  describe("Deployment", () => {
    it("should set the correct owner and initial values", async () => {
      expect(await yapmonCards.owner()).to.equal(owner.address);
      expect(await yapmonCards.mintingCost()).to.equal(mintingCost);
    });
  });

  // === PUBLIC FUNCTIONS ===
  describe("Public Functions", () => {
    describe("mintYapmon", () => {
      it("should mint a new token with correct parameters", async () => {
        const tx = await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: mintingCost });
        const receipt = await tx.wait();

        expect(await yapmonCards.ownerOf(1)).to.equal(user1.address);
        expect(await yapmonCards.balanceOf(user1.address)).to.equal(1);

        const event = receipt!.logs.find(
          (log) =>
            log.topics[0] === ethers.id("Mint(address,uint256,uint256,uint256)")
        );
        const decodedEvent = yapmonCards.interface.parseLog(event!);
        expect(decodedEvent!.args.recipient).to.equal(user1.address);
        expect(decodedEvent!.args.tokenId).to.equal(1n);
        expect(decodedEvent!.args.yapScore).to.equal(yapScore);
      });

      it("should refund excess ETH", async () => {
        const excessValue = ethers.parseEther("0.002");
        const initialBalance = await ethers.provider.getBalance(user1.address);

        const tx = await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: excessValue });
        const receipt = await tx.wait();

        const gasCost =
          receipt!.gasUsed * (await ethers.provider.getFeeData()).gasPrice!;
        const finalBalance = await ethers.provider.getBalance(user1.address);

        expect(finalBalance).to.be.closeTo(
          initialBalance - mintingCost - gasCost,
          ethers.parseEther("0.0001")
        );
      });

      it("should revert if insufficient ETH", async () => {
        await expect(
          yapmonCards.connect(user1).mintYapmon(user1.address, yapScore, {
            value: ethers.parseEther("0.0005"),
          })
        ).to.be.revertedWith("Insufficient ETH");
      });

      it("should prevent reentrancy", async () => {
        await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: mintingCost });
        expect(await yapmonCards.ownerOf(1)).to.equal(user1.address);
      });
    });

    describe("tokenURI", () => {
      it("should return correct URI after minting", async () => {
        await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: mintingCost });
        expect(await yapmonCards.tokenURI(1)).to.equal(`${initialBaseURI}1`);
      });

      it("should revert for non-existent token", async () => {
        await expect(yapmonCards.tokenURI(999)).to.be.revertedWith(
          "Token does not exist"
        );
      });
    });
  });

  // === ADMIN FUNCTIONS ===
  describe("Admin Functions", () => {
    describe("setBaseURI", () => {
      it("should update base URI if owner", async () => {
        const newURI = "https://new-cloud-storage.com/yapmon/";
        await yapmonCards.connect(owner).setBaseURI(newURI);
        await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: mintingCost });
        expect(await yapmonCards.tokenURI(1)).to.equal(`${newURI}1`);

        const receipt = await yapmonCards
          .connect(owner)
          .setBaseURI(newURI)
          .then((tx) => tx.wait());
        const event = receipt!.logs.find(
          (log) => log.topics[0] === ethers.id("BaseURIUpdated(string)")
        );
        const decodedEvent = yapmonCards.interface.parseLog(event!);
        expect(decodedEvent!.args.newURI).to.equal(newURI);
      });

      it("should revert if not owner", async () => {
        await expect(
          yapmonCards.connect(user1).setBaseURI("new-uri")
        ).to.be.revertedWithCustomError(
          yapmonCards,
          "OwnableUnauthorizedAccount"
        );
      });
    });

    describe("setMintingCost", () => {
      it("should update minting cost if owner", async () => {
        const newCost = ethers.parseEther("0.002");
        await yapmonCards.connect(owner).setMintingCost(newCost);
        expect(await yapmonCards.mintingCost()).to.equal(newCost);

        const receipt = await yapmonCards
          .connect(owner)
          .setMintingCost(newCost)
          .then((tx) => tx.wait());
        const event = receipt!.logs.find(
          (log) => log.topics[0] === ethers.id("MintingCostUpdated(uint256)")
        );
        const decodedEvent = yapmonCards.interface.parseLog(event!);
        expect(decodedEvent!.args.newCost).to.equal(newCost);
      });

      it("should revert if not owner", async () => {
        await expect(
          yapmonCards.connect(user1).setMintingCost(ethers.parseEther("0.002"))
        ).to.be.revertedWithCustomError(
          yapmonCards,
          "OwnableUnauthorizedAccount"
        );
      });
    });

    describe("withdraw", () => {
      it("should withdraw funds to owner", async () => {
        await yapmonCards
          .connect(user1)
          .mintYapmon(user1.address, yapScore, { value: mintingCost });
        const initialBalance = await ethers.provider.getBalance(owner.address);

        const tx = await yapmonCards.connect(owner).withdraw();
        const receipt = await tx.wait();

        const gasCost =
          receipt!.gasUsed * (await ethers.provider.getFeeData()).gasPrice!;
        const finalBalance = await ethers.provider.getBalance(owner.address);

        expect(finalBalance).to.be.closeTo(
          initialBalance + mintingCost - gasCost,
          ethers.parseEther("0.0001")
        );

        const event = receipt!.logs.find(
          (log) =>
            log.topics[0] === ethers.id("FundsWithdrawn(address,uint256)")
        );
        const decodedEvent = yapmonCards.interface.parseLog(event!);
        expect(decodedEvent!.args.amount).to.equal(mintingCost);
      });

      it("should revert if not owner", async () => {
        await expect(
          yapmonCards.connect(user1).withdraw()
        ).to.be.revertedWithCustomError(
          yapmonCards,
          "OwnableUnauthorizedAccount"
        );
      });
    });
  });
});
