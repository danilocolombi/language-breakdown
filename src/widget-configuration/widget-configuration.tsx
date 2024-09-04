import "./widget-configuration.scss";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import { showRootComponent } from "../root";

interface ISampleWidgetConfigState {
}

class SampleWidgetConfig
  extends React.Component<{}, ISampleWidgetConfigState>
  implements Dashboard.IWidgetConfiguration {
  private widgetConfigurationContext?: Dashboard.IWidgetConfigurationContext;
  private settings: ILanguageBreakdownWidgetSettings = {} as ILanguageBreakdownWidgetSettings;

  componentDidMount() {
    SDK.init().then(() => {
      SDK.register("language-widget.config", this);
      SDK.resize(400, 200);
    });
  }

  render(): JSX.Element {

    return (
        <div className="content">
        </div>
    );
  }

  private async updateSettingsAndNotify(
    partialSettings: Partial<ILanguageBreakdownWidgetSettings>
  ) {
    this.settings = { ...this.settings, ...partialSettings };
    const customSettings = this.serializeWidgetSettings(this.settings);
    await this.widgetConfigurationContext?.notify(
      Dashboard.ConfigurationEvent.ConfigurationChange,
      Dashboard.ConfigurationEvent.Args(customSettings)
    );
  }

  private serializeWidgetSettings(
    settings: ILanguageBreakdownWidgetSettings
  ): Dashboard.CustomSettings {
    return {
      data: JSON.stringify(settings),
      version: { major: 1, minor: 0, patch: 0 },
    };
  }

  private async setStateFromWidgetSettings(
    widgetSettings: Dashboard.WidgetSettings
  ) {
    const deserialized: ILanguageBreakdownWidgetSettings | null = JSON.parse(
      widgetSettings.customSettings.data
    )

    if (deserialized) {
      this.settings = deserialized;
    }
  }

  private async validateSettings(): Promise<boolean> {

    return true;
  }

  async load(widgetSettings: Dashboard.WidgetSettings, widgetConfigurationContext: Dashboard.IWidgetConfigurationContext): Promise<Dashboard.WidgetStatus> {
    this.widgetConfigurationContext = widgetConfigurationContext;

    await this.setStateFromWidgetSettings(widgetSettings);
    return Dashboard.WidgetStatusHelper.Success();
  }

  async onSave(): Promise<Dashboard.SaveStatus> {
    // ensure new settings values are valid; set error state for the UI at the same time
    if (!(await this.validateSettings())) {
      return Dashboard.WidgetConfigurationSave.Invalid();
    }
    // persist new settings
    return Dashboard.WidgetConfigurationSave.Valid(
      this.serializeWidgetSettings(this.settings)
    );
  }
}

showRootComponent(<SampleWidgetConfig />);
