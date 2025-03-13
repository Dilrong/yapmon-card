// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YapmonCards is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;

    string private _baseTokenURI;
    uint256 public mintingCost = 0.001 ether;

    // === EVENTS ===
    event Mint(address indexed recipient, uint256 indexed tokenId, uint256 yapScore, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newURI);
    event MintingCostUpdated(uint256 newCost);

    constructor(address initialOwner) ERC721("YapmonCards", "YAPMON") Ownable(initialOwner) {
        _baseTokenURI = "https://your-cloud-storage.com/yapmon/";
    }

    // === PUBLIC FUNCTIONS ===
    function mintYapmon(address recipient, uint256 yapScore) public payable nonReentrant returns (uint256) {
        require(msg.value >= mintingCost, "Insufficient ETH");
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(recipient, newTokenId);
        
        if (msg.value > mintingCost) {
            (bool sent, ) = msg.sender.call{value: msg.value - mintingCost}("");
            require(sent, "Refund failed");
        }

        emit Mint(recipient, newTokenId, yapScore, block.timestamp);
        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert("Token does not exist");
        return string.concat(_baseTokenURI, uintToString(tokenId));
    }

    // === ADMIN FUNCTIONS ===
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    function setMintingCost(uint256 newCost) external onlyOwner {
        mintingCost = newCost;
        emit MintingCostUpdated(newCost);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
        emit FundsWithdrawn(owner(), balance);
    }

    // === INTERNAL FUNCTIONS ===
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 length = 1;
        uint256 temp = value;
        while (temp >= 10) {
            length++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(length);
        for (uint256 i = length; i > 0; i--) {
            buffer[i - 1] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }
}