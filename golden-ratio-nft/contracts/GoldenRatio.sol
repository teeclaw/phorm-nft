// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721}         from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981}        from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable}        from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Base64}         from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings}        from "@openzeppelin/contracts/utils/Strings.sol";

/// @title  Golden Ratio — Fully Onchain Bauhaus Generative Art NFT
/// @notice phi = 1.618... | 61 pieces | 0.0618 ETH | Base
/// @dev    4 geometric compositions × 8 Bauhaus palettes, all phi-proportioned.
///         Art rendered 100% onchain (no IPFS, no CDN). ERC-2981 royalties included.
contract GoldenRatio is ERC721, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // =========================================================
    // Constants
    // =========================================================

    uint256 public constant MAX_SUPPLY  = 61;
    uint256 public constant MINT_PRICE  = 61800000000000000; // 0.0618 ETH

    // LCG constants (match JavaScript implementation exactly)
    uint256 private constant LCG_MULT = 6364136223846793005;
    uint256 private constant LCG_INC  = 1442695040888963407;
    uint256 private constant LCG_MASK = 0xFFFFFFFFFFFFFFFF; // 2^64 - 1

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

    constructor() ERC721("Phorm", "PHI") Ownable(msg.sender) {
        // 5% royalty to deployer by default; owner can update via setRoyalty()
        _setDefaultRoyalty(msg.sender, 500);
    }

    // =========================================================
    // Minting
    // =========================================================

    /// @notice Public mint. Overpayment is refunded (best-effort; excess stays if recipient reverts).
    function mint() external payable nonReentrant {
        _doMint(msg.sender);
    }

    /// @notice Owner-only free mint — for team, gifting, or reserves.
    function mintTo(address to) external onlyOwner {
        _doMint(to);
    }

    function _doMint(address to) private {
        if (_totalMinted >= MAX_SUPPLY) revert SoldOut();
        if (msg.sender != owner() && msg.value < MINT_PRICE) revert InsufficientPayment();

        uint256 tokenId = ++_totalMinted;
        bytes32 seed = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                tokenId,
                to,
                block.timestamp
            )
        );
        _seeds[tokenId] = seed;
        _mint(to, tokenId);
        emit Minted(to, tokenId, seed);

        // Refund overpayment — if refund fails (e.g. malicious receive()), excess stays
        // in contract for owner withdrawal. Never reverts to prevent griefing.
        uint256 excess = msg.value > MINT_PRICE ? msg.value - MINT_PRICE : 0;
        if (excess > 0) {
            (bool ok,) = payable(msg.sender).call{value: excess}("");
            // ok == false is silently ignored — excess accumulates for withdraw()
            (ok); // suppress unused variable warning
        }
    }

    // =========================================================
    // Views
    // =========================================================

    function totalMinted() external view returns (uint256) { return _totalMinted; }
    /// @dev Alias for compatibility with ERC721Enumerable-style tooling
    function totalSupply() external view returns (uint256) { return _totalMinted; }

    function seedOf(uint256 tokenId) external view returns (bytes32) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();
        return _seeds[tokenId];
    }

    // =========================================================
    // Interfaces
    // =========================================================

    /// @dev Required when inheriting from both ERC721 and ERC2981
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // =========================================================
    // Metadata — fully onchain
    // =========================================================

    /// @notice OpenSea collection metadata
    function contractURI() external view returns (string memory) {
        string memory json = string.concat(
            '{"name":"Phorm",',
            '"description":"Phorm is a fully onchain generative art collection of 61 unique pieces, ',
            'each constructed from a single mint seed and nothing else. ',
            'Every composition is governed by phi = 1.618, the golden ratio. ',
            'Proportions, positions, grid divisions, and offsets are all derived from phi, ',
            'producing geometry that feels inevitable rather than arbitrary. ',
            'Four Bauhaus-rooted compositions across eight hand-coded palettes. ',
            'No IPFS. No metadata servers. No external dependencies. ',
            'The art lives entirely in the contract. ',
            '61 pieces. 0.0618 ETH each. Both numbers are phi.",',
            '"seller_fee_basis_points":500,',
            '"fee_recipient":"', Strings.toHexString(uint160(owner()), 20), '"}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    /// @notice Fully onchain tokenURI. image = SVG thumbnail, animation_url = interactive HTML.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();

        bytes32 seed = _seeds[tokenId];

        // ── Derive traits using same LCG as JS ────────────────────────────────
        // JS: rnd() = Number(rs & 0xFFFFFFFF) / 0xFFFFFFFF
        //     pal  = PALS[floor(rnd() * 8)]   ← first RNG call
        //     COMP = floor(rnd() * 4)          ← second RNG call
        // unchecked: we intentionally want mod-2^256 overflow — the low 64 bits
        // (after & LCG_MASK) are identical to JS BigInt's mod-2^64 result.
        uint256 rs1;
        uint256 rs2;
        unchecked {
            rs1 = (uint256(seed) * LCG_MULT + LCG_INC) & LCG_MASK;
            rs2 = (rs1            * LCG_MULT + LCG_INC) & LCG_MASK;
        }
        uint256 palIdx  = ((rs1 & 0xFFFFFFFF) * 8)  / 0x100000000; // 0-7
        uint256 compIdx = ((rs2 & 0xFFFFFFFF) * 4)  / 0x100000000; // 0-3

        // ── Build SVG thumbnail (static image for marketplaces) ───────────────
        string memory svg    = _svgThumb(tokenId, palIdx);
        string memory svgB64 = Base64.encode(bytes(svg));

        // ── Build interactive HTML art ─────────────────────────────────────────
        string memory html    = _buildHtml(_toHex32(seed), tokenId);
        string memory htmlB64 = Base64.encode(bytes(html));

        // ── Attributes ─────────────────────────────────────────────────────────
        string memory attrs = string.concat(
            '[',
            '{"trait_type":"Composition","value":"', _compName(compIdx), '"},',
            '{"trait_type":"Palette","value":"',     _palName(palIdx),   '"},',
            '{"trait_type":"Edition","value":"',     tokenId.toString(), '/61"}',
            ']'
        );

        string memory json = string.concat(
            '{"name":"Phorm #', tokenId.toString(), '",',
            '"description":"Phorm is a fully onchain generative art collection governed by phi = 1.618. ',
            'Each piece is unique, constructed entirely from its mint seed. ',
            'Bauhaus geometry. No IPFS. No servers. The art lives in the contract.",',
            '"image":"data:image/svg+xml;base64,',    svgB64,  '",',
            '"animation_url":"data:text/html;base64,', htmlB64, '",',
            '"attributes":', attrs,
            '}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    // =========================================================
    // Internal — SVG Thumbnail (static, for marketplace display)
    // =========================================================

    /// @dev Generates a Bauhaus-style SVG palette preview for the `image` field.
    ///      Uses the token's actual palette colors — each token looks distinct.
    function _svgThumb(uint256 tokenId, uint256 palIdx) internal pure returns (string memory) {
        (string memory bg, string memory p1, string memory p2,
         string memory p3, string memory ink) = _pal(palIdx);

        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
            // Background
            '<rect width="800" height="800" fill="', bg, '"/>',
            // Primary block (phi-proportioned: 800/phi x 800/phi^2)
            '<rect x="100" y="100" width="494" height="306" fill="', p1, '"/>',
            // Secondary circle (radius = 306/phi = 189)
            '<circle cx="620" cy="580" r="170" fill="', p2, '"/>',
            // Accent rectangle
            '<rect x="100" y="450" width="189" height="250" fill="', p3, '"/>',
            // Phi guide line
            '<line x1="0" y1="495" x2="800" y2="495" stroke="', ink,
                '" stroke-width="1" opacity="0.3"/>',
            '<line x1="494" y1="0" x2="494" y2="800" stroke="', ink,
                '" stroke-width="1" opacity="0.3"/>',
            // Token number
            '<text x="400" y="775" text-anchor="middle" ',
                'font-family="monospace" font-size="24" fill="', ink,
                '" opacity="0.6">PHORM #', tokenId.toString(), '</text>',
            '</svg>'
        );
    }

    /// @dev Returns the 5 palette colours for a given palette index.
    ///      MUST stay in sync with _artPals() JS string.
    function _pal(uint256 idx) internal pure returns (
        string memory bg_, string memory p1_, string memory p2_,
        string memory p3_, string memory ink_
    ) {
        if (idx == 0) return ("#F8F7F0","#D62828","#1B4F72","#F39C12","#1A1A1A"); // Classic Bauhaus
        if (idx == 1) return ("#0D0D0D","#E63946","#F4D35E","#1A936F","#F5F5F5"); // Dark Primary
        if (idx == 2) return ("#F5F0E8","#2E4057","#C84B31","#048A81","#111111"); // Weimar Earth
        if (idx == 3) return ("#F5F5F5","#B80000","#111111","#999999","#E0E0E0"); // Constructivist
        if (idx == 4) return ("#FFF8E1","#1A1A1A","#C62828","#1565C0","#9E6B0A"); // Ochre Primary
        if (idx == 5) return ("#F7F7F7","#FF6B35","#004E98","#EEEEEE","#111111"); // Warm Geometric
        if (idx == 6) return ("#141414","#FFB703","#FB8500","#023047","#8ECAE6"); // Night Bauhaus
                       return ("#E8E8E8","#212529","#C0392B","#2471A3","#6C757D"); // Dessau Gray
    }

    // =========================================================
    // Internal — HTML Assembly
    // =========================================================

    function _buildHtml(string memory seedHex, uint256 tokenId)
        internal pure returns (string memory)
    {
        return string.concat(
            '<!DOCTYPE html><html><head><meta charset="utf-8">',
            '<style>*{margin:0;padding:0}body{background:#000;display:flex;',
            'align-items:center;justify-content:center;min-height:100vh;overflow:hidden}',
            'canvas{max-width:100vmin;max-height:100vmin}</style>',
            '</head><body><script>',
            _shim(),
            'const SEED="', seedHex, '",TOKEN=', tokenId.toString(), ';',
            _artParams(),
            _artFns1(),
            _artFns2(),
            _artFns3(),
            '</script></body></html>'
        );
    }

    // ─── Canvas Shim (p5.js-compatible API) ──────────────────────────────────
    function _shim() internal pure returns (string memory) {
        return string.concat(
            'const _cv=document.createElement("canvas"),',
            '_cx=_cv.getContext("2d");',
            '_cv.width=_cv.height=800;',
            'document.body.appendChild(_cv);',
            'const cos=Math.cos,sin=Math.sin,sqrt=Math.sqrt,abs=Math.abs,',
            'PI=Math.PI,TWO_PI=PI*2,floor=Math.floor,round=Math.round;',
            'function bg(c){_cx.fillStyle=c;_cx.fillRect(0,0,800,800);}',
            'function circ(x,y,r,fill,sc2,sw){',
            '_cx.beginPath();_cx.arc(x,y,r,0,TWO_PI);',
            'if(fill){_cx.fillStyle=fill;_cx.fill();}',
            'if(sc2){_cx.strokeStyle=sc2;_cx.lineWidth=sw||2;_cx.stroke();}}',
            'function rct(x,y,w,h,fill,sc2,sw){',
            'if(fill){_cx.fillStyle=fill;_cx.fillRect(x,y,w,h);}',
            'if(sc2){_cx.strokeStyle=sc2;_cx.lineWidth=sw||2;_cx.strokeRect(x,y,w,h);}}',
            'function ln(x1,y1,x2,y2,c,w){',
            '_cx.beginPath();_cx.moveTo(x1,y1);_cx.lineTo(x2,y2);',
            '_cx.strokeStyle=c;_cx.lineWidth=w||2;_cx.stroke();}',
            'function tri(ax,ay,bx,by,ex,ey,fill){',
            '_cx.beginPath();_cx.moveTo(ax,ay);_cx.lineTo(bx,by);_cx.lineTo(ex,ey);',
            '_cx.closePath();if(fill){_cx.fillStyle=fill;_cx.fill();}}'
        );
    }

    // ─── Palettes + RNG + Params ─────────────────────────────────────────────
    function _artParams() internal pure returns (string memory) {
        return string.concat(_artPals(), _artRng());
    }

    function _artPals() internal pure returns (string memory) {
        // MUST match _pal() above exactly (same indices, same hex values)
        return string.concat(
            'const PALS=[',
            '["#F8F7F0","#D62828","#1B4F72","#F39C12","#1A1A1A"],',  // 0 Classic Bauhaus
            '["#0D0D0D","#E63946","#F4D35E","#1A936F","#F5F5F5"],',  // 1 Dark Primary
            '["#F5F0E8","#2E4057","#C84B31","#048A81","#111111"],',  // 2 Weimar Earth
            '["#F5F5F5","#B80000","#111111","#999999","#E0E0E0"],',  // 3 Constructivist
            '["#FFF8E1","#1A1A1A","#C62828","#1565C0","#9E6B0A"],',  // 4 Ochre Primary
            '["#F7F7F7","#FF6B35","#004E98","#EEEEEE","#111111"],',  // 5 Warm Geometric
            '["#141414","#FFB703","#FB8500","#023047","#8ECAE6"],',  // 6 Night Bauhaus
            '["#E8E8E8","#212529","#C0392B","#2471A3","#6C757D"]',   // 7 Dessau Gray
            '];'
        );
    }

    function _artRng() internal pure returns (string memory) {
        // LCG constants must match LCG_MULT / LCG_INC / LCG_MASK above
        return string.concat(
            'const PHI=1.618033988749895;',
            'let rs=BigInt("0x"+SEED);',
            'const rnd=()=>{',
            'rs=(rs*6364136223846793005n+1442695040888963407n)&18446744073709551615n;',
            'return Number(rs&4294967295n)/4294967295;};',
            // First call → palette  (matches: rs1 in tokenURI, palIdx  = ((rs1&0xFFFFFFFF)*8)/2^32)
            'const pal=PALS[floor(rnd()*8)];',
            // Second call → composition (matches: rs2, compIdx = ((rs2&0xFFFFFFFF)*4)/2^32)
            'const COMP=floor(rnd()*4);',
            'const V1=rnd(),V2=rnd(),V3=rnd(),V4=rnd();'
        );
    }

    // ─── Compositions: phiLines + Circle Dominance + De Stijl Grid ───────────
    function _artFns1() internal pure returns (string memory) {
        return string.concat(
            'function phiLines(){',
            'const g1=floor(800/PHI),g2=floor(800-800/PHI),lc=pal[4];',
            'ln(0,g2,800,g2,lc,1);ln(g1,0,g1,800,lc,1);}',

            // 0: Circle Dominance (Kandinsky)
            'function drawCircle(){',
            'bg(pal[0]);',
            'const R=floor(250+V1*50),R2=floor(R/PHI),R3=floor(R/PHI/PHI);',
            'const ox=floor((V2-.5)*140),oy=floor((V3-.5)*100);',
            'circ(400+ox,400+oy,R,pal[1]);',
            'circ(400+ox+floor(R*.55),400+oy-floor(R2*.35),R2,pal[2]);',
            'circ(400+ox-floor(R3*.9),400+oy+floor(R2*.8),R3,pal[3]);',
            'circ(400,400,floor(R*PHI*.48),null,pal[4],2);',
            'phiLines();',
            'ln(0,400,800,400,pal[4],1);}',

            // 1: De Stijl Grid (Mondrian)
            'function drawGrid(){',
            'bg(pal[0]);',
            'const G1=floor(800/PHI),G2=800-G1,G3=floor(G2/PHI),G4=G2-G3,G5=floor(G3/PHI);',
            'rct(0,0,G3,G3,pal[1]);',
            'rct(G1,0,G2,G1,pal[2]);',
            'rct(0,G1,G3,G2,pal[3]);',
            'rct(G3,G1-G4,G1-G3,G4,pal[2]);',
            'rct(G1+G5,G1+G5,G4-G5,G4-G5,pal[3]);',
            'const gl=pal[4],gw=5;',
            'ln(G3,0,G3,800,gl,gw);ln(G1,0,G1,800,gl,gw);',
            'ln(0,G3,800,G3,gl,gw);ln(0,G1,800,G1,gl,gw);',
            'ln(G3,G1-G4,G1,G1-G4,gl,gw);',
            '_cx.strokeStyle=gl;_cx.lineWidth=gw;_cx.strokeRect(0,0,800,800);}'
        );
    }

    // ─── Compositions: Constructivist + Nested Forms ─────────────────────────
    function _artFns2() internal pure returns (string memory) {
        return string.concat(
            // 2: Constructivist Diagonal (Rodchenko / El Lissitzky)
            'function drawConst(){',
            'bg(pal[0]);',
            'const ang=[PI/6,PI/4,PI/3][floor(V1*3)];',
            '_cx.save();_cx.translate(400,400);_cx.rotate(ang);',
            '_cx.fillStyle=pal[1];_cx.fillRect(-55,-700,110,1400);',
            '_cx.restore();',
            '_cx.save();_cx.translate(400,400);_cx.rotate(ang+PI/2);',
            '_cx.fillStyle=pal[2];_cx.globalAlpha=0.55;',
            '_cx.fillRect(-28,-700,56,1400);',
            '_cx.globalAlpha=1;_cx.restore();',
            'const R=floor(120+V2*90);',
            'circ(floor(160+V3*120),floor(560+V4*100),R,pal[3]);',
            'circ(floor(620+V4*80),floor(160+V1*80),floor(R/PHI),pal[1]);',
            'const tx=floor(620+V3*60),ty=floor(80+V2*60),ts=floor(60+V1*50);',
            'tri(tx,ty,tx+ts,ty+floor(ts*PHI),tx-ts,ty+floor(ts*PHI),pal[2]);',
            'ln(0,floor(800/PHI),800,floor(800/PHI),pal[4],3);}',

            // 3: Nested Forms (Josef Albers)
            'function drawNested(){',
            'bg(pal[0]);',
            'const useCircle=V1>0.5;',
            'let sz=720,ci=0;',
            'while(sz>24){',
            'const c=pal[1+(ci%(pal.length-1))],x=(800-sz)/2,y=(800-sz)/2;',
            'const yo=useCircle?0:floor(ci*(8+V2*12));',
            'if(useCircle)circ(400,400,sz/2,c);',
            'else rct(x,y+yo,sz,sz-yo*2,c);',
            'sz=floor(sz/PHI);ci++;}',
            'circ(400,400,floor(12+V3*16),pal[4]);',
            'phiLines();}'
        );
    }

    // ─── Dispatch ────────────────────────────────────────────────────────────
    function _artFns3() internal pure returns (string memory) {
        return string.concat(
            'if(COMP===0)drawCircle();',
            'else if(COMP===1)drawGrid();',
            'else if(COMP===2)drawConst();',
            'else drawNested();'
        );
    }

    // =========================================================
    // Internal — Helpers
    // =========================================================

    function _palName(uint256 idx) internal pure returns (string memory) {
        if (idx == 0) return "Classic Bauhaus";
        if (idx == 1) return "Dark Primary";
        if (idx == 2) return "Weimar Earth";
        if (idx == 3) return "Constructivist";
        if (idx == 4) return "Ochre Primary";
        if (idx == 5) return "Warm Geometric";
        if (idx == 6) return "Night Bauhaus";
        return "Dessau Gray";
    }

    function _compName(uint256 idx) internal pure returns (string memory) {
        if (idx == 0) return "Circle Dominance";
        if (idx == 1) return "De Stijl Grid";
        if (idx == 2) return "Constructivist Diagonal";
        return "Nested Forms";
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

    /// @notice Update royalty recipient and fee. Max 10% (1000 basis points).
    function setRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        require(feeNumerator <= 1000, "Max 10%");
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function withdraw() external onlyOwner {
        (bool ok,) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}
