// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";


contract DompasNFT is Initializable, ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable, IERC4906 {

    uint256 public nextTokenId;
    string public baseURI; //Using Pinata for hosting metadata and images
    uint256 public constant MAX_POINTS = 20;



    // Mapping
    mapping (address => uint256) public TokenOwnership; // Maps an address to the token ID of the NFT they own
    mapping (uint256 => uint256) public tokenPoints;

    // Reserve slot gap
    uint256[50] private __gap;

    // Events
    event MintedNFT(uint256 tokenId, address owner);
    event UpdatedMetadata(uint256 tokenId);
    event PointsUpdated(uint256 tokenId, uint256 points);

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, string memory baseURI_)  public initializer{
        baseURI = baseURI_;
        __ERC721_init("Dompas NFT", "DOMPAS");
        __Ownable_init(initialOwner);
        //__UUPSUpgradeable_init();
    }

    function _update(address to, uint256 tokenId, address operator) internal override  returns (address) {
        address currentOwner = _ownerOf(tokenId);
        if (currentOwner != address(0) && to != address(0)) {
            revert("Transfer not allowed!");
        }

        return super._update(to, tokenId, operator);
    }

    function mint (address to) public onlyOwner {
        require(balanceOf(to) == 0, "You are only allowed to mint one NFT and have already minted one");
        TokenOwnership[to] = nextTokenId;
        _safeMint(to , nextTokenId);
        nextTokenId++;

        emit MintedNFT(nextTokenId - 1, to);
    }

    function updatePoints(uint256 tokenId, uint256 points) public onlyOwner {
        require(tokenPoints[tokenId] + points <= MAX_POINTS, "Points exceed maximum");
        tokenPoints[tokenId] = tokenPoints[tokenId] + points;

        emit PointsUpdated(tokenId, tokenPoints[tokenId]);
        emit UpdatedMetadata(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        // This takes your Pinata base URI and attaches the token ID
        // Example: https://gateway.pinata.cloud/ipfs/CID/1.json
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC721Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId) || interfaceId == type(IERC4906).interfaceId;
    }



    function _authorizeUpgrade(address newImpl) internal override  onlyOwner {}
}