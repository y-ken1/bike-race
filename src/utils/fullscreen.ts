export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen()
      .then(() => {
        console.log("Entered fullscreen mode");
      })
      .catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`
        );
      });
  } else {
    document
      .exitFullscreen()
      .then(() => {
        console.log("Exited fullscreen mode");
      })
      .catch((err) => {
        console.error(
          `Error attempting to exit fullscreen mode: ${err.message}`
        );
      });
  }
}
