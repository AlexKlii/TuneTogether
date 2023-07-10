// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract ArtistProject is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    string private _baseUri;
    string public artistName;

    constructor(string memory baseUri_, string memory _artistName) ERC1155(baseUri_) {
        _baseUri = baseUri_;
        artistName = _artistName;
    }

    function mint(address _account, uint256 _id, uint256 _amount) public {
        _mint(_account, _id, _amount, "");
    }

    function uri(uint _tokenId) public view override returns (string memory) {
        return string.concat(_baseUri, Strings.toString(_tokenId), ".json");
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address _operator,address _from,address _to,uint256[] memory _ids,uint256[] memory _amounts,bytes memory _data) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(_operator,_from,_to,_ids,_amounts,_data);
    }
}
