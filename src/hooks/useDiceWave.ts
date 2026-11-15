import { useEffect, useState } from "react";

const useDiceWave = (active: boolean) => {
  const [diceRollPositions, setDiceRollPositions] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  //   useEffect(() => {
  //     let index = 0;
  //     let animationFrameId: number;
  //     const interval = setInterval(() => {
  //       const startTime = performance.now();

  //       const animate = () => {
  //         const elapsed = performance.now() - startTime;
  //         const progress = Math.min(elapsed / 100, 1); // 100ms animation

  //         let newPositions = Array(5)
  //           .fill(null)
  //           .map((_, i) => {
  //             const distance = Math.abs(i - index);
  //             const maxOffset = -4; // Peak of the wave
  //             const y = maxOffset * Math.cos(distance * (Math.PI / 4)) * progress; // Smooth easing
  //             return [0, y];
  //           });

  //         setDiceRollPositions(newPositions);

  //         if (progress < 1) {
  //           animationFrameId = requestAnimationFrame(animate);
  //         }
  //       };

  //       animationFrameId = requestAnimationFrame(animate);
  //       index = (index + 1) % 5;
  //     }, 100);

  //     return () => {
  //       clearInterval(interval);
  //       cancelAnimationFrame(animationFrameId);
  //     };
  //   }, []);
  useEffect(() => {
    if (active) {
      let index = 0;
      let isUp = true;
      const interval = setInterval(() => {
        const newPositions = Array(5).fill([0, 0]);

        if (isUp) {
          newPositions[index] = [0, -4]; // Move dice up
        } else {
          newPositions[index] = [0, 0]; // Move dice back down
        }

        setDiceRollPositions(newPositions);

        if (!isUp) {
          index = (index + 1) % 5; // Move to next dice when moving down
        }

        isUp = !isUp; // Toggle up/down
      }, 200); // Slower to emphasize the clunky effect

      return () => clearInterval(interval);
    }
  }, [active]);

  return diceRollPositions;
};

export default useDiceWave;
