import { menu } from "../schemas/menu";
export function About() {
  return (
    <div className="about-content">
      <p>
        Mission Control is a space mission design simulation for the{" "}
        {menu.event}.
      </p>
      <p>
        Plan a crewed expedition to the Moon or Mars. Choose your spacecraft,
        assemble your crew, and make the decisions that bring them home.
      </p>
      <a
        className="text-link"
        href="https://www.spaceappschallenge.org/"
        target="_blank"
        rel="noreferrer"
      >
        NASA Space Apps <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
