package com.bingo.game.dto;

import com.bingo.game.engine.ShipBattleEngine.ShipPlacement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipLockFleetRequest {
    private String gameId;
    private String clientMoveId;
    private List<ShipPlacement> fleet;
}
