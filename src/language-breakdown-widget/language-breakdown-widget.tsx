import "./language-breakdown-widget.scss";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import { Card } from "azure-devops-ui/Card";
import {
  ColumnSorting,
  ISimpleTableCell,
  ITableColumn,
  renderSimpleCell,
  sortItems,
  SortOrder,
  Table,
} from "azure-devops-ui/Table";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Observer } from "azure-devops-ui/Observer";
import { showRootComponent } from "../root";
import { getLanguageMetrics } from "../utility";
import { LanguageStatistics, ProjectLanguageAnalytics } from "azure-devops-extension-api/ProjectAnalysis/ProjectAnalysis";

interface ILanguageBreakdownWidgetState {
  title: string;
  metrics: ProjectLanguageAnalytics;
}

class LanguageBreakdownWidget extends React.Component<{}, ILanguageBreakdownWidgetState> implements Dashboard.IConfigurableWidget {

  componentDidMount() {
    SDK.init().then(() => {
      SDK.register("language-breakdown-widget", this);
    });
  }

  render(): JSX.Element {
    if (!this.state) {
      return <div></div>;
    }

    const { title, metrics } = this.state;

    console.log(metrics);

    if (!metrics) {
      return <div></div>;
    }

    const rawTableItems: ITableItem[] = metrics.repositoryLanguageAnalytics.map(repositoryLanguageAnalytics => ({
      name: repositoryLanguageAnalytics.name,
      languages: formatLanguages(repositoryLanguageAnalytics.languageBreakdown),
    }));

    const sortingBehavior = new ColumnSorting<ITableItem>(
      (columnIndex: number, proposedSortOrder: SortOrder) => {
        itemProvider.value = new ArrayItemProvider(
          sortItems(
            columnIndex,
            proposedSortOrder,
            sortFunctions,
            columns,
            rawTableItems
          )
        );
      }
    );

    const sortFunctions = [
      (item1: ITableItem, item2: ITableItem): number => {
        return item1.name.localeCompare(item2.name);
      },
      (item1: ITableItem, item2: ITableItem): number => {
        return item1.languages.localeCompare(item2.languages);
      }
    ];

    const itemProvider = new ObservableValue<ArrayItemProvider<ITableItem>>(
      new ArrayItemProvider(rawTableItems)
    );

    return (
      this.state && <Card className="flex-grow bolt-table-card" titleProps={{ text: title, ariaLevel: 3 }}>
        <Observer itemProvider={itemProvider}>
          {(observableProps: { itemProvider: ArrayItemProvider<ITableItem> }) => (
            <Table<ITableItem>
              ariaLabel="Pipelines Table"
              columns={columns}
              behaviors={[sortingBehavior]}
              itemProvider={observableProps.itemProvider}
              scrollable={true}
              role="table"
              pageSize={100}
              containerClassName="h-scroll-auto"
            />
          )}
        </Observer>
      </Card>
    );
  }

  async preload(_widgetSettings: Dashboard.WidgetSettings) {
    return Dashboard.WidgetStatusHelper.Success();
  }

  async load(widgetSettings: Dashboard.WidgetSettings): Promise<Dashboard.WidgetStatus> {
    try {
      await this.setStateFromWidgetSettings(widgetSettings);
      return Dashboard.WidgetStatusHelper.Success();
    } catch (e) {
      return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
    }
  }

  async reload(widgetSettings: Dashboard.WidgetSettings): Promise<Dashboard.WidgetStatus> {
    try {
      await this.setStateFromWidgetSettings(widgetSettings);
      return Dashboard.WidgetStatusHelper.Success();
    } catch (e) {
      return Dashboard.WidgetStatusHelper.Failure((e as any).toString());
    }
  }

  private async setStateFromWidgetSettings(widgetSettings: Dashboard.WidgetSettings) {
    try {
      const deserialized: ILanguageBreakdownWidgetSettings = JSON.parse(
        widgetSettings.customSettings.data
      ) ?? {};

      const metrics = await getLanguageMetrics();

      this.setState({ ...deserialized, title: widgetSettings.name, metrics });

    } catch (e) {
      console.log(e);
    }
  }
}

showRootComponent(<LanguageBreakdownWidget />);

export interface ITableItem extends ISimpleTableCell {
  name: string;
  languages: string;
}

const columns: ITableColumn<ITableItem>[] = [
  {
    id: "name",
    name: "Repository Name",
    readonly: true,
    renderCell: renderSimpleCell,
    sortProps: {
      ariaLabelAscending: "Sorted A to Z",
      ariaLabelDescending: "Sorted Z to A",
    },
    width: new ObservableValue(-50),
  },
  {
    id: "languages",
    name: "Languages",
    readonly: true,
    renderCell: renderSimpleCell,
    sortProps: {
      ariaLabelAscending: "Sorted A to Z",
      ariaLabelDescending: "Sorted Z to A",
    },
    width: new ObservableValue(-50),
  }
];

function formatLanguages(languages: LanguageStatistics[]) {
  if (!languages || languages.length === 0) {
    return "Not defined";
  }

  return languages
    .sort((a, b) => b.languagePercentage - a.languagePercentage)
    .filter(language => language.languagePercentage > 1)
    .map(language => language.name).join(", ");
}
