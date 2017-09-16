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
	};
		
	interface ScrollyViewModel {
		scrollyDataPoints: ScrollyDataPoint[];
	};
		
	function visualTransform(options: VisualUpdateOptions, host: IVisualHost): any {
		let dataViews = options.dataViews;
		//console.log('visualTransform', dataViews);
		
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
				scrollText: scrollTextCategory.values[i].toString(),
				imageUrl: imageCategory.values[i].toString()
			});
		}
		
		//console.log('sc', scDataPoints);
		
		return {
			scrollyDataPoints: scDataPoints
		};
	};
		
    export class Visual implements IVisual {
        private target: HTMLElement;
		private host: IVisualHost;
        private settings: VisualSettings;
        private textNode: Text;
		
        constructor(options: VisualConstructorOptions) {
            //console.log('Visual constructor', options);
            this.target = options.element;
            this.target.innerHTML = `<div class="wrapper" id="loader"></div>`;
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            //console.log('Visual update', options);
			
			let viewModel: ScrollyViewModel = visualTransform(options, this.host);
			//console.log('ViewModel', viewModel);
			
			var data = viewModel.scrollyDataPoints;
			
			var container = document.getElementById("loader");
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			
			for(var i=0; i < data.length; i++){
				var el =  document.createElement("section");
				el.classList.add("div-" + i);
				if(i % 2 === 0){
					el.classList.add("section");
					el.classList.add("parallax");
					el.style.backgroundImage = "url('" + data[i].imageUrl + "')";
					el.style.backgroundRepeat = "no-repeat";
					el.style.backgroundSize = "100%";
					el.style.transform = "translateZ(-1px) scale(1.5)";
					el.style.filter = "grayscale(1)";
					el.style.webkitFilter = "grayscale(1)";
				}
				else{
					el.classList.add("section");
					el.style.backgroundImage = "url('" + data[i].imageUrl + "')";
					el.style.backgroundRepeat = "no-repeat";
					el.style.backgroundSize = "100%";
				}
				container.appendChild(el);
				
				var h = document.createElement("h1");
				h.innerHTML = data[i].scrollText;
				el.classList.add("scrollyText");
				el.appendChild(h);
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