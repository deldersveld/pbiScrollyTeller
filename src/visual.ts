/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) 2017 by David Eldersveld
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";

    import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
    import DataRoleHelper = powerbi.extensibility.utils.dataview.DataRoleHelper;

    interface ScrollyDataPoint {
        scrollText: string;
        imageUrl: string;
    }

    interface ScrollyViewModel {
        scrollyDataPoints: ScrollyDataPoint[];
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): any {
        let dataViews = options.dataViews;
        // console.log('visualTransform', dataViews);

        let viewModel: ScrollyViewModel = {
            scrollyDataPoints: []
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source)
            return viewModel;

        let categorical = dataViews[0].categorical;

        let scrollTextIndex = DataRoleHelper.getCategoryIndexOfRole(dataViews[0].categorical.categories, "category");
        let imageIndex = DataRoleHelper.getCategoryIndexOfRole(dataViews[0].categorical.categories, "imageUrl");

        let scrollTextCategory = categorical.categories[scrollTextIndex];
        let imageCategory = categorical.categories[imageIndex];

        let scDataPoints: ScrollyDataPoint[] = [];

        for (let i = 0; i < scrollTextCategory.values.length; i++) {
            scDataPoints.push({
                scrollText: scrollTextIndex === -1 ? "Add field to Text -->" : scrollTextCategory.values[i].toString(),
                imageUrl: imageIndex === -1 ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh9NPZZrS45zHvMPX-moeDysqUZ4Mnx5xnMA-8Iqx_wXjYteCkLg" : imageCategory.values[i].toString()
            });
        }

        // console.log('sc', scDataPoints);

        return {
        scrollyDataPoints: scDataPoints
        };
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private host: IVisualHost;
        private settings: VisualSettings;
        private textNode: Text;

        constructor(options: VisualConstructorOptions) {
            // console.log('Visual constructor', options);
            this.target = options.element;
            this.target.innerHTML = `<div class="wrapper" id="loader"></div>`;
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            // console.log('Visual update', options);
            // console.log('Visual settings', this.settings);

            let optionFontSize = this.settings.dataPoint.fontSize.toString() + "px";
            let optionFontColor = this.settings.dataPoint.fontColor;
            let optionFontFamily = this.settings.dataPoint.fontFamily;
            let optionFontWeight = this.settings.dataPoint.fontWeight;
            let optionTextAlign = this.settings.dataPoint.textAlign;
            let optionWordWrap = this.settings.dataPoint.wordWrap;

            let viewModel: ScrollyViewModel = visualTransform(options, this.host);
            // console.log('ViewModel', viewModel);

            let data = viewModel.scrollyDataPoints;

            let container = document.getElementById("loader");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            for (let i = 0; i < data.length; i++) {
                let customImage =  document.createElement("section");
                customImage.classList.add("img-" + i);
                customImage.classList.add("section");
                customImage.classList.add("parallax");
                customImage.style.backgroundImage = "url('" + data[i].imageUrl + "')";
                customImage.style.backgroundRepeat = "no-repeat";
                customImage.style.backgroundSize = "100%";
                customImage.style.transform = "translateZ(-1px) scale(1.5)";

                let story =  document.createElement("section");
                story.classList.add("story");
                story.style.backgroundImage = "url('" + data[i].imageUrl + "')";
                story.style.backgroundRepeat = "no-repeat";
                story.style.backgroundSize = "50vh";
                story.style.backgroundPosition = "left";

                let textPane = document.createElement("div");
                textPane.classList.add("text-pane");

                container.appendChild(customImage);
                container.appendChild(story);

                let scrollText = document.createElement("h1");
                scrollText.innerHTML = data[i].scrollText;
                scrollText.classList.add("scrollyText");
                scrollText.style.color = optionFontColor;
                scrollText.style.fontSize = optionFontSize;
                scrollText.style.fontFamily = optionFontFamily;
                scrollText.style.fontWeight = optionFontWeight;
                scrollText.style.textAlign = optionTextAlign;
                scrollText.style.wordWrap = optionWordWrap;

                textPane.appendChild(scrollText);
                story.appendChild(textPane);
            }
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}