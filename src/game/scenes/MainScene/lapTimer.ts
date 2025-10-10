const LAP_LABEL = ["1st  ", "2nd  ", "Final"];
export class LapTimer {
  scene: Phaser.Scene;
  lapNum: number;
  startTime: number;
  lapData: {
    lapTime: number | null;
    lapStartTime: number | null;
    endPoint: number;
  }[];
  totalTime!: number;

  constructor(scene: Phaser.Scene, endPoint: number[]) {
    this.scene = scene;
    this.lapNum = 0;
    this.startTime = 0;
    this.totalTime = 0;

    this.lapData = [];
    for (let i = 0; i < endPoint.length; i++) {
      this.lapData.push({
        lapTime: null,
        lapStartTime: 0,
        endPoint: endPoint[i],
      });
    }
  }

  start(startTime: number) {
    this.startTime = startTime;
    for (let i = 0; i < this.lapData.length; i++) {
      if (i === 0) {
        this.lapData[i].lapStartTime = startTime;
      } else {
        null;
      }
    }
  }
  update(
    playerCarMilage: number,
    txtTotalTime: Phaser.GameObjects.BitmapText,
    txtLapTimeList: Phaser.GameObjects.BitmapText[],
    callbackWhenLapInc: (lap: number) => void,
    isFree: boolean
  ) {
    if (isFree) return;
    const nowTime = this.scene.time.now;
    if (this.lapData[this.lapNum].endPoint < playerCarMilage) {
      this.addLap(nowTime);
      callbackWhenLapInc(this.lapNum);
    }
    if (this.lapNum >= this.lapData.length) {
      return;
    }
    this.totalTime = nowTime - this.startTime;
    txtTotalTime.text = formatTimeText(this.totalTime);

    this.lapData[this.lapNum].lapTime =
      nowTime - (this.lapData[this.lapNum].lapStartTime || 0);

    for (let i = 0; i < txtLapTimeList.length; i++) {
      this.setTxtLapTime(i, txtLapTimeList);
    }
  }
  setTxtLapTime(i: number, txtLapTimeList: Phaser.GameObjects.BitmapText[]) {
    if (i === this.lapNum) {
      txtLapTimeList[i].setTint(0x660000);
      txtLapTimeList[i].text = `>>${LAP_LABEL[i]} ${formatTimeText(
        this.lapData[i].lapTime
      )}`;
    } else {
      txtLapTimeList[i].setTint(0x212121);
      txtLapTimeList[i].text = `  ${LAP_LABEL[i]} ${formatTimeText(
        this.lapData[i].lapTime
      )}`;
    }
  }

  private addLap(nowTime: number) {
    this.lapNum++;
    if (this.lapNum < this.lapData.length) {
      this.lapData[this.lapNum].lapStartTime = nowTime;
    }
  }
}

export function formatTimeText(time: number | null) {
  if (time === null) {
    return "--'--.--";
  }
  const _time = time / 1000;
  const minutes = Math.floor(_time / 60);
  const seconds = Math.floor(_time % 60);
  const fractions = (_time % 1).toFixed(2).substring(1);
  const mStr = String(minutes).padStart(2, "0");
  const sStr = String(seconds).padStart(2, "0");
  return `${mStr}'${sStr}${fractions}`;
}

// 2分以内かどうか
export function isWithinTwoMinutes(time: number | null): boolean {
  if (time === null) return false;
  return time < 2 * 60 * 1000; // 2分 = 120,000ms
}
