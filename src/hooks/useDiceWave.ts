import { useEffect, useState } from "react";

export const useDiceWave = (active: boolean) => {
  const [diceRollPositions, setDiceRollPositions] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

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
