<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { coloringMap, galaxiesSolver } from "./solver";

const colors = ["#ff9999", "#99ff99", "#99ccff", "#ffff99", "#dddddd", "white"];

const puzzleSize = ref(7);

const puzzleMap = ref(
  Array(puzzleSize.value)
    .fill(null)
    .map(() => Array<number>(puzzleSize.value).fill(-1))
);

const getCenterPointSize = () => puzzleSize.value * 2 - 1;

const centerPointsMap = ref(
  Array(getCenterPointSize())
    .fill(null)
    .map(() => Array<number>(getCenterPointSize()).fill(0))
);

const onClickPoint = (x: number, y: number) => {
  if (centerPointsMap.value[x][y]) {
    centerPointsMap.value[x][y] = 0;
  } else {
    centerPointsMap.value[x][y] = 1;
  }
};

const clearPuzzle = () => {
  puzzleMap.value = Array(puzzleSize.value)
    .fill(null)
    .map(() => Array<number>(puzzleSize.value).fill(-1));
  centerPointsMap.value = Array(getCenterPointSize())
    .fill(null)
    .map(() => Array<number>(getCenterPointSize()).fill(0));
};

const solvePuzzle = () => {
  console.log(JSON.stringify(centerPointsMap.value));
  const solvedPuzzleMap = galaxiesSolver(centerPointsMap.value);
  const coloredPuzzleMap = coloringMap(solvedPuzzleMap);
  puzzleMap.value = coloredPuzzleMap;
};

(window as any)._loadPuzzle = (map: number[][]) => {
  puzzleSize.value = (map.length + 1) / 2;
  clearPuzzle();
  centerPointsMap.value = map;
};

const changeSize = (e: FocusEvent) => {
  puzzleSize.value = Math.min(
    25,
    Math.max(5, parseInt((e.target as HTMLInputElement).value))
  );
  clearPuzzle();
};
</script>

<template>
  <div class="container">
    <div class="puzzle">
      <div class="row" v-for="y in puzzleSize">
        <div
          class="cell"
          v-for="x in puzzleSize"
          :style="{
            backgroundColor:
              puzzleMap[x - 1][y - 1] === -1
                ? ''
                : colors[puzzleMap[x - 1][y - 1] % colors.length],
          }"
        >
          <div
            v-if="
              y !== 1 && puzzleMap[x - 1][y - 1] !== puzzleMap[x - 1][y - 2]
            "
            class="separator-top"
          ></div>
          <div
            v-if="
              x !== 1 && puzzleMap[x - 1][y - 1] !== puzzleMap[x - 2][y - 1]
            "
            class="separator-left"
          ></div>
          <div
            v-if="y !== 1 && x !== 1"
            class="point cross"
            :class="{
              confirm: centerPointsMap[2 * (x - 2) + 1][2 * (y - 2) + 1],
            }"
            @click="onClickPoint(2 * (x - 2) + 1, 2 * (y - 2) + 1)"
          ></div>
          <div
            class="point center"
            :class="{ confirm: centerPointsMap[2 * (x - 1)][2 * (y - 1)] }"
            @click="onClickPoint(2 * (x - 1), 2 * (y - 1))"
          ></div>
          <div
            v-if="y !== 1"
            class="point top-border"
            :class="{ confirm: centerPointsMap[2 * (x - 1)][2 * (y - 2) + 1] }"
            @click="onClickPoint(2 * (x - 1), 2 * (y - 2) + 1)"
          ></div>
          <div
            v-if="x !== 1"
            class="point left-border"
            :class="{ confirm: centerPointsMap[2 * (x - 2) + 1][2 * (y - 1)] }"
            @click="onClickPoint(2 * (x - 2) + 1, 2 * (y - 1))"
          ></div>
        </div>
      </div>
    </div>
  </div>
  <input type="number" @blur="changeSize" :value="puzzleSize" />
  <button @click="clearPuzzle">clear</button>
  <button @click="solvePuzzle">solve</button>
</template>

<style scoped>
.container {
  display: flex;
}

.puzzle {
  border: 4px solid black;
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-direction: row;
}

.cell {
  width: 32px;
  height: 32px;
  border: 1px solid rgb(170, 170, 170);
  border-left: 0;
  border-top: 0;
  position: relative;
}

.row:last-child > .cell {
  border-bottom: 0;
}

.cell:last-child {
  border-right: 0;
}

.point {
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 16px;
  box-sizing: border-box;
}

.point::before {
  content: " ";
  /* display: block; */
  display: none;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 2px solid black;
  background-color: white;
  position: relative;
  top: 3px;
  left: 3px;
}

.point:hover::before {
  display: block;
  border: 2px dashed #7b7b7b;
}

.point.confirm::before {
  display: block;
  border: 2px solid black;
}

.cross {
  position: absolute;
  left: -9.5px;
  top: -9.5px;
}

.center {
  position: absolute;
  left: 7px;
  top: 7px;
}

.top-border {
  position: absolute;
  left: 7px;
  top: -9.5px;
}

.left-border {
  position: absolute;
  left: -9.5px;
  top: 7px;
}

.separator-left {
  width: 4px;
  height: 36px;
  background-color: black;
  position: absolute;
  z-index: 2;
  left: -2.5px;
  top: -2.5px;
}

.separator-top {
  width: 36px;
  height: 4px;
  background-color: black;
  position: absolute;
  z-index: 2;
  left: -2.5px;
  top: -2.5px;
}
</style>
