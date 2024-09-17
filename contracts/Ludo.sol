// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract Ludo {
    error Invalidplayer();
    error PlayerhasAlreadyWon();
    struct Player {
        uint256 position;
        bool hasWon;
        address playerAddress;
    }

    uint256 public rollcount = 0;

    // can only win if there accumulate postion is 49
    uint256 private constant WINNINGNUMBER = 49;
    Player[4] public players;
    uint256 public currentPlayer;

    event DiceRolled(uint256 player, uint256 roll);
    event PlayerMoved(uint256 player, uint256 newPosition);
    event PlayerWon(uint256 player);

    constructor() {
        currentPlayer = 0;
    }

    // this will rool the  dice 2 times and move the player forward
    function play() external {
        uint256 roll = rollDice();
        roll = roll + rollDice();
        movePlayer(roll);
    }
    //  =============== view functions =========
    function getPlayer(uint256 player) external view returns (uint256) {
        require(player < 4, Invalidplayer());
        return players[player].position;
    }

    function hasPlayerWon(uint256 player) external view returns (bool) {
        require(player < 4, Invalidplayer());
        return players[player].hasWon;
    }

    // to generate random  number
    function rollDice() private returns (uint256 roll) {
        // checked geeksforgeeks
        roll = uint256(
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, rollcount)
                )
            ) % 6)
        );
        rollcount = rollcount + 1;
        emit DiceRolled(currentPlayer, roll);
    }

    function movePlayer(uint256 roll) private {
        require(!players[currentPlayer].hasWon, PlayerhasAlreadyWon());

        uint256 newPosition = players[currentPlayer].position + roll;
        players[currentPlayer].position = newPosition;
        emit PlayerMoved(currentPlayer, newPosition);

        if (newPosition == WINNINGNUMBER) {
            players[currentPlayer].hasWon = true;
            emit PlayerWon(currentPlayer);
        }

        // this is perform  a mod addition so that current will not be greater than 3
        currentPlayer = (currentPlayer + 1) % 4;
    }
}
