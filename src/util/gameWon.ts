import { PositionInfo } from '../types';
import { POSITION_STATUS } from '../constants';

export default function gameWon(
  posNo: number,
  boardPositions: PositionInfo[],
  boardSize: number[]
): boolean | string {
  if (posNo === -1) return false;

  const [rows, cols] = boardSize;

  const [W, E, N, S, NW, SE, NE, SW] = [
    -1,
    1,
    -cols,
    cols,
    -(cols + 1),
    cols + 1,
    -(cols - 1),
    cols - 1,
  ];

  const checkHorizontal = (): boolean => {
    let placeHolder: number = posNo;
    let selectedColor: POSITION_STATUS = boardPositions[placeHolder].status;
    if (boardPositions[placeHolder + W] !== undefined) {
      // move placeHolder back to the first occurrence of an uninterrupted seq. of selected positions
      while (
        // prevent going beyond the border of the grid
        placeHolder % cols > 0 &&
        boardPositions[placeHolder + W].status === selectedColor
      ) {
        placeHolder += W;
        if (boardPositions[placeHolder + W] === undefined) break;
      }
    }
    if (boardPositions[placeHolder + E] !== undefined) {
      // gather up the selected positions
      let selectedPositions: PositionInfo[] = [];
      selectedPositions.push(boardPositions[placeHolder]);
      while (
        placeHolder % cols < cols - 1 &&
        boardPositions[placeHolder + E].status === selectedColor &&
        selectedPositions.length < 5
      ) {
        placeHolder += E;
        selectedPositions.push(boardPositions[placeHolder]);
        if (boardPositions[placeHolder + E] === undefined) break;
      }
      return selectedPositions.length >= 5;
    } else {
      return false;
    }
  };

  const checkVertical = (): boolean => {
    let placeHolder: number = posNo;
    let selectedColor: POSITION_STATUS = boardPositions[placeHolder].status;
    if (boardPositions[placeHolder + N] !== undefined) {
      // move placeHolder back to the first occurrence of an uninterrupted seq. of selected positions
      while (
        Math.trunc(placeHolder / cols) > 0 &&
        boardPositions[placeHolder + N].status === selectedColor
      ) {
        placeHolder += N;
        if (boardPositions[placeHolder + N] === undefined) break;
      }
    }
    if (boardPositions[placeHolder + S] !== undefined) {
      // gather up the selected positions
      let selectedPositions: PositionInfo[] = [];
      selectedPositions.push(boardPositions[placeHolder]);
      while (
        Math.trunc(placeHolder / cols) < rows - 1 &&
        boardPositions[placeHolder + S].status === selectedColor &&
        selectedPositions.length < 5
      ) {
        placeHolder += S;
        selectedPositions.push(boardPositions[placeHolder]);
        if (boardPositions[placeHolder + S] === undefined) break;
      }
      return selectedPositions.length >= 5;
    } else {
      return false;
    }
  };

  const checkBackDiag = (): boolean => {
    let placeHolder: number = posNo;
    let selectedColor: POSITION_STATUS = boardPositions[placeHolder].status;
    if (boardPositions[placeHolder + NW] !== undefined) {
      // move placeHolder back to the first occurrence of an uninterrupted seq. of selected positions
      while (
        placeHolder % cols > 0 &&
        Math.trunc(placeHolder / cols) > 0 &&
        boardPositions[placeHolder + NW].status === selectedColor
      ) {
        placeHolder += NW;
        if (boardPositions[placeHolder + NW] === undefined) break;
      }
    }
    if (boardPositions[placeHolder + SE] !== undefined) {
      // gather up the selected positions
      let selectedPositions: PositionInfo[] = [];
      selectedPositions.push(boardPositions[placeHolder]);
      while (
        placeHolder % cols < cols - 1 &&
        Math.trunc(placeHolder / cols) < rows - 1 &&
        boardPositions[placeHolder + SE].status === selectedColor &&
        selectedPositions.length < 5
      ) {
        placeHolder += SE;
        selectedPositions.push(boardPositions[placeHolder]);
        if (boardPositions[placeHolder + SE] === undefined) break;
      }
      return selectedPositions.length >= 5;
    } else {
      return false;
    }
  };

  const checkFwdDiag = (): boolean => {
    let placeHolder: number = posNo;
    let selectedColor: POSITION_STATUS = boardPositions[placeHolder].status;
    if (boardPositions[placeHolder + NE] !== undefined) {
      // move placeHolder back to the first occurrence of an uninterrupted seq. of selected positions
      while (
        placeHolder % cols < cols - 1 &&
        Math.trunc(placeHolder / cols) > 0 &&
        boardPositions[placeHolder + NE].status === selectedColor
      ) {
        placeHolder += NE;
        if (boardPositions[placeHolder + NE] === undefined) break;
      }
    }
    if (boardPositions[placeHolder + SW] !== undefined) {
      // gather up the selected positions
      let selectedPositions: PositionInfo[] = [];
      selectedPositions.push(boardPositions[placeHolder]);
      while (
        placeHolder % cols > 0 &&
        Math.trunc(placeHolder / cols) < rows - 1 &&
        boardPositions[placeHolder + SW].status === selectedColor &&
        selectedPositions.length < 5
      ) {
        placeHolder += SW;
        selectedPositions.push(boardPositions[placeHolder]);
        if (boardPositions[placeHolder + SW] === undefined) break;
      }
      return selectedPositions.length >= 5;
    } else {
      return false;
    }
  };

  if (
    checkHorizontal() ||
    checkVertical() ||
    checkBackDiag() ||
    checkFwdDiag()
  ) {
    return true;
  } else {
    return false;
  }
}
