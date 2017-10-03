pragma solidity ^0.4.11;

import "./MintableToken.sol";

/**
 * Exorise Token
 */
contract ExoCoin is MintableToken {
    string public constant name = "Exorise Token";
    string public constant symbol = "EXC";
    uint8 public constant decimals = 18;  // 18 is the most common number of decimal places
}

