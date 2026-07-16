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
    const languageDifference =
      languageRank(left.language, params.language) - languageRank(right.language, params.language);
    if (languageDifference !== 0) return languageDifference;

    const scopeDifference = Number(left.attractionId === null) - Number(right.attractionId === null);
    if (scopeDifference !== 0) return scopeDifference;

    const defaultDifference = Number(!left.isDefault) - Number(!right.isDefault);
    if (defaultDifference !== 0) return defaultDifference;
    return left.templateId - right.templateId;
  })[0];

  if (!selected) throw new CertificateTemplateResolutionError();
  return selected;
}

export async function resolveCertificateTemplate(
  params: ResolveTemplateParams
): Promise<CertificateTemplateCandidate> {
  const templates = await listActiveCertificateTemplatesForAttraction(params.attractionId);
  return selectCertificateTemplate(templates, params);
}
