// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Golden Ratio — Fully Onchain Bauhaus Generative Art NFT
/// @notice phi = 1.618... | 61 pieces | 0.0618 ETH each | Base network
/// @dev Geometric Bauhaus art (4 compositions × 8 palettes) driven by phi proportions.
///      All art rendered onchain via embedded Canvas API. No external dependencies.
contract GoldenRatio is ERC721, Ownable {
    using Strings for uint256;

    // =========================================================
    // Constants
    // =========================================================

    uint256 public constant MAX_SUPPLY = 61;
    uint256 public constant MINT_PRICE = 61800000000000000; // 0.0618 ETH

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

        uint256 excess = msg.value - MINT_PRICE;
        if (excess > 0) {
            (bool ok,) = payable(msg.sender).call{value: excess}("");
            require(ok, "Refund failed");
        }
    }

    // =========================================================
    // Views
    // =========================================================

    function totalMinted() external view returns (uint256) { return _totalMinted; }

    function seedOf(uint256 tokenId) external view returns (bytes32) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();
        return _seeds[tokenId];
    }

    // =========================================================
    // Metadata — fully onchain
    // =========================================================

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert Nonexistent();

        bytes32 seed = _seeds[tokenId];
        string memory h = _toHex32(seed);
        uint256 s = uint256(seed);

        // Traits derived from seed (must match JS logic)
        string memory palName  = _palName(s % 8);
        string memory compName = _compName((s >> 32) % 4);

        string memory html    = _buildHtml(h, tokenId);
        string memory htmlB64 = Base64.encode(bytes(html));

        string memory attrs = string.concat(
            '[',
            '{"trait_type":"Composition","value":"', compName,  '"},',
            '{"trait_type":"Palette","value":"',     palName,   '"},',
            '{"trait_type":"Edition","value":"',     tokenId.toString(), '/61"}',
            ']'
        );

        string memory json = string.concat(
            '{"name":"Golden Ratio #', tokenId.toString(), '",',
            '"description":"Fully onchain Bauhaus generative art. ',
            'Geometric compositions driven by phi = 1.618. ',
            '4 composition types, 8 palettes, 61 unique pieces. ',
            'Rendered entirely onchain from mint seed.",',
            '"image":"data:text/html;base64,',        htmlB64, '",',
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

    // ─── Section 1: Canvas Shim ───────────────────────────────────────────────
    function _shim() internal pure returns (string memory) {
        return string.concat(
            'const _cv=document.createElement("canvas"),',
            '_cx=_cv.getContext("2d");',
            '_cv.width=_cv.height=800;',
            'document.body.appendChild(_cv);',
            'const cos=Math.cos,sin=Math.sin,sqrt=Math.sqrt,abs=Math.abs,',
            'PI=Math.PI,TWO_PI=PI*2,floor=Math.floor,round=Math.round;',
            'function bg(c){_cx.fillStyle=c;_cx.fillRect(0,0,800,800);}',
            'function fc(c){_cx.fillStyle=c;}',
            'function sc(c,w){_cx.strokeStyle=c;_cx.lineWidth=w||2;}',
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
            'function tri(ax,ay,bx,by,cx2,cy2,fill){',
            '_cx.beginPath();_cx.moveTo(ax,ay);_cx.lineTo(bx,by);_cx.lineTo(cx2,cy2);',
            '_cx.closePath();if(fill){_cx.fillStyle=fill;_cx.fill();}}'
        );
    }

    // ─── Section 2: Palettes, RNG, Parameters ────────────────────────────────
    function _artParams() internal pure returns (string memory) {
        return string.concat(
            _artPals(),
            _artRng()
        );
    }

    function _artPals() internal pure returns (string memory) {
        return string.concat(
            // 8 Bauhaus-inspired palettes: [bg, primary, secondary, accent, ink]
            'const PALS=[',
            '["#F8F7F0","#D62828","#1B4F72","#F39C12","#1A1A1A"],',  // 0 Classic Bauhaus
            '["#0D0D0D","#E63946","#F4D35E","#1A936F","#F5F5F5"],',  // 1 Dark Primary
            '["#F5F0E8","#2E4057","#C84B31","#048A81","#111111"],',  // 2 Weimar Earth
            '["#F5F5F5","#B80000","#111111","#999999","#E0E0E0"],',  // 3 Constructivist
            '["#FFF8E1","#1A1A1A","#C62828","#1565C0","#9E6B0A"],',  // 4 Ochre Primary
            '["#F7F7F7","#FF6B35","#004E98","#EEE","#111111"],',     // 5 Warm Geometric
            '["#141414","#FFB703","#FB8500","#023047","#8ECAE6"],',  // 6 Night Bauhaus
            '["#E8E8E8","#212529","#C0392B","#2471A3","#6C757D"]',   // 7 Dessau Gray
            '];'
        );
    }

    function _artRng() internal pure returns (string memory) {
        return string.concat(
            'const PHI=1.618033988749895;',
            'let rs=BigInt("0x"+SEED);',
            'const rnd=()=>{rs=(rs*6364136223846793005n+1442695040888963407n)&18446744073709551615n;',
            'return Number(rs&4294967295n)/4294967295;};',
            // Derived parameters
            'const pal=PALS[floor(rnd()*8)];',   // colour palette
            'const COMP=floor(rnd()*4);',          // composition type 0-3
            'const V1=rnd(),V2=rnd(),V3=rnd(),V4=rnd();' // variant floats
        );
    }

    // ─── Section 3: Shared utility + Circle Dominance + De Stijl Grid ────────
    function _artFns1() internal pure returns (string memory) {
        return string.concat(
            // Shared: draw phi-ratio guide lines
            'function phiLines(){',
            'const g1=floor(800/PHI),g2=floor(800-800/PHI),lc=pal[4];',
            'ln(0,g2,800,g2,lc,1);',   // horizontal at 1 - 1/phi
            'ln(g1,0,g1,800,lc,1);}',  // vertical at 1/phi

            // Composition 0: Circle Dominance (Kandinsky)
            'function drawCircle(){',
            'bg(pal[0]);',
            'const R=floor(250+V1*50);',
            'const R2=floor(R/PHI),R3=floor(R/PHI/PHI);',
            'const ox=floor((V2-.5)*140),oy=floor((V3-.5)*100);',
            // Primary circle
            'circ(400+ox,400+oy,R,pal[1]);',
            // Secondary circle offset
            'circ(400+ox+floor(R*.55),400+oy-floor(R2*.35),R2,pal[2]);',
            // Tertiary small circle
            'circ(400+ox-floor(R3*.9),400+oy+floor(R2*.8),R3,pal[3]);',
            // Outline ring at phi scale
            'circ(400,400,floor(R*PHI*.48),null,pal[4],2);',
            // Phi guide lines
            'phiLines();',
            // Centre cross hair (thin)
            'ln(0,400,800,400,pal[4],1);',
            '}',

            // Composition 1: De Stijl Grid (Mondrian)
            'function drawGrid(){',
            'bg(pal[0]);',
            'const G1=floor(800/PHI);',   // ~494
            'const G2=800-G1;',            // ~306
            'const G3=floor(G2/PHI);',    // ~189
            'const G4=G2-G3;',            // ~117
            'const G5=floor(G3/PHI);',    // ~117 inner
            // Color rectangles
            'rct(0,0,G3,G3,pal[1]);',
            'rct(G1,0,G2,G1,pal[2]);',
            'rct(0,G1,G3,G2,pal[3]);',
            'rct(G3,G1-G4,G1-G3,G4,pal[2]);',
            'rct(G1+G5,G1+G5,G4-G5,G4-G5,pal[3]);',
            // Bold grid lines
            'const gl=pal[4],gw=5;',
            'ln(G3,0,G3,800,gl,gw);',
            'ln(G1,0,G1,800,gl,gw);',
            'ln(0,G3,800,G3,gl,gw);',
            'ln(0,G1,800,G1,gl,gw);',
            'ln(G3,G1-G4,G1,G1-G4,gl,gw);',
            // Border
            '_cx.strokeStyle=gl;_cx.lineWidth=gw;_cx.strokeRect(0,0,800,800);',
            '}'
        );
    }

    // ─── Section 4: Constructivist + Nested Forms + Dispatch ─────────────────
    function _artFns2() internal pure returns (string memory) {
        return string.concat(
            // Composition 2: Constructivist Diagonal (Rodchenko/El Lissitzky)
            'function drawConst(){',
            'bg(pal[0]);',
            // Diagonal band angle: V1 selects 30/45/60 deg
            'const ang=[PI/6,PI/4,PI/3][floor(V1*3)];',
            '_cx.save();_cx.translate(400,400);_cx.rotate(ang);',
            '_cx.fillStyle=pal[1];_cx.fillRect(-55,-700,110,1400);',
            '_cx.restore();',
            // Second thinner band offset
            '_cx.save();_cx.translate(400,400);_cx.rotate(ang+PI/2);',
            '_cx.fillStyle=pal[2];_cx.globalAlpha=0.55;_cx.fillRect(-28,-700,56,1400);',
            '_cx.globalAlpha=1;_cx.restore();',
            // Large circle counterpoint
            'const R=floor(120+V2*90);',
            'const cx2=floor(160+V3*120),cy2=floor(560+V4*100);',
            'circ(cx2,cy2,R,pal[3]);',
            // Small accent circle
            'circ(floor(620+V4*80),floor(160+V1*80),floor(R/PHI),pal[1]);',
            // Triangle element
            'const tx=floor(620+V3*60),ty=floor(80+V2*60),ts=floor(60+V1*50);',
            'tri(tx,ty,tx+ts,ty+floor(ts*PHI),tx-ts,ty+floor(ts*PHI),pal[2]);',
            // Horizontal rule at phi
            'ln(0,floor(800/PHI),800,floor(800/PHI),pal[4],3);',
            '}',

            // Composition 3: Nested Forms (Josef Albers + Bauhaus)
            'function drawNested(){',
            'bg(pal[0]);',
            'const useCircle=V1>0.5;',
            'let sz=720,ci2=0;',
            'while(sz>24){',
            'const c=pal[1+(ci2%(pal.length-1))];',
            'const x=(800-sz)/2,y=(800-sz)/2;',
            'const yOff=useCircle?0:floor(ci2*(8+V2*12));',
            'if(useCircle){circ(400,400,sz/2,c);}',
            'else{rct(x,y+yOff,sz,sz-yOff*2,c);}',
            'sz=floor(sz/PHI);ci2++;}',
            // Centre accent dot
            'circ(400,400,floor(12+V3*16),pal[4]);',
            // Phi guide lines (subtle)
            'phiLines();',
            '}'
        );
    }

    function _artFns3() internal pure returns (string memory) {
        return string.concat(
            // Dispatch
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

    function withdraw() external onlyOwner {
        (bool ok,) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}
