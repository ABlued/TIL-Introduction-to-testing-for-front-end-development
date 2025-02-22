import { render, screen } from "@testing-library/react";
import { PaginationInfo } from ".";

test("[role='region']", () => {
  render(<PaginationInfo start={1} end={10} hitCount={100} />);
  expect(
    screen.getByRole("region", { name: "표시중인 목록" })
  ).toBeInTheDocument();
});
