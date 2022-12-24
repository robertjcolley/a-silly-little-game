import { doOverlap } from "./generateCoordinates";

test("should work correctly", () => {
  const pl1 = {
    x: 140.789,
    y: 200.603,
  };
  const pr1 = { ...pl1 };
  pr1.x = pr1.x + 30;
  pr1.y = pr1.y + 30;

  const pl2 = {
    x: 161.018,
    y: 207.681,
  };
  const pr2 = { ...pl2 };
  pr2.x = pr2.x + 30;
  pr2.y = pr2.y + 30;

  expect(doOverlap(pl1, pr1, pl2, pr2)).toBeTruthy();
});
