import type { ShotClassification } from "../classification/classification";
export function ShotInformation({ shot }: { shot: ShotClassification }) {
  return (
    <section className="shot-information" aria-label="Shot information">
      <dl>
        <div>
          <dt>Shot size</dt>
          <dd data-testid="shot-size">{shot.size}</dd>
        </div>
        <div>
          <dt>Camera angle</dt>
          <dd>
            {shot.angle}
            {shot.dutch ? " · Dutch angle" : ""}
          </dd>
        </div>
        <div>
          <dt>Viewpoint</dt>
          <dd>{shot.viewpoint}</dd>
        </div>
        <div>
          <dt>Composition</dt>
          <dd>{shot.composition}</dd>
        </div>
      </dl>
      <div className="lens-label">
        <strong>
          50<span>mm</span>
        </strong>
        <span>FULL FRAME</span>
      </div>
    </section>
  );
}
