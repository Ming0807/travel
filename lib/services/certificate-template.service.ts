import "server-only";

import { listActiveCertificateTemplatesForAttraction } from "@/lib/repositories/certificate-template.repository";
import type { CertificateTemplateLayout } from "@/lib/certificate/certificate-template-layout";

export type CertificateTemplateCandidate = {
  templateId: number;
  templateName: string;
  attractionId: number | null;
  backgroundPath: string | null;
  layoutConfig: CertificateTemplateLayout;
  language: string;
  isDefault: boolean;
  orientation: "landscape" | "portrait";
};

type ResolveTemplateParams = {
  attractionId: number;
  language: "th" | "en";
  requestedTemplateId?: number;
};

export class CertificateTemplateResolutionError extends Error {
  readonly code = "CERTIFICATE_TEMPLATE_NOT_FOUND";

  constructor() {
    super("CERTIFICATE_TEMPLATE_NOT_FOUND");
    this.name = "CertificateTemplateResolutionError";
  }
}

function languageRank(language: string, preferredLanguage: "th" | "en") {
  if (language === preferredLanguage) return 0;
  if (language === "th") return 1;
  return 2;
}

function compareTemplates(
  left: CertificateTemplateCandidate,
  right: CertificateTemplateCandidate,
  preferredLanguage: "th" | "en",
) {
  const languageDifference =
    languageRank(left.language, preferredLanguage) - languageRank(right.language, preferredLanguage);
  if (languageDifference !== 0) return languageDifference;

  const scopeDifference = Number(left.attractionId === null) - Number(right.attractionId === null);
  if (scopeDifference !== 0) return scopeDifference;

  const defaultDifference = Number(!left.isDefault) - Number(!right.isDefault);
  if (defaultDifference !== 0) return defaultDifference;
  return left.templateId - right.templateId;
}

export function selectCertificateTemplate(
  candidates: CertificateTemplateCandidate[],
  params: ResolveTemplateParams
): CertificateTemplateCandidate {
  const eligible = candidates.filter(
    (template) => template.attractionId === null || template.attractionId === params.attractionId
  );

  if (params.requestedTemplateId !== undefined) {
    const requested = eligible.find(
      (template) => template.templateId === params.requestedTemplateId
    );
    if (!requested) throw new CertificateTemplateResolutionError();
    return requested;
  }

  const selected = [...eligible].sort((left, right) => {
    return compareTemplates(left, right, params.language);
  })[0];

  if (!selected) throw new CertificateTemplateResolutionError();
  return selected;
}

export function buildCertificateTemplateSelection(
  candidates: CertificateTemplateCandidate[],
  params: ResolveTemplateParams,
) {
  const selected = selectCertificateTemplate(candidates, params);
  const options = candidates
    .filter(
      (template) =>
        (template.attractionId === null || template.attractionId === params.attractionId) &&
        (template.language === params.language || (params.language === "en" && template.language === "th")),
    )
    .sort((left, right) => compareTemplates(left, right, params.language));

  return {
    selected,
    options: [selected, ...options.filter((template) => template.templateId !== selected.templateId)],
  };
}

export async function getCertificateTemplateSelection(params: ResolveTemplateParams) {
  const templates = await listActiveCertificateTemplatesForAttraction(params.attractionId);
  return buildCertificateTemplateSelection(templates, params);
}

export async function resolveCertificateTemplate(
  params: ResolveTemplateParams
): Promise<CertificateTemplateCandidate> {
  return (await getCertificateTemplateSelection(params)).selected;
}
