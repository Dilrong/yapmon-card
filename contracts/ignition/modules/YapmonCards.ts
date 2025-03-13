import { ethers } from "ethers";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";

dotenv.config();

const YapmonCardsModule = buildModule("YapmonCardsModule", (m) => {
  const initialOwner = process.env.OWNER;

  if (!initialOwner) {
    throw new Error(
      "initialOwner must be provided via parameters or OWNER env variable"
    );
  }

  console.log("Initial owner:", initialOwner);

  if (!ethers.isAddress(initialOwner)) {
    throw new Error("initialOwner must be a valid Ethereum address");
  }

  const yapmonCards = m.contract("YapmonCards", [initialOwner]);
  return { yapmonCards };
});

export default YapmonCardsModule;
