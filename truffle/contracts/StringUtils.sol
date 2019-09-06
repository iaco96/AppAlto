pragma solidity ^0.5.0;

library StringUtils {
    
    function compareStrings(string memory a, string memory b) internal returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
    }
}
