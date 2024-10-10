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
import { ProjectLanguageAnalytics } from "azure-devops-extension-api/ProjectAnalysis/ProjectAnalysis";

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



    const rawTableItems: ITableItem[] = metrics.repositoryLanguageAnalytics.map(repositoryLanguageAnalytics => {
      const filteredLanguages = repositoryLanguageAnalytics.languageBreakdown
        .sort((a, b) => b.languagePercentage - a.languagePercentage)
        .filter(language => language.languagePercentage > 1);

      const language1 = filteredLanguages.length > 0 ? filteredLanguages[0].name + " " + filteredLanguages[0].languagePercentage + "%" : '-'
      const language2 = filteredLanguages.length > 1 ? filteredLanguages[1].name + " " + filteredLanguages[1].languagePercentage + "%" : '-';
      const language3 = filteredLanguages.length > 2 ? filteredLanguages[2].name + " " + filteredLanguages[2].languagePercentage + "%" : '-';

      return {
        name: repositoryLanguageAnalytics.name,
        language1: language1,
        language2: language2,
        language3: language3,
      }
    });

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
        return item1.language1.localeCompare(item2.language1);
      },
       (item1: ITableItem, item2: ITableItem): number => {
        return item1.language2.localeCompare(item2.language2);
      },
      (item1: ITableItem, item2: ITableItem): number => {
        return item1.language3.localeCompare(item2.language3);
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
  language1: string;
  language2: string;
  language3: string;
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
    width: new ObservableValue(-35),
  },
  {
    id: "language1",
    name: "Language 1",
    readonly: true,
    renderCell: renderSimpleCell,
    sortProps: {
      ariaLabelAscending: "Sorted A to Z",
      ariaLabelDescending: "Sorted Z to A",
    },
    width: new ObservableValue(-21),
  },
  {
    id: "language2",
    name: "Language 2",
    readonly: true,
    renderCell: renderSimpleCell,
    sortProps: {
      ariaLabelAscending: "Sorted A to Z",
      ariaLabelDescending: "Sorted Z to A",
    },
    width: new ObservableValue(-21),
  },
  {
    id: "language3",
    name: "Language 3",
    readonly: true,
    renderCell: renderSimpleCell,
    sortProps: {
      ariaLabelAscending: "Sorted A to Z",
      ariaLabelDescending: "Sorted Z to A",
    },
    width: new ObservableValue(-21),
  }
];
