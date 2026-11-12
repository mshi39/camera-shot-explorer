import type { ShotClassification } from "../classification/classification";
import { useTranslation } from "../i18n";
export function ShotInformation({ shot }: { shot: ShotClassification }) {
  const t = useTranslation();
  return (
    <section className="shot-information" aria-label={t("Shot information")}>
      <dl>
        <div>
          <dt>{t("Shot size")}</dt>
          <dd data-testid="shot-size">{t(shot.size)}</dd>
        </div>
        <div>
          <dt>{t("Camera level")}</dt>
          <dd>
            {t(shot.angle)}
            {shot.dutch ? ` · ${t("Dutch angle")}` : ""}
          </dd>
        </div>
        <div>
          <dt>{t("Viewpoint")}</dt>
          <dd>{t(shot.viewpoint)}</dd>
        </div>
        <div>
          <dt>{t("Composition")}</dt>
          <dd>{t(shot.composition)}</dd>
        </div>
      </dl>
      <div className="lens-label">
        <strong>
          50<span>mm</span>
        </strong>
        <span>{t("FULL FRAME")}</span>
      </div>
    </section>
  );
}
