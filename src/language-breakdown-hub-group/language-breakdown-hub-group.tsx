import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./language-breakdown-hub-group.scss";

import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";

import { showRootComponent } from "../root";
import { getLanguageMetrics } from "../utility";
import { ProjectLanguageAnalytics } from "azure-devops-extension-api/ProjectAnalysis/ProjectAnalysis";
import { Card } from "azure-devops-ui/Card";

interface ILanguageBreakdownHubGroup {
    metrics: ProjectLanguageAnalytics;
}

class LanguageBreakdownHubGroup extends React.Component<{}, ILanguageBreakdownHubGroup> {

    constructor(props: {}) {
        super(props);
    }

    public componentDidMount() {
        try {
            SDK.init();

            SDK.ready().then(() => {
                this.loadMetrics();
            }).catch((error) => {
                console.error("SDK ready failed: ", error);
            });
        } catch (error) {
            console.error("Error during SDK initialization or project context loading: ", error);
        }
    }

    public render(): JSX.Element {

        if (!this.state) {
            return <div></div>;
        }
        const { metrics } = this.state;

        const metricCards = metrics.repositoryLanguageAnalytics.map((repositoryLanguageAnalytics) => {
            return <Card className="bolt-card-white" key={repositoryLanguageAnalytics.name} titleProps={{ text: repositoryLanguageAnalytics.name, ariaLevel: 3, }}>
                <div className="flex-row" style={{ flexWrap: "wrap" }} >
                    {repositoryLanguageAnalytics.languageBreakdown.filter(item => item.languagePercentage > 1).map((items, index) => {
                        if (index > 2) {
                            return null;
                        }
                        return <div className="flex-column" style={{ minWidth: "120px" }} key={index}>
                            <div className="body-m secondary-text">{items.name}</div>
                            <div className="body-m primary-text">{items.languagePercentage}%</div>
                        </div>

                    })}
                </div>
            </Card>
        });

        const title = `Language Breakdown (${metrics.repositoryLanguageAnalytics.length ?? 0})`;

        return (
            <Page className="flex-grow">
                <Header title={title} className="bolt-header-title title-m l" />
                <div className="page-content">
                    <div className="metrics-section">
                        {metricCards}
                    </div>
                </div>
            </Page>
        );
    }

    private async loadMetrics(): Promise<void> {
        try {
            const metrics = await getLanguageMetrics();
            console.log(metrics);

            this.setState({ metrics });

            SDK.notifyLoadSucceeded();
        } catch (error) {
            console.error("Failed to load project context: ", error);
        }
    }
}

showRootComponent(<LanguageBreakdownHubGroup />);