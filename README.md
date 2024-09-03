# Language Breakdown
Language Breakdown addes a page to the Code Hub group that provides a breakdown of the languages of each repository.

## Preview
![](https://github.com/danilocolombi/language-breakdown/blob/main/documentation/images/extension-preview.png?raw=true)

## Install
The extension can be installed from [Azure DevOps Marketplace](https://marketplace.visualstudio.com/items?itemName=danilocolombi.language-breakdown).

## Technical Details
This extension utilizes the endpoint `https://dev.azure.com/{org}/{project}/_apis/projectanalysis/languagemetrics` to retrieve data. It processes this data to display the top 3 languages in a card format. Languages that account for less than 1% of the total are excluded from the display.

## Contributing
This project welcomes contributions and suggestions.

## License
this project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Other Extensions
I'm also author of the following extensions, which you might find useful:
- [Pipelines Monitor](https://marketplace.visualstudio.com/items?itemName=danilocolombi.pipelines-monitor)
- [Deployment Monitor (preview)](https://marketplace.visualstudio.com/items?itemName=danilocolombi.deployment-monitor)
