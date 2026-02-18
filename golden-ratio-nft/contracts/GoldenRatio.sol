// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Golden Ratio — Fully Onchain Generative Art NFT
/// @notice phi = 1.618... | 61 pieces | 0.0618 ETH each | Base network
/// @dev All art rendered onchain. Phyllotaxis spirals driven by golden angle (137.5 deg).
///      Each token's seed is derived from blockhash + tokenId + minter address.
contract GoldenRatio is ERC721, Ownable {
    using Strings for uint256;

    // =========================================================
    // Constants
    // =========================================================

    uint256 public constant MAX_SUPPLY  = 61;
    uint256 public constant MINT_PRICE  = 61800000000000000; // 0.0618 ETH

    // =========================================================
    // State
    // =========================================================

    uint256 private _totalMinted;
    mapping(uint256 => bytes32) private _seeds;

    // =========================================================
    // Errors & Events
    // =========================================================

    error SoldOut();
    error InsufficientPayment();
    error Nonexistent();

    event Minted(address indexed to, uint256 indexed tokenId, bytes32 seed);

    // =========================================================
    // Constructor
    // =========================================================

    constructor() ERC721("Golden Ratio", "PHI") Ownable(msg.sender) {}

    // =========================================================
    // Minting
    // =========================================================

    /// @notice Mint a Golden Ratio NFT. Excess ETH is refunded.
    function mint() external payable {
        if (_totalMinted >= MAX_SUPPLY) revert SoldOut();
        if (msg.value < MINT_PRICE)     revert InsufficientPayment();

        uint256 tokenId = ++_totalMinted;
        bytes32 seed = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                tokenId,
                msg.sender,
                block.timestamp
            )
        );
        _seeds[tokenId] = seed;
        _mint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId, seed);

        // Refund excess
        uint256 excess = msg.value - MINT_PRICE;
        if (excess > 0) {
            (bool ok,) = payable(msg.sender).call{value: excess}("");
            require(ok, "Refund failed");
        }
    }

    // =========================================================
    // Views
    // =========================================================

    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    function seedOf(uint256 tokenId) external view returns (bytes32) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();
        return _seeds[tokenId];
    }

    // =========================================================
    // Metadata — fully onchain
    // =========================================================

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();

        bytes32 seed    = _seeds[tokenId];
        string memory h = _toHex32(seed);
        uint256 s       = uint256(seed);

        // Derive trait values
        string memory palName   = _palName(s % 8);
        string memory nPoints   = (200 + ((s >> 32)  % 400)).toString();
        string memory nLayers   = (1   + ((s >> 64)  % 3)).toString();

        // Build art HTML
        string memory html   = _buildHtml(h, tokenId);
        string memory htmlB64 = Base64.encode(bytes(html));

        // Build JSON
        string memory attrs = string.concat(
            '[',
            '{"trait_type":"Palette","value":"',  palName,   '"},',
            '{"trait_type":"Points","value":"',   nPoints,   '"},',
            '{"trait_type":"Layers","value":"',   nLayers,   '"},',
            '{"trait_type":"Edition","value":"',  tokenId.toString(), '/61"}',
            ']'
        );

        string memory json = string.concat(
            '{"name":"Golden Ratio #', tokenId.toString(), '",',
            '"description":"Fully onchain generative art driven by phi = 1.618. ',
            'Phyllotaxis spirals, golden angle 137.5 deg. ',
            'Each of 61 pieces rendered entirely from its mint seed. ',
            'Price: 0.0618 ETH = 1/phi / 10. Supply: 61 = 100/phi rounded.",',
            '"image":"data:text/html;base64,',       htmlB64, '",',
            '"animation_url":"data:text/html;base64,', htmlB64, '",',
            '"attributes":', attrs,
            '}'
        );

        return string.concat(
            'data:application/json;base64,',
            Base64.encode(bytes(json))
        );
    }

    // =========================================================
    // Internal — HTML Assembly
    // =========================================================

    function _buildHtml(string memory seedHex, uint256 tokenId)
        internal pure returns (string memory)
    {
        return string.concat(
            '<!DOCTYPE html><html><head><meta charset="utf-8">',
            '<style>*{margin:0;padding:0}',
            'body{background:#000;display:flex;align-items:center;',
            'justify-content:center;min-height:100vh;overflow:hidden}',
            'canvas{max-width:100vmin;max-height:100vmin}</style>',
            '</head><body><script>',
            _shim(),
            'const SEED="', seedHex, '",TOKEN=', tokenId.toString(), ';',
            _artSetup(),
            _artDraw(),
            '</script></body></html>'
        );
    }

    /// @dev Minimal p5.js-compatible Canvas API shim (~500 chars JS)
    function _shim() internal pure returns (string memory) {
        return string.concat(
            'const _cv=document.createElement("canvas"),',
            '_cx=_cv.getContext("2d");',
            '_cv.width=_cv.height=800;',
            'document.body.appendChild(_cv);',
            'const cos=Math.cos,sin=Math.sin,sqrt=Math.sqrt,',
            'PI=Math.PI,TWO_PI=PI*2,floor=Math.floor;',
            'function background(c){_cx.fillStyle=c;_cx.fillRect(0,0,800,800);}',
            'function fill(c){_cx.fillStyle=c;}',
            'function noFill(){_cx.fillStyle="rgba(0,0,0,0)";}',
            'function noStroke(){_cx.strokeStyle="rgba(0,0,0,0)";}',
            'function stroke(c){_cx.strokeStyle=c;}',
            'function strokeWeight(w){_cx.lineWidth=w;}',
            'function circle(x,y,d){_cx.beginPath();_cx.arc(x,y,d/2,0,TWO_PI);_cx.fill();}',
            'function push(){_cx.save();}function pop(){_cx.restore();}',
            'function translate(x,y){_cx.translate(x,y);}',
            'function rotate(a){_cx.rotate(a);}',
            'function map(v,a,b,c,d){return c+(d-c)*(v-a)/(b-a);}'
        );
    }

    /// @dev RNG, palettes, derived parameters
    function _artSetup() internal pure returns (string memory) {
        return string.concat(
            // PHI + golden angle (2pi - 2pi/phi = 137.5077... deg)
            'const PHI=1.618033988749895,GA=TWO_PI-TWO_PI/PHI;',
            // LCG from seed (PCG-style)
            'let rs=BigInt("0x"+SEED);',
            'const rnd=()=>{',
            'rs=(rs*6364136223846793005n+1442695040888963407n)&18446744073709551615n;',
            'return Number(rs&4294967295n)/4294967295;};',
            // 8 color palettes
            'const P=[',
            '["#080808","#FFD700","#FFA500","#FF6B35","#F7C59F"],',   // 0 Solar
            '["#0c0a1e","#C77DFF","#9B5DE5","#e0aaff","#E9C46A"],',   // 1 Cosmic
            '["#0d0d0d","#e94560","#0f3460","#16213e","#f5e4e4"],',   // 2 Crimson
            '["#120a05","#8B4513","#D2691E","#F4A460","#FFDEAD"],',   // 3 Desert
            '["#0D1117","#161b22","#30A14E","#3FB950","#58d68d"],',   // 4 Forest
            '["#0d0522","#11998e","#38ef7d","#FC5C7D","#6A3093"],',   // 5 Neon
            '["#050505","#1c1c1c","#e0e0e0","#f5f5f5","#ffffff"],',   // 6 Mono
            '["#071a10","#1B4332","#40916C","#74C69D","#D8F3DC"]',    // 7 Emerald
            '];',
            'const pal=P[floor(rnd()*8)];',
            'const N=250+floor(rnd()*350);',   // 250-600 points
            'const ds=0.4+rnd()*1.6;',          // dot size multiplier
            'const LY=1+floor(rnd()*3);',       // 1-3 layers
            'const ro=rnd()*TWO_PI;'            // rotation offset
        );
    }

    /// @dev Main drawing: phyllotaxis spiral + golden rectangle overlay
    function _artDraw() internal pure returns (string memory) {
        return string.concat(
            // Clear background
            'background(pal[0]);noStroke();',
            // Phyllotaxis spiral (layered)
            'for(let l=0;l<LY;l++){',
            'const lr=ro+l*(PHI-1)*TWO_PI;',   // layers offset by phi-1 (golden ratio spacing)
            'const mr=350*(1-l*0.2);',           // radius shrinks per layer
            'const np=floor(N/LY);',
            'for(let i=1;i<=np;i++){',
            'const t=i/np,r=sqrt(t)*mr,th=i*GA+lr;',
            'fill(pal[1+floor(t*(pal.length-1))]);',
            '_cx.globalAlpha=0.4+t*0.6;',
            'circle(400+r*cos(th),400+r*sin(th),ds*(1.2+t*3.5)*(1-l*0.18));',
            '}}',
            // Nested golden rectangle overlay (6 levels)
            '_cx.globalAlpha=0.07;noFill();',
            '_cx.strokeStyle=pal[4];_cx.lineWidth=0.7;',
            'let rw=720;',
            'for(let i=0;i<6;i++){',
            'const rh=rw/PHI;',
            '_cx.strokeRect((800-rw)/2,(800-rh)/2,rw,rh);',
            'rw/=PHI;}'
        );
    }

    // =========================================================
    // Internal — Helpers
    // =========================================================

    function _palName(uint256 idx) internal pure returns (string memory) {
        if (idx == 0) return "Solar";
        if (idx == 1) return "Cosmic";
        if (idx == 2) return "Crimson";
        if (idx == 3) return "Desert";
        if (idx == 4) return "Forest";
        if (idx == 5) return "Neon";
        if (idx == 6) return "Monochrome";
        return "Emerald";
    }

    function _toHex32(bytes32 b) internal pure returns (string memory) {
        bytes memory h = "0123456789abcdef";
        bytes memory s = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            s[i * 2]     = h[uint8(b[i]) >> 4];
            s[i * 2 + 1] = h[uint8(b[i]) & 0xf];
        }
        return string(s);
    }

    // =========================================================
    // Admin
    // =========================================================

    function withdraw() external onlyOwner {
        (bool ok,) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}
