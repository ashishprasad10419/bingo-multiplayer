package com.bingo.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LockBoardRequest {
    // Optional client-supplied board (if client edited client-side, server validates completely)
    private List<List<Integer>> board;
}
