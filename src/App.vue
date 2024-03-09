<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { galaxiesSolver } from "./solver";

const puzzleSize = ref(7);

const puzzleMap = ref(
  Array(puzzleSize.value)
    .fill(null)
    .map(() => Array<number>(puzzleSize.value).fill(-1))
);

const getCenterPointSize = () => puzzleSize.value * 2 - 1;

const colors = [
  "red",
  "silver",
  "white",
  "purple",
  "gray",
  "fuchsia",
  "yellow",
  "green",
  "lime",
  "olive",
  "navy",
  "blue",
  "teal",
  "aqua",
];

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
  const solvedPuzzleMap = galaxiesSolver(
    centerPointsMap.value,
    puzzleSize.value
  );
  puzzleMap.value = solvedPuzzleMap;
};

const changeSize = (e: FocusEvent) => {
  console.log((e.target as HTMLInputElement).value)
  puzzleSize.value = Math.min(
    15,
    Math.max(5, parseInt((e.target as HTMLInputElement).value))
  );
  clearPuzzle();
};
</script>

<template>
  <div class="puzzle">
    <div class="row" v-for="x in puzzleSize">
      <div
        class="cell"
        v-for="y in puzzleSize"
        :style="{
          backgroundColor:
            puzzleMap[x - 1][y - 1] !== -1
              ? colors[puzzleMap[x - 1][y - 1] % colors.length]
              : '',
        }"
      >
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
  <input type="number" @blur="changeSize" :value="puzzleSize" />
  <button @click="clearPuzzle">clear</button>
  <button @click="solvePuzzle">solve</button>
</template>

<style scoped>
.puzzle {
  border: 1px solid gray;
  border-right: 0;
  border-bottom: 0;
  display: flex;
}

.cell {
  width: 32px;
  height: 32px;
  border: 1px solid gray;
  border-left: 0;
  border-top: 0;
  position: relative;
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
  width: 10px;
  height: 10px;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1px solid black;
  background-color: white;
  position: relative;
  top: 3px;
  left: 3px;
}

.point:hover::before {
  display: block;
  border: 1px dashed #7b7b7b;
}

.point.confirm::before {
  display: block;
  border: 1px solid black;
}

.cross {
  position: absolute;
  left: -8.5px;
  top: -8.5px;
}

.center {
  position: absolute;
  left: 8px;
  top: 8px;
}

.top-border {
  position: absolute;
  left: 8px;
  top: -8.5px;
}

.left-border {
  position: absolute;
  left: -8.5px;
  top: 8px;
}
</style>
