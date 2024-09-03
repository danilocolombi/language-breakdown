import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IProjectPageService,
  getClient,
} from "azure-devops-extension-api";
import { ProjectAnalysisRestClient } from "azure-devops-extension-api/ProjectAnalysis/ProjectAnalysisClient";
import { ProjectLanguageAnalytics } from "azure-devops-extension-api/ProjectAnalysis/ProjectAnalysis";

async function getCurrentProjectId(): Promise<string | undefined> {
  const pps = await SDK.getService<IProjectPageService>(
    CommonServiceIds.ProjectPageService
  );
  const project = await pps.getProject();
  return project?.id;
}

export async function getLanguageMetrics(): Promise<ProjectLanguageAnalytics> {
  const projectId = await getCurrentProjectId();
  const projectLanguageAnalytics = await getClient(
    ProjectAnalysisRestClient
  ).getProjectLanguageAnalytics(projectId!);

  return projectLanguageAnalytics;
}
