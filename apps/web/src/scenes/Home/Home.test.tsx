import renderer from "react-test-renderer";
import { test, expect } from "vitest";
import Home from ".";

test("Home", () => {
  test("renders", () => {
    const instance = renderer.create(<Home />);
    expect(instance.toJSON()).toMatchSnapshot();
  });
});
